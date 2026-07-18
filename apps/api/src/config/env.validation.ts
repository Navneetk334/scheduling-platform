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
