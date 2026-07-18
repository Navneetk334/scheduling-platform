import type { Result } from '@invincible/types';

/** Construct a successful {@link Result}. */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Construct a failed {@link Result}. */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Narrowing guard for the success branch. */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

/** Narrowing guard for the failure branch. */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}
