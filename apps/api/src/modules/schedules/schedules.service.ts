import { AppError } from '@invincible/utils';
import type { CreateScheduleInput, UpdateScheduleInput } from '@invincible/utils';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

const scheduleInclude = {
  rules: { orderBy: [{ weekday: 'asc' as const }, { startMinute: 'asc' as const }] },
  overrides: { include: { intervals: true }, orderBy: { date: 'asc' as const } },
};

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string) {
    return this.prisma.schedule.findMany({
      where: { organizationId },
      include: scheduleInclude,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async get(organizationId: string, id: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, organizationId },
      include: scheduleInclude,
    });
    if (!schedule) throw AppError.notFound('Schedule', id);
    return schedule;
  }

  async create(organizationId: string, ownerId: string, input: CreateScheduleInput) {
    return this.prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.schedule.updateMany({
          where: { organizationId, ownerId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.schedule.create({
        data: {
          organizationId,
          ownerId,
          name: input.name,
          timeZone: input.timeZone,
          isDefault: input.isDefault,
          rules: { create: input.rules },
          overrides: {
            create: input.overrides.map((o) => ({
              date: o.date,
              intervals: { create: o.intervals },
            })),
          },
        },
        include: scheduleInclude,
      });
    });
  }

  async update(organizationId: string, id: string, input: UpdateScheduleInput) {
    await this.get(organizationId, id); // authorize + existence

    return this.prisma.$transaction(async (tx) => {
      // Replace nested collections wholesale to keep the API idempotent.
      if (input.rules) {
        await tx.availabilityRule.deleteMany({ where: { scheduleId: id } });
        await tx.availabilityRule.createMany({
          data: input.rules.map((r) => ({ ...r, scheduleId: id })),
        });
      }
      if (input.overrides) {
        await tx.dateOverride.deleteMany({ where: { scheduleId: id } });
        for (const o of input.overrides) {
          await tx.dateOverride.create({
            data: { scheduleId: id, date: o.date, intervals: { create: o.intervals } },
          });
        }
      }
      return tx.schedule.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.timeZone !== undefined ? { timeZone: input.timeZone } : {}),
          ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
        },
        include: scheduleInclude,
      });
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.get(organizationId, id);
    const dependents = await this.prisma.eventType.count({
      where: { scheduleId: id, deletedAt: null },
    });
    if (dependents > 0) {
      throw AppError.conflict('Cannot delete a schedule still used by active event types.');
    }
    await this.prisma.schedule.delete({ where: { id } });
  }
}
