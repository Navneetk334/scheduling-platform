import { randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { AppError, addMinutes, fromISO } from '@invincible/utils';
import type { CreateBookingInput } from '@invincible/utils';
import type { Prisma } from '@invincible/database';

import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { AvailabilityService } from '../availability/availability.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly availability: AvailabilityService,
  ) {}

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
      include: { availability: true, locationLinks: { include: { location: true } } },
    });
    if (!meetingType) throw AppError.notFound('Meeting type', input.meetingTypeId);

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
      return await this.prisma.$transaction(async (tx) => {
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
            assignedHostId: meetingType.ownerId,
            locationId,
            status: 'CONFIRMED',
            startTime: start,
            endTime: end,
            timeZone: input.invitee.timeZone,
            reference: await this.generateReference(tx),
            idempotencyKey: input.idempotencyKey ?? null,
            notes: input.invitee.notes ?? null,
            guests: { create: guests },
            hosts: { create: [{ userId: meetingType.ownerId, role: 'ORGANIZER' }] },
          },
          include: { guests: true },
        });
      });
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

  async cancelByReference(reference: string, reason?: string) {
    const booking = await this.getByReference(reference);
    if (booking.status === 'CANCELLED') return booking;
    return this.prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED', cancelReason: reason ?? null, cancelledAt: new Date() },
      include: { guests: true },
    });
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
