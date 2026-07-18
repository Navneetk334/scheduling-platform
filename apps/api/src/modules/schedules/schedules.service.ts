import { Injectable } from '@nestjs/common';
import { AppError } from '@invincible/utils';
import type { CreateScheduleInput, UpdateScheduleInput } from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

const availabilityInclude = {
  workingHours: { orderBy: [{ weekday: 'asc' as const }, { startMinute: 'asc' as const }] },
  overrides: { include: { intervals: true }, orderBy: { date: 'asc' as const } },
};

/**
 * Manages availability profiles ("schedules"). Route paths remain `/schedules`
 * for API stability; the underlying model is `Availability` + `WorkingHours`.
 */
@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string) {
    return this.prisma.availability.findMany({
      where: { organizationId },
      include: availabilityInclude,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async get(organizationId: string, id: string) {
    const availability = await this.prisma.availability.findFirst({
      where: { id, organizationId },
      include: availabilityInclude,
    });
    if (!availability) throw AppError.notFound('Availability', id);
    return availability;
  }

  async create(organizationId: string, ownerId: string, input: CreateScheduleInput) {
    return this.prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.availability.updateMany({
          where: { organizationId, ownerId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.availability.create({
        data: {
          organizationId,
          ownerId,
          name: input.name,
          timeZone: input.timeZone,
          isDefault: input.isDefault,
          workingHours: { create: input.rules },
          overrides: {
            create: input.overrides.map((o) => ({
              date: o.date,
              isUnavailable: o.intervals.length === 0,
              intervals: { create: o.intervals },
            })),
          },
        },
        include: availabilityInclude,
      });
    });
  }

  async update(organizationId: string, id: string, input: UpdateScheduleInput) {
    await this.get(organizationId, id); // authorize + existence

    return this.prisma.$transaction(async (tx) => {
      if (input.rules) {
        await tx.workingHours.deleteMany({ where: { availabilityId: id } });
        await tx.workingHours.createMany({
          data: input.rules.map((r) => ({ ...r, availabilityId: id })),
        });
      }
      if (input.overrides) {
        await tx.availabilityOverride.deleteMany({ where: { availabilityId: id } });
        for (const o of input.overrides) {
          await tx.availabilityOverride.create({
            data: {
              availabilityId: id,
              date: o.date,
              isUnavailable: o.intervals.length === 0,
              intervals: { create: o.intervals },
            },
          });
        }
      }
      return tx.availability.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.timeZone !== undefined ? { timeZone: input.timeZone } : {}),
          ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
        },
        include: availabilityInclude,
      });
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.get(organizationId, id);
    const dependents = await this.prisma.meetingType.count({
      where: { availabilityId: id, deletedAt: null },
    });
    if (dependents > 0) {
      throw AppError.conflict('Cannot delete availability still used by active meeting types.');
    }
    await this.prisma.availability.delete({ where: { id } });
  }
}
