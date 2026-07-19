/**
 * Error taxonomy for the integration framework. Every failure raised by an
 * adapter or the HTTP layer is normalized into an {@link IntegrationError} so
 * the orchestrator can decide whether to retry, mark a connection as expired,
 * or surface a configuration problem.
 */

export const IntegrationErrorKind = {
  /** Transient — safe to retry (network blip, 5xx, rate limit). */
  Transient: 'TRANSIENT',
  /** Rate limited — retry after `retryAfterMs`. */
  RateLimited: 'RATE_LIMITED',
  /** Credentials invalid/expired — the connection needs re-auth. */
  Auth: 'AUTH',
  /** Bad configuration or request — not retryable. */
  Config: 'CONFIG',
  /** Provider rejected the request (4xx that is not auth). */
  Provider: 'PROVIDER',
  /** Anything uncategorized. */
  Unknown: 'UNKNOWN',
} as const;
export type IntegrationErrorKind =
  (typeof IntegrationErrorKind)[keyof typeof IntegrationErrorKind];

export interface IntegrationErrorOptions {
  readonly kind?: IntegrationErrorKind;
  readonly httpStatus?: number;
  readonly retryAfterMs?: number;
  readonly provider?: string;
  readonly details?: Record<string, unknown>;
  readonly cause?: unknown;
}

export class IntegrationError extends Error {
  readonly kind: IntegrationErrorKind;
  readonly httpStatus?: number;
  readonly retryAfterMs?: number;
  readonly provider?: string;
  readonly details?: Record<string, unknown>;

  constructor(message: string, options: IntegrationErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'IntegrationError';
    this.kind = options.kind ?? IntegrationErrorKind.Unknown;
    this.httpStatus = options.httpStatus;
    this.retryAfterMs = options.retryAfterMs;
    this.provider = options.provider;
    this.details = options.details;
    Object.setPrototypeOf(this, IntegrationError.prototype);
  }

  /** True when the orchestrator should retry the operation. */
  get retryable(): boolean {
    return (
      this.kind === IntegrationErrorKind.Transient ||
      this.kind === IntegrationErrorKind.RateLimited
    );
  }

  /** Build an IntegrationError from an HTTP status + response text. */
  static fromHttp(
    status: number,
    body: string,
    provider?: string,
    retryAfterMs?: number,
  ): IntegrationError {
    let kind: IntegrationErrorKind;
    if (status === 401 || status === 403) kind = IntegrationErrorKind.Auth;
    else if (status === 429) kind = IntegrationErrorKind.RateLimited;
    else if (status >= 500) kind = IntegrationErrorKind.Transient;
    else if (status >= 400) kind = IntegrationErrorKind.Provider;
    else kind = IntegrationErrorKind.Unknown;

    const snippet = body.length > 500 ? `${body.slice(0, 500)}…` : body;
    return new IntegrationError(`Provider responded ${status}: ${snippet || '(empty body)'}`, {
      kind,
      httpStatus: status,
      ...(retryAfterMs !== undefined ? { retryAfterMs } : {}),
      ...(provider !== undefined ? { provider } : {}),
    });
  }
}

export function isIntegrationError(value: unknown): value is IntegrationError {
  return value instanceof IntegrationError;
}
