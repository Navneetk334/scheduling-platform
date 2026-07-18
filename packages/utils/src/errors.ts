import type { AppErrorShape } from '@invincible/types';

/**
 * Stable, machine-readable error codes used across the platform.
 * The API maps these to HTTP status codes and the web surfaces them to users.
 */
export const ErrorCode = {
  Validation: 'VALIDATION_ERROR',
  Unauthorized: 'UNAUTHORIZED',
  Forbidden: 'FORBIDDEN',
  NotFound: 'NOT_FOUND',
  Conflict: 'CONFLICT',
  SlotUnavailable: 'SLOT_UNAVAILABLE',
  RateLimited: 'RATE_LIMITED',
  Internal: 'INTERNAL_ERROR',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

const DEFAULT_STATUS: Record<ErrorCode, number> = {
  [ErrorCode.Validation]: 422,
  [ErrorCode.Unauthorized]: 401,
  [ErrorCode.Forbidden]: 403,
  [ErrorCode.NotFound]: 404,
  [ErrorCode.Conflict]: 409,
  [ErrorCode.SlotUnavailable]: 409,
  [ErrorCode.RateLimited]: 429,
  [ErrorCode.Internal]: 500,
};

/**
 * Application-level error carrying a stable code + HTTP status. Thrown by the
 * domain/services and translated into an {@link AppErrorShape} at the edge.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    options?: { details?: Record<string, unknown>; cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'AppError';
    this.code = code;
    this.statusCode = DEFAULT_STATUS[code];
    this.details = options?.details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): AppErrorShape {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.details ? { details: this.details } : {}),
    };
  }

  static notFound(resource: string, id?: string): AppError {
    return new AppError(
      ErrorCode.NotFound,
      `${resource}${id ? ` "${id}"` : ''} was not found.`,
    );
  }

  static conflict(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(ErrorCode.Conflict, message, details ? { details } : undefined);
  }

  static slotUnavailable(message = 'The requested time slot is no longer available.'): AppError {
    return new AppError(ErrorCode.SlotUnavailable, message);
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
