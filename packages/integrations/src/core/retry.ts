/**
 * Generic retry mechanism with exponential backoff + full jitter. Used by the
 * HTTP client and the integration orchestrator. Honors provider-supplied
 * `retryAfterMs` (e.g. from a 429 Retry-After header) when present.
 */

import { IntegrationError, IntegrationErrorKind, isIntegrationError } from './errors';

export interface RetryOptions {
  /** Total attempts including the first. Default 4. */
  readonly maxAttempts?: number;
  /** Base delay in ms for the exponential curve. Default 300. */
  readonly baseDelayMs?: number;
  /** Upper bound for any single backoff delay. Default 15_000. */
  readonly maxDelayMs?: number;
  /** Decide whether a given error is retryable. Defaults to error.retryable. */
  readonly isRetryable?: (error: unknown) => boolean;
  /** Observability hook fired before each retry sleep. */
  readonly onRetry?: (info: RetryAttemptInfo) => void;
  /** Injectable sleeper (tests). */
  readonly sleep?: (ms: number) => Promise<void>;
  /** Injectable RNG in [0,1) for jitter (tests). */
  readonly random?: () => number;
}

export interface RetryAttemptInfo {
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly delayMs: number;
  readonly error: unknown;
}

const DEFAULTS = {
  maxAttempts: 4,
  baseDelayMs: 300,
  maxDelayMs: 15_000,
} as const;

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function defaultIsRetryable(error: unknown): boolean {
  if (isIntegrationError(error)) return error.retryable;
  // Unknown/native errors (e.g. network EAI_AGAIN, aborted) are treated as transient.
  return true;
}

/**
 * Compute the backoff for a given (1-based) attempt using exponential growth
 * with full jitter, clamped to `maxDelayMs`. Exposed for unit testing.
 */
export function computeBackoffMs(
  attempt: number,
  baseDelayMs: number = DEFAULTS.baseDelayMs,
  maxDelayMs: number = DEFAULTS.maxDelayMs,
  random: () => number = Math.random,
): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
  return Math.floor(random() * exponential);
}

/**
 * Execute `fn`, retrying on retryable failures with exponential backoff.
 * Rethrows the last error once attempts are exhausted.
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULTS.maxAttempts;
  const baseDelayMs = options.baseDelayMs ?? DEFAULTS.baseDelayMs;
  const maxDelayMs = options.maxDelayMs ?? DEFAULTS.maxDelayMs;
  const isRetryable = options.isRetryable ?? defaultIsRetryable;
  const sleep = options.sleep ?? defaultSleep;
  const random = options.random ?? Math.random;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const canRetry = attempt < maxAttempts && isRetryable(error);
      if (!canRetry) break;

      const retryAfter =
        isIntegrationError(error) && error.kind === IntegrationErrorKind.RateLimited
          ? error.retryAfterMs
          : undefined;
      const delayMs = retryAfter ?? computeBackoffMs(attempt, baseDelayMs, maxDelayMs, random);

      options.onRetry?.({ attempt, maxAttempts, delayMs, error });
      await sleep(delayMs);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new IntegrationError('Operation failed after retries.', { cause: lastError });
}
