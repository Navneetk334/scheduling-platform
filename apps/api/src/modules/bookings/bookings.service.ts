import { randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { AppError, ErrorCode, addMinutes, fromISO } from '@invincible/utils';
import type { CreateBookingInput } from '@invincible/utils';

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
   *  3. Distributed lock on (eventType, startTime) to serialize contenders.
   *  4. Transactional seat re-check before insert.
   */
  async create(input: CreateBookingInput, now: Date = new Date()) {
    if (input.idempotencyKey) {
      const existing = await this.prisma.booking.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { attendees: true },
      });
      if (existing) return existing;
    }

    const eventType = await this.prisma.eventType.findFirst({
      where: { id: input.eventTypeId, isActive: true, deletedAt: null },
      include: { schedule: true, locations: true },
    });
    if (!eventType) throw AppError.notFound('Event type', input.eventTypeId);

    const start = fromISO(input.startTime);
    const end = addMinutes(start, eventType.durationMinutes);

    // Re-validate against live availability for the slot's date.
    const dateInZone = new Intl.DateTimeFormat('en-CA', {
      timeZone: eventType.schedule.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(start);

    const slots = await this.availability.getSlots(eventType.id, dateInZone, dateInZone, now);
    const match = slots.find((s) => new Date(s.start).getTime() === start.getTime());
    if (!match || match.seatsRemaining <= 0) {
      throw AppError.slotUnavailable();
    }

    const lockKey = `booking:lock:${eventType.id}:${start.toISOString()}`;
    const release = await this.redis.acquireLock(lockKey, 10_000);
    if (!release) {
      throw AppError.slotUnavailable('This slot is currently being booked by someone else.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const confirmedCount = await tx.booking.count({
          where: { eventTypeId: eventType.id, startTime: start, status: 'CONFIRMED' },
        });
        if (confirmedCount >= eventType.seatsPerSlot) {
          throw AppError.slotUnavailable();
        }

        const location = eventType.locations[0] ?? null;

        return tx.booking.create({
          data: {
            organizationId: eventType.organizationId,
            eventTypeId: eventType.id,
            status: 'CONFIRMED',
            startTime: start,
            endTime: end,
            timeZone: input.invitee.timeZone,
            reference: await this.generateReference(tx),
            idempotencyKey: input.idempotencyKey ?? null,
            notes: input.invitee.notes ?? null,
            location: location ? { type: location.type, value: location.value } : undefined,
            attendees: {
              create: [
                {
                  role: 'INVITEE',
                  name: input.invitee.name,
                  email: input.invitee.email,
                  timeZone: input.invitee.timeZone,
                },
                ...input.guests.map((g) => ({
                  role: 'GUEST' as const,
                  name: g.name,
                  email: g.email,
                  timeZone: input.invitee.timeZone,
                })),
              ],
            },
          },
          include: { attendees: true },
        });
      });
    } finally {
      await release();
    }
  }

  async getByReference(reference: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { reference },
      include: { attendees: true, eventType: { include: { locations: true } } },
    });
    if (!booking) throw AppError.notFound('Booking', reference);
    return booking;
  }

  async cancelByReference(reference: string, reason?: string) {
    const booking = await this.getByReference(reference);
    if (booking.status === 'CANCELLED') return booking;
    return this.prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED', cancelReason: reason ?? null },
      include: { attendees: true },
    });
  }

  listForOrganization(organizationId: string, options: { upcoming?: boolean } = {}) {
    return this.prisma.booking.findMany({
      where: {
        organizationId,
        ...(options.upcoming ? { startTime: { gte: new Date() } } : {}),
      },
      include: { attendees: true, eventType: true },
      orderBy: { startTime: 'asc' },
      take: 200,
    });
  }

  private async generateReference(
    tx: Pick<PrismaService, 'booking'>,
    attempts = 5,
  ): Promise<string> {
    for (let i = 0; i < attempts; i += 1) {
      const code = `INV-${randomBytes(4).toString('hex').toUpperCase()}`;
      const clash = await tx.booking.findUnique({ where: { reference: code } });
      if (!clash) return code;
    }
    throw new AppError(ErrorCode.Internal, 'Could not allocate a unique booking reference.');
  }
}
