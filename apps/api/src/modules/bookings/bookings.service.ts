import { randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { AppError, addMinutes, fromISO } from '@invincible/utils';
import type { CreateBookingInput } from '@invincible/utils';
import type { Prisma } from '@invincible/database';

import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { WebhookEvent } from '../../webhooks/webhook-events';
import { WebhooksService } from '../../webhooks/webhooks.service';
import { AvailabilityService } from '../availability/availability.service';

interface BookingEventShape {
  id: string;
  organizationId: string;
  meetingTypeId: string;
  reference: string;
  status: string;
  startTime: Date;
  endTime: Date;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly availability: AvailabilityService,
    private readonly webhooks: WebhooksService,
  ) {}

  private emit(event: string, booking: BookingEventShape): void {
    void this.webhooks.dispatch(booking.organizationId, event, {
      id: booking.id,
      reference: booking.reference,
      status: booking.status,
      meetingTypeId: booking.meetingTypeId,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
    });
  }

  /**
   * Create a booking with strong protection against double-booking:
   *  1. Idempotency short-circuit on the client-supplied key.
   *  2. Engine re-validation of the requested slot (notice, hours, buffers).
   *  3. Distributed lock on (meetingType, startTime) to serialize contenders.
   *  4. Transactional seat re-check before insert.
   */
  async create(input: CreateBookingInput, now: Date = new Date()) {
    if (input.idempotencyKey) {
      const existing = await this.prisma.booking.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { guests: true },
      });
      if (existing) return existing;
    }

    const meetingType = await this.prisma.meetingType.findFirst({
      where: { id: input.meetingTypeId, isActive: true, deletedAt: null },
      include: {
        availability: true,
        locationLinks: { include: { location: true } },
        hosts: { select: { userId: true } },
      },
    });
    if (!meetingType) throw AppError.notFound('Meeting type', input.meetingTypeId);

    // Resolve the host: honor a valid requested staff member, else the owner.
    const hostIds = new Set([meetingType.ownerId, ...meetingType.hosts.map((h) => h.userId)]);
    const assignedHostId =
      input.hostId && hostIds.has(input.hostId) ? input.hostId : meetingType.ownerId;

    const start = fromISO(input.startTime);
    const end = addMinutes(start, meetingType.durationMinutes);

    // Re-validate against live availability for the slot's date (host zone).
    const dateInZone = new Intl.DateTimeFormat('en-CA', {
      timeZone: meetingType.availability.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(start);

    const slots = await this.availability.getSlots(meetingType.id, dateInZone, dateInZone, now);
    const match = slots.find((s) => new Date(s.start).getTime() === start.getTime());
    if (!match || match.seatsRemaining <= 0) {
      throw AppError.slotUnavailable();
    }

    const lockKey = `booking:lock:${meetingType.id}:${start.toISOString()}`;
    const release = await this.redis.acquireLock(lockKey, 10_000);
    if (!release) {
      throw AppError.slotUnavailable('This slot is currently being booked by someone else.');
    }

    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        const confirmedCount = await tx.booking.count({
          where: { meetingTypeId: meetingType.id, startTime: start, status: 'CONFIRMED' },
        });
        if (confirmedCount >= meetingType.seatsPerSlot) {
          throw AppError.slotUnavailable();
        }

        const locationId = meetingType.locationLinks[0]?.location.id ?? null;

        const guests: Prisma.GuestCreateWithoutBookingInput[] = [
          {
            role: 'INVITEE',
            name: input.invitee.name,
            email: input.invitee.email,
            phone: input.invitee.phone ?? null,
            timeZone: input.invitee.timeZone,
            isPrimary: true,
          },
          ...input.guests.map((g) => ({
            role: 'GUEST' as const,
            name: g.name,
            email: g.email,
            timeZone: input.invitee.timeZone,
          })),
        ];

        return tx.booking.create({
          data: {
            organizationId: meetingType.organizationId,
            meetingTypeId: meetingType.id,
            assignedHostId,
            locationId,
            status: 'CONFIRMED',
            startTime: start,
            endTime: end,
            timeZone: input.invitee.timeZone,
            reference: await this.generateReference(tx),
            idempotencyKey: input.idempotencyKey ?? null,
            notes: input.invitee.notes ?? null,
            guests: { create: guests },
            hosts: { create: [{ userId: assignedHostId, role: 'ORGANIZER' }] },
          },
          include: { guests: true },
        });
      });
      this.emit(WebhookEvent.BookingCreated, booking);
      return booking;
    } finally {
      await release();
    }
  }

  async getByReference(reference: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { reference },
      include: {
        guests: true,
        meetingType: { include: { locationLinks: { include: { location: true } } } },
      },
    });
    if (!booking) throw AppError.notFound('Booking', reference);
    return booking;
  }

  /**
   * Reschedule a booking to a new start time: validates the new slot, marks the
   * original as RESCHEDULED, and creates a linked replacement booking
   * (preserving guests, host, and location) — all atomically and lock-guarded.
   */
  async rescheduleByReference(reference: string, startTime: string, now: Date = new Date()) {
    const original = await this.prisma.booking.findUnique({
      where: { reference },
      include: {
        guests: true,
        meetingType: { include: { availability: true } },
      },
    });
    if (!original) throw AppError.notFound('Booking', reference);
    if (original.status === 'CANCELLED') {
      throw AppError.conflict('A cancelled booking cannot be rescheduled.');
    }

    const meetingType = original.meetingType;
    const start = fromISO(startTime);
    const end = addMinutes(start, meetingType.durationMinutes);

    const dateInZone = new Intl.DateTimeFormat('en-CA', {
      timeZone: meetingType.availability.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(start);

    const slots = await this.availability.getSlots(meetingType.id, dateInZone, dateInZone, now);
    const match = slots.find((s) => new Date(s.start).getTime() === start.getTime());
    if (!match || match.seatsRemaining <= 0) {
      throw AppError.slotUnavailable();
    }

    const lockKey = `booking:lock:${meetingType.id}:${start.toISOString()}`;
    const release = await this.redis.acquireLock(lockKey, 10_000);
    if (!release) {
      throw AppError.slotUnavailable('This slot is currently being booked by someone else.');
    }

    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        const confirmedCount = await tx.booking.count({
          where: { meetingTypeId: meetingType.id, startTime: start, status: 'CONFIRMED' },
        });
        if (confirmedCount >= meetingType.seatsPerSlot) {
          throw AppError.slotUnavailable();
        }

        await tx.booking.update({
          where: { id: original.id },
          data: { status: 'RESCHEDULED' },
        });

        return tx.booking.create({
          data: {
            organizationId: original.organizationId,
            meetingTypeId: meetingType.id,
            assignedHostId: original.assignedHostId,
            locationId: original.locationId,
            status: 'CONFIRMED',
            startTime: start,
            endTime: end,
            timeZone: original.timeZone,
            reference: await this.generateReference(tx),
            notes: original.notes,
            rescheduledFromId: original.id,
            guests: {
              create: original.guests.map((g) => ({
                role: g.role,
                name: g.name,
                email: g.email,
                phone: g.phone,
                timeZone: g.timeZone,
                isPrimary: g.isPrimary,
              })),
            },
            hosts: original.assignedHostId
              ? { create: [{ userId: original.assignedHostId, role: 'ORGANIZER' as const }] }
              : undefined,
          },
          include: { guests: true },
        });
      });
      this.emit(WebhookEvent.BookingRescheduled, booking);
      return booking;
    } finally {
      await release();
    }
  }

  async cancelByReference(reference: string, reason?: string) {
    const existing = await this.getByReference(reference);
    if (existing.status === 'CANCELLED') return existing;
    const booking = await this.prisma.booking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancelReason: reason ?? null, cancelledAt: new Date() },
      include: { guests: true },
    });
    this.emit(WebhookEvent.BookingCancelled, booking);
    return booking;
  }

  listForOrganization(organizationId: string, options: { upcoming?: boolean } = {}) {
    return this.prisma.booking.findMany({
      where: {
        organizationId,
        ...(options.upcoming ? { startTime: { gte: new Date() } } : {}),
      },
      include: { guests: true, meetingType: true },
      orderBy: { startTime: 'asc' },
      take: 200,
    });
  }

  private async generateReference(
    tx: Prisma.TransactionClient,
    attempts = 5,
  ): Promise<string> {
    for (let i = 0; i < attempts; i += 1) {
      const code = `INV-${randomBytes(4).toString('hex').toUpperCase()}`;
      const clash = await tx.booking.findUnique({ where: { reference: code } });
      if (!clash) return code;
    }
    throw new AppError('INTERNAL_ERROR', 'Could not allocate a unique booking reference.');
  }
}
