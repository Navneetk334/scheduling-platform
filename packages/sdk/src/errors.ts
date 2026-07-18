import type { AppErrorShape } from '@invincible/types';

/**
 * Error thrown by the SDK for any non-2xx response. Carries the structured
 * {@link AppErrorShape} returned by the API so callers can branch on `code`.
 */
export class SdkError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly requestId?: string;

  constructor(error: AppErrorShape) {
    super(error.message);
    this.name = 'SdkError';
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.details = error.details;
    this.requestId = error.requestId;
    Object.setPrototypeOf(this, SdkError.prototype);
  }

  get isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR';
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isSlotUnavailable(): boolean {
    return this.code === 'SLOT_UNAVAILABLE';
  }
}

export function isSdkError(value: unknown): value is SdkError {
  return value instanceof SdkError;
}
