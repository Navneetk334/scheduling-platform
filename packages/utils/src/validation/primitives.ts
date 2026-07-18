import { z } from 'zod';

import { MINUTES_PER_DAY, isValidCalendarDate, isValidTimeZone } from '../datetime';

/** IANA timezone, validated at runtime. */
export const timeZoneSchema = z
  .string()
  .refine(isValidTimeZone, { message: 'Invalid IANA timezone identifier.' });

/** YYYY-MM-DD calendar date. */
export const calendarDateSchema = z
  .string()
  .refine(isValidCalendarDate, { message: 'Date must be a valid YYYY-MM-DD value.' });

/** Minutes since midnight, 0–1439. */
export const minuteOfDaySchema = z.number().int().min(0).max(MINUTES_PER_DAY - 1);

/** URL-safe slug. */
export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug may contain only lowercase letters, numbers and single hyphens.',
  });

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

/** A [start, end) minute interval within a single day. */
export const dayIntervalSchema = z
  .object({
    startMinute: minuteOfDaySchema,
    endMinute: z.number().int().min(1).max(MINUTES_PER_DAY),
  })
  .refine((v) => v.endMinute > v.startMinute, {
    message: 'endMinute must be greater than startMinute.',
    path: ['endMinute'],
  });
