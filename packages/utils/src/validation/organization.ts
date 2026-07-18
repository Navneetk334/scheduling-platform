import { z } from 'zod';

import { emailSchema, slugSchema, timeZoneSchema } from './primitives';

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema.optional(),
  timeZone: timeZoneSchema,
});

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  logoUrl: z.string().url().nullable().optional(),
  timeZone: timeZoneSchema.optional(),
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
