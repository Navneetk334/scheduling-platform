import { z } from 'zod';

import { emailSchema } from './primitives';

/**
 * Validation schemas for the integration system. These are shared between the
 * API (request validation via ZodValidationPipe) and the web (form validation).
 */

/** Arbitrary non-secret config bag (provider-specific). */
const configRecordSchema = z.record(
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

/** Credential bag collected for API-key / basic / SMTP connections. */
const credentialsRecordSchema = z.record(z.union([z.string(), z.number(), z.boolean()]));

/**
 * Create a connection using directly-supplied credentials (API key, Basic,
 * SMTP). OAuth connections are created through the authorize/callback flow, not
 * this endpoint.
 */
export const createConnectionSchema = z.object({
  provider: z.string().min(1).max(64),
  displayName: z.string().trim().min(1).max(120).optional(),
  credentials: credentialsRecordSchema.default({}),
  config: configRecordSchema.default({}),
});

export const updateConnectionSchema = z
  .object({
    displayName: z.string().trim().min(1).max(120).optional(),
    credentials: credentialsRecordSchema.optional(),
    config: configRecordSchema.optional(),
    // Enable/disable a connection without deleting it.
    enabled: z.boolean().optional(),
  })
  .strict();

/** Start an OAuth authorize flow for a provider. */
export const startOAuthSchema = z.object({
  provider: z.string().min(1).max(64),
  /** Optional URL to redirect the user back to after connecting. */
  returnTo: z.string().url().optional(),
});

/** Query parameters returned to the OAuth callback endpoint. */
export const oauthCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

/** List/filter integration logs. */
export const listLogsQuerySchema = z.object({
  connectionId: z.string().optional(),
  provider: z.string().optional(),
  status: z.enum(['SUCCESS', 'FAILURE', 'RETRYING', 'SKIPPED']).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

// --- Outbound webhooks --------------------------------------------------------

export const createWebhookEndpointSchema = z.object({
  url: z.string().url(),
  description: z.string().trim().max(200).optional(),
  events: z.array(z.string().min(1)).min(1).max(50),
  headers: z.record(z.string()).optional(),
});

export const updateWebhookEndpointSchema = z
  .object({
    url: z.string().url().optional(),
    description: z.string().trim().max(200).nullable().optional(),
    events: z.array(z.string().min(1)).min(1).max(50).optional(),
    headers: z.record(z.string()).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

/** Send a test message/email/etc. through a connection (dashboard action). */
export const testConnectionSchema = z.object({
  /** Optional destination for channels that need one (email/SMS/chat). */
  to: z.union([emailSchema, z.string().min(1)]).optional(),
  message: z.string().trim().max(500).optional(),
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;
export type UpdateConnectionInput = z.infer<typeof updateConnectionSchema>;
export type StartOAuthInput = z.infer<typeof startOAuthSchema>;
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
export type ListLogsQueryInput = z.infer<typeof listLogsQuerySchema>;
export type CreateWebhookEndpointInput = z.infer<typeof createWebhookEndpointSchema>;
export type UpdateWebhookEndpointInput = z.infer<typeof updateWebhookEndpointSchema>;
export type TestConnectionInput = z.infer<typeof testConnectionSchema>;
