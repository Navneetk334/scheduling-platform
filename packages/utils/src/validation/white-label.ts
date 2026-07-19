import { z } from 'zod';

import { HEX_COLOR_PATTERN } from '../theme';

import { emailSchema, slugSchema } from './primitives';

// --- Shared primitives -----------------------------------------------------

export const hexColorSchema = z
  .string()
  .regex(HEX_COLOR_PATTERN, { message: 'Must be a hex color, e.g. #4F46E5.' });

export const themeModeSchema = z.enum(['LIGHT', 'DARK', 'SYSTEM']);

const fontSchema = z.string().trim().min(1).max(80);
const urlSchema = z.string().url().max(2048);

// --- Brand -----------------------------------------------------------------

export const createBrandSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema.optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),

  logoUrl: urlSchema.nullable().optional(),
  logoDarkUrl: urlSchema.nullable().optional(),
  faviconUrl: urlSchema.nullable().optional(),
  ogImageUrl: urlSchema.nullable().optional(),

  primaryColor: hexColorSchema.optional(),
  accentColor: hexColorSchema.optional(),
  backgroundColor: hexColorSchema.optional(),
  foregroundColor: hexColorSchema.optional(),

  headingFont: fontSchema.optional(),
  bodyFont: fontSchema.optional(),
  customFontUrl: urlSchema.nullable().optional(),

  defaultThemeMode: themeModeSchema.optional(),
  customCss: z.string().max(50_000).nullable().optional(),
  footerHtml: z.string().max(20_000).nullable().optional(),
  removeBranding: z.boolean().optional(),

  loginHeadline: z.string().trim().max(160).nullable().optional(),
  loginSubheadline: z.string().trim().max(320).nullable().optional(),
  loginImageUrl: urlSchema.nullable().optional(),

  emailFromName: z.string().trim().max(120).nullable().optional(),
  emailFromAddress: emailSchema.nullable().optional(),
  emailReplyTo: emailSchema.nullable().optional(),
  supportEmail: emailSchema.nullable().optional(),
  smsSenderId: z.string().trim().max(11).nullable().optional(),
});

export const updateBrandSchema = createBrandSchema.partial();

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

// --- Brand theme -----------------------------------------------------------

export const upsertBrandThemeSchema = z.object({
  mode: z.enum(['LIGHT', 'DARK']),
  /** Optional explicit token overrides; when omitted tokens are derived. */
  tokens: z.record(z.string(), z.string()).optional(),
});

export type UpsertBrandThemeInput = z.infer<typeof upsertBrandThemeSchema>;

// --- Brand asset -----------------------------------------------------------

export const createBrandAssetSchema = z.object({
  brandId: z.string().cuid().nullable().optional(),
  type: z.enum(['LOGO', 'LOGO_DARK', 'FAVICON', 'OG_IMAGE', 'FONT', 'IMAGE']),
  name: z.string().trim().min(1).max(200),
  url: urlSchema,
  mimeType: z.string().trim().max(120).optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type CreateBrandAssetInput = z.infer<typeof createBrandAssetSchema>;

// --- Message templates (email / SMS) ---------------------------------------

export const templateTypeSchema = z.enum([
  'BOOKING_CONFIRMATION',
  'BOOKING_REMINDER',
  'BOOKING_RESCHEDULED',
  'BOOKING_CANCELLED',
  'BOOKING_FOLLOW_UP',
  'WAITLIST_CONFIRMATION',
  'PAYMENT_RECEIPT',
  'INVOICE_ISSUED',
  'TEAM_INVITE',
  'WELCOME',
  'PASSWORD_RESET',
  'CUSTOM',
]);

export const templateChannelSchema = z.enum(['EMAIL', 'SMS']);

export const createMessageTemplateSchema = z
  .object({
    brandId: z.string().cuid().nullable().optional(),
    channel: templateChannelSchema,
    type: templateTypeSchema,
    name: z.string().trim().min(1).max(160),
    subject: z.string().trim().max(240).nullable().optional(),
    bodyHtml: z.string().max(100_000).nullable().optional(),
    bodyText: z.string().min(1).max(100_000),
    variables: z.record(z.string(), z.string()).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.channel !== 'EMAIL' || (v.subject && v.subject.length > 0), {
    message: 'Email templates require a subject.',
    path: ['subject'],
  });

export const updateMessageTemplateSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  subject: z.string().trim().max(240).nullable().optional(),
  bodyHtml: z.string().max(100_000).nullable().optional(),
  bodyText: z.string().min(1).max(100_000).optional(),
  variables: z.record(z.string(), z.string()).nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateMessageTemplateInput = z.infer<typeof createMessageTemplateSchema>;
export type UpdateMessageTemplateInput = z.infer<typeof updateMessageTemplateSchema>;

/** Preview payload: render a template with sample variable values. */
export const renderTemplateSchema = z.object({
  variables: z.record(z.string(), z.string()).default({}),
});
export type RenderTemplateInput = z.infer<typeof renderTemplateSchema>;

// --- Legal documents -------------------------------------------------------

export const legalDocumentTypeSchema = z.enum([
  'PRIVACY_POLICY',
  'TERMS_OF_SERVICE',
  'COOKIE_POLICY',
]);

export const upsertLegalDocumentSchema = z.object({
  brandId: z.string().cuid().nullable().optional(),
  type: legalDocumentTypeSchema,
  title: z.string().trim().min(1).max(200),
  content: z.string().min(1).max(500_000),
  publish: z.boolean().optional(),
});

export type UpsertLegalDocumentInput = z.infer<typeof upsertLegalDocumentSchema>;

// --- Domains ---------------------------------------------------------------

/** RFC-1123 hostname (labels 1–63 chars, letters/digits/hyphens). */
const hostnamePattern =
  /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

export const createDomainSchema = z
  .object({
    kind: z.enum(['SUBDOMAIN', 'CUSTOM']).default('CUSTOM'),
    /** For CUSTOM: the full hostname. For SUBDOMAIN: ignored (built from subdomain). */
    hostname: z
      .string()
      .trim()
      .toLowerCase()
      .max(253)
      .regex(hostnamePattern, { message: 'Enter a valid domain, e.g. book.acme.com.' })
      .optional(),
    /** For SUBDOMAIN: the label to prepend to the platform apex. */
    subdomain: slugSchema.optional(),
    brandId: z.string().cuid().nullable().optional(),
    isPrimary: z.boolean().optional(),
  })
  .refine((v) => (v.kind === 'CUSTOM' ? Boolean(v.hostname) : Boolean(v.subdomain)), {
    message: 'Provide a hostname for custom domains or a subdomain label.',
    path: ['hostname'],
  });

export const updateDomainSchema = z.object({
  brandId: z.string().cuid().nullable().optional(),
  isPrimary: z.boolean().optional(),
});

export type CreateDomainInput = z.infer<typeof createDomainSchema>;
export type UpdateDomainInput = z.infer<typeof updateDomainSchema>;
