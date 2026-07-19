import type { AvailableSlot } from '@invincible/types';
import { AppError } from '@invincible/utils';
import { generateAvailableSlots, type Interval } from '@invincible/utils';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { toEngineEventType, toEngineSchedule } from './availability.mapper';

const scheduleInclude = {
  rules: true,
  overrides: { include: { intervals: true } },
};

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Compute bookable slots for an event type between two calendar dates
   * (schedule-zone). Combines the host's confirmed bookings (as busy time) and
   * per-slot seat usage (for GROUP events) with the pure availability engine.
   */
  async getSlots(
    eventTypeId: string,
    fromDate: string,
    toDate: string,
    now: Date = new Date(),
  ): Promise<AvailableSlot[]> {
    const eventType = await this.prisma.eventType.findFirst({
      where: { id: eventTypeId, isActive: true, deletedAt: null },
      include: { schedule: { include: scheduleInclude } },
    });
    if (!eventType) throw AppError.notFound('Event type', eventTypeId);

    // A generous absolute window covering the requested dates for the booking query.
    const rangeStart = new Date(`${fromDate}T00:00:00.000Z`);
    const rangeEnd = new Date(`${toDate}T23:59:59.999Z`);
    // Pad by one day each side to be safe across timezone offsets.
    rangeStart.setUTCDate(rangeStart.getUTCDate() - 1);
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startTime: { gte: rangeStart, lte: rangeEnd },
        eventType: { ownerId: eventType.ownerId },
      },
      select: { eventTypeId: true, startTime: true, endTime: true },
    });

    const busyIntervals: Interval[] = [];
    const seatMap = new Map<string, number>();
    for (const booking of bookings) {
      if (booking.eventTypeId === eventTypeId) {
        const key = booking.startTime.toISOString();
        seatMap.set(key, (seatMap.get(key) ?? 0) + 1);
      } else {
        busyIntervals.push({ start: booking.startTime, end: booking.endTime });
      }
    }

    const slots = generateAvailableSlots({
      now,
      fromDate,
      toDate,
      eventType: toEngineEventType(eventType),
      schedule: toEngineSchedule(eventType.schedule),
      busyIntervals,
      seatMap,
    });

    return slots.map((slot) => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      seatsRemaining: slot.seatsRemaining,
    }));
  }
}
