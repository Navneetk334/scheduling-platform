import { describe, expect, it, vi } from 'vitest';

import { IntegrationError, IntegrationErrorKind } from './errors';
import { computeBackoffMs, withRetry } from './retry';

describe('computeBackoffMs', () => {
  it('grows exponentially and is clamped by maxDelayMs', () => {
    const noJitter = () => 1 - Number.EPSILON; // ~1 → full exponential
    expect(computeBackoffMs(1, 100, 10_000, noJitter)).toBe(99);
    expect(computeBackoffMs(2, 100, 10_000, noJitter)).toBe(199);
    expect(computeBackoffMs(3, 100, 10_000, noJitter)).toBe(399);
    // Clamp: base 100 * 2^9 = 51_200 → clamped to 1_000.
    expect(computeBackoffMs(10, 100, 1_000, noJitter)).toBe(999);
  });

  it('applies jitter via the injected RNG', () => {
    expect(computeBackoffMs(3, 100, 10_000, () => 0)).toBe(0);
  });
});

describe('withRetry', () => {
  const sleep = () => Promise.resolve();

  it('returns on first success without retrying', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    await expect(withRetry(fn, { sleep })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries retryable errors up to maxAttempts', async () => {
    const err = new IntegrationError('boom', { kind: IntegrationErrorKind.Transient });
    const fn = vi.fn().mockRejectedValue(err);
    await expect(withRetry(fn, { maxAttempts: 3, sleep })).rejects.toBe(err);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry non-retryable (config/auth) errors', async () => {
    const err = new IntegrationError('bad config', { kind: IntegrationErrorKind.Config });
    const fn = vi.fn().mockRejectedValue(err);
    await expect(withRetry(fn, { maxAttempts: 5, sleep })).rejects.toBe(err);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('honors a rate-limit retryAfterMs', async () => {
    const err = new IntegrationError('slow down', {
      kind: IntegrationErrorKind.RateLimited,
      retryAfterMs: 1234,
    });
    const onRetry = vi.fn();
    const fn = vi
      .fn()
      .mockRejectedValueOnce(err)
      .mockResolvedValue('recovered');
    await expect(withRetry(fn, { sleep, onRetry })).resolves.toBe('recovered');
    expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({ delayMs: 1234 }));
  });
});
