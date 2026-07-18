import { z } from 'zod';

import { calendarDateSchema, emailSchema, timeZoneSchema } from './primitives';

export const guestSchema = z.object({
  name: z.string().trim().min(1).max(150),
  email: emailSchema,
});

export const createBookingSchema = z.object({
  meetingTypeId: z.string().min(1),
  /** Slot start, ISO-8601. Validated against live availability server-side. */
  startTime: z.string().datetime({ offset: true }),
  invitee: z.object({
    name: z.string().trim().min(1).max(150),
    email: emailSchema,
    timeZone: timeZoneSchema,
    notes: z.string().trim().max(2000).optional(),
  }),
  guests: z.array(guestSchema).max(20).default([]),
  /** Client-supplied idempotency key to make retries safe. */
  idempotencyKey: z.string().uuid().optional(),
});

export const rescheduleBookingSchema = z.object({
  startTime: z.string().datetime({ offset: true }),
  reason: z.string().trim().max(1000).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

export const availabilityQuerySchema = z
  .object({
    meetingTypeId: z.string().min(1),
    from: calendarDateSchema,
    to: calendarDateSchema,
    timeZone: timeZoneSchema,
  })
  .refine((v) => v.to >= v.from, {
    message: '`to` must be on or after `from`.',
    path: ['to'],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;
