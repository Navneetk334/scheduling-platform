import { z } from 'zod';

/**
 * Runtime environment contract. Validated once at bootstrap so the process
 * fails fast on misconfiguration rather than at first use.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:4000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required.'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required.'),

  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET must be at least 16 chars.'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:4000'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // --- Integrations ---------------------------------------------------------
  // Symmetric key used to encrypt provider credentials at rest (AES-256-GCM).
  // MUST be overridden with a strong random value in production.
  INTEGRATIONS_ENCRYPTION_KEY: z
    .string()
    .min(16, 'INTEGRATIONS_ENCRYPTION_KEY must be at least 16 chars.')
    .default('dev-integrations-encryption-key-change-me'),
  // Toggle for the interval-based background workers (disable in tests).
  INTEGRATIONS_BACKGROUND_JOBS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  INTEGRATIONS_HEALTH_INTERVAL_MS: z.coerce.number().int().min(10_000).default(300_000),
  INTEGRATIONS_SYNC_INTERVAL_MS: z.coerce.number().int().min(10_000).default(600_000),
  INTEGRATIONS_WEBHOOK_INTERVAL_MS: z.coerce.number().int().min(1_000).default(15_000),

  // --- Provider OAuth client credentials (all optional) ---------------------
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  MICROSOFT_CLIENT_ID: z.string().default(''),
  MICROSOFT_CLIENT_SECRET: z.string().default(''),
  ZOOM_CLIENT_ID: z.string().default(''),
  ZOOM_CLIENT_SECRET: z.string().default(''),
  HUBSPOT_CLIENT_ID: z.string().default(''),
  HUBSPOT_CLIENT_SECRET: z.string().default(''),
  SALESFORCE_CLIENT_ID: z.string().default(''),
  SALESFORCE_CLIENT_SECRET: z.string().default(''),
  ZOHO_CLIENT_ID: z.string().default(''),
  ZOHO_CLIENT_SECRET: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

/** @nestjs/config `validate` hook. */
export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
