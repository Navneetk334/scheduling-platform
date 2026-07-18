import { Injectable } from '@nestjs/common';
import { AppError, slugify } from '@invincible/utils';
import type {
  CreateEventTypeInput,
  UpdateEventTypeInput,
} from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventTypesService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string) {
    return this.prisma.eventType.findMany({
      where: { organizationId, deletedAt: null },
      include: { locations: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(organizationId: string, id: string) {
    const eventType = await this.prisma.eventType.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: { locations: true, schedule: true },
    });
    if (!eventType) throw AppError.notFound('Event type', id);
    return eventType;
  }

  async create(organizationId: string, ownerId: string, input: CreateEventTypeInput) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id: input.scheduleId, organizationId },
    });
    if (!schedule) throw AppError.notFound('Schedule', input.scheduleId);

    const slug = await this.ensureUniqueSlug(organizationId, input.slug ?? slugify(input.title));

    return this.prisma.eventType.create({
      data: {
        organizationId,
        ownerId,
        scheduleId: input.scheduleId,
        kind: input.kind,
        title: input.title,
        slug,
        description: input.description,
        durationMinutes: input.durationMinutes,
        bufferBeforeMinutes: input.bufferBeforeMinutes,
        bufferAfterMinutes: input.bufferAfterMinutes,
        minimumNoticeMinutes: input.minimumNoticeMinutes,
        bookingWindowDays: input.bookingWindowDays,
        slotIntervalMinutes: input.slotIntervalMinutes,
        seatsPerSlot: input.seatsPerSlot,
        color: input.color,
        locations: { create: input.locations },
      },
      include: { locations: true },
    });
  }

  async update(organizationId: string, id: string, input: UpdateEventTypeInput) {
    await this.get(organizationId, id);
    const { locations, ...scalars } = input;

    return this.prisma.$transaction(async (tx) => {
      if (locations) {
        await tx.eventTypeLocation.deleteMany({ where: { eventTypeId: id } });
        await tx.eventTypeLocation.createMany({
          data: locations.map((l) => ({ ...l, eventTypeId: id })),
        });
      }
      return tx.eventType.update({
        where: { id },
        data: scalars,
        include: { locations: true },
      });
    });
  }

  /** Soft delete — preserves booking history that references the event type. */
  async remove(organizationId: string, id: string): Promise<void> {
    await this.get(organizationId, id);
    await this.prisma.eventType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  private async ensureUniqueSlug(organizationId: string, base: string): Promise<string> {
    const normalized = slugify(base) || 'event';
    let candidate = normalized;
    let attempt = 0;
    while (attempt < 25) {
      const exists = await this.prisma.eventType.findUnique({
        where: { organizationId_slug: { organizationId, slug: candidate } },
      });
      if (!exists) return candidate;
      attempt += 1;
      candidate = `${normalized}-${attempt + 1}`;
    }
    throw AppError.conflict('Could not generate a unique event type slug.');
  }
}
