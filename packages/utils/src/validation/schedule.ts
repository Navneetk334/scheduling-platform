import { z } from 'zod';

import { calendarDateSchema, dayIntervalSchema, minuteOfDaySchema, timeZoneSchema } from './primitives';

const MINUTES_PER_DAY = 24 * 60;

export const availabilityRuleSchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    startMinute: minuteOfDaySchema,
    endMinute: z.number().int().min(1).max(MINUTES_PER_DAY),
  })
  .refine((v) => v.endMinute > v.startMinute, {
    message: 'endMinute must be greater than startMinute.',
    path: ['endMinute'],
  });

export const dateOverrideSchema = z.object({
  date: calendarDateSchema,
  intervals: z.array(dayIntervalSchema).max(24),
});

export const createScheduleSchema = z.object({
  name: z.string().trim().min(1).max(120),
  timeZone: timeZoneSchema,
  isDefault: z.boolean().default(false),
  rules: z.array(availabilityRuleSchema).max(50).default([]),
  overrides: z.array(dateOverrideSchema).max(365).default([]),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
