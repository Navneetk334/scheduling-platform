import { Injectable } from '@nestjs/common';
import { AppError, slugify } from '@invincible/utils';
import type { CreateEventTypeInput, UpdateEventTypeInput } from '@invincible/utils';
import type { Prisma } from '@invincible/database';

import { PrismaService } from '../../prisma/prisma.service';

const meetingTypeInclude = {
  locationLinks: { include: { location: true }, orderBy: { position: 'asc' as const } },
};

/**
 * Manages meeting types (a.k.a. event types). Route paths remain `/event-types`
 * for API stability; the underlying model is `MeetingType` with normalized
 * `Location` rows linked via `MeetingTypeLocation`.
 */
@Injectable()
export class EventTypesService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string) {
    return this.prisma.meetingType.findMany({
      where: { organizationId, deletedAt: null },
      include: meetingTypeInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(organizationId: string, id: string) {
    const meetingType = await this.prisma.meetingType.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: { ...meetingTypeInclude, availability: true },
    });
    if (!meetingType) throw AppError.notFound('Meeting type', id);
    return meetingType;
  }

  async create(organizationId: string, ownerId: string, input: CreateEventTypeInput) {
    const availability = await this.prisma.availability.findFirst({
      where: { id: input.scheduleId, organizationId },
    });
    if (!availability) throw AppError.notFound('Availability', input.scheduleId);

    const slug = await this.ensureUniqueSlug(organizationId, input.slug ?? slugify(input.title));

    return this.prisma.$transaction(async (tx) => {
      const meetingType = await tx.meetingType.create({
        data: {
          organizationId,
          ownerId,
          availabilityId: input.scheduleId,
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
          hosts: { create: [{ userId: ownerId, role: 'ORGANIZER' }] },
        },
      });

      await this.replaceLocations(tx, organizationId, meetingType.id, input.locations);

      return tx.meetingType.findUniqueOrThrow({
        where: { id: meetingType.id },
        include: meetingTypeInclude,
      });
    });
  }

  async update(organizationId: string, id: string, input: UpdateEventTypeInput) {
    await this.get(organizationId, id);
    const { locations, ...scalars } = input;

    return this.prisma.$transaction(async (tx) => {
      if (locations) {
        await this.replaceLocations(tx, organizationId, id, locations);
      }
      return tx.meetingType.update({
        where: { id },
        data: scalars,
        include: meetingTypeInclude,
      });
    });
  }

  /** Soft delete — preserves booking history that references the meeting type. */
  async remove(organizationId: string, id: string): Promise<void> {
    await this.get(organizationId, id);
    await this.prisma.meetingType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  /** Replace a meeting type's location set (delete links + recreate). */
  private async replaceLocations(
    tx: Prisma.TransactionClient,
    organizationId: string,
    meetingTypeId: string,
    locations: CreateEventTypeInput['locations'],
  ): Promise<void> {
    await tx.meetingTypeLocation.deleteMany({ where: { meetingTypeId } });
    let position = 0;
    for (const location of locations) {
      const created = await tx.location.create({
        data: {
          organizationId,
          kind: location.type,
          label: location.type,
          value: location.value,
        },
      });
      await tx.meetingTypeLocation.create({
        data: { meetingTypeId, locationId: created.id, position },
      });
      position += 1;
    }
  }

  private async ensureUniqueSlug(organizationId: string, base: string): Promise<string> {
    const normalized = slugify(base) || 'event';
    let candidate = normalized;
    let attempt = 0;
    while (attempt < 25) {
      const exists = await this.prisma.meetingType.findUnique({
        where: { organizationId_slug: { organizationId, slug: candidate } },
      });
      if (!exists) return candidate;
      attempt += 1;
      candidate = `${normalized}-${attempt + 1}`;
    }
    throw AppError.conflict('Could not generate a unique meeting type slug.');
  }
}
