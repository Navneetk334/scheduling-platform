import { z } from 'zod';

import { slugSchema } from './primitives';

export const locationSchema = z.object({
  type: z.enum(['GOOGLE_MEET', 'ZOOM', 'MICROSOFT_TEAMS', 'IN_PERSON', 'PHONE', 'CUSTOM']),
  value: z.string().trim().max(500).nullable().default(null),
});

export const createEventTypeSchema = z
  .object({
    scheduleId: z.string().cuid2().or(z.string().uuid()),
    kind: z.enum(['ONE_ON_ONE', 'GROUP', 'ROUND_ROBIN', 'COLLECTIVE']).default('ONE_ON_ONE'),
    title: z.string().trim().min(1).max(150),
    slug: slugSchema.optional(),
    description: z.string().trim().max(5000).nullable().default(null),
    durationMinutes: z.number().int().min(5).max(1440),
    bufferBeforeMinutes: z.number().int().min(0).max(720).default(0),
    bufferAfterMinutes: z.number().int().min(0).max(720).default(0),
    minimumNoticeMinutes: z.number().int().min(0).max(60 * 24 * 30).default(60),
    bookingWindowDays: z.number().int().min(1).max(730).default(60),
    slotIntervalMinutes: z.number().int().min(5).max(1440).default(15),
    seatsPerSlot: z.number().int().min(1).max(1000).default(1),
    locations: z.array(locationSchema).min(1).max(10),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #4F46E5.')
      .default('#4F46E5'),
  })
  .refine((v) => v.seatsPerSlot === 1 || v.kind === 'GROUP', {
    message: 'seatsPerSlot > 1 is only allowed for GROUP event types.',
    path: ['seatsPerSlot'],
  });

export const updateEventTypeSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    durationMinutes: z.number().int().min(5).max(1440).optional(),
    bufferBeforeMinutes: z.number().int().min(0).max(720).optional(),
    bufferAfterMinutes: z.number().int().min(0).max(720).optional(),
    minimumNoticeMinutes: z.number().int().min(0).max(60 * 24 * 30).optional(),
    bookingWindowDays: z.number().int().min(1).max(730).optional(),
    slotIntervalMinutes: z.number().int().min(5).max(1440).optional(),
    seatsPerSlot: z.number().int().min(1).max(1000).optional(),
    locations: z.array(locationSchema).min(1).max(10).optional(),
    isActive: z.boolean().optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  })
  .strict();

export type CreateEventTypeInput = z.infer<typeof createEventTypeSchema>;
export type UpdateEventTypeInput = z.infer<typeof updateEventTypeSchema>;
