/**
 * A small, dependency-free HTTP client built on the global `fetch`. It layers
 * timeouts, JSON/form encoding, structured error normalization and the shared
 * retry mechanism on top. Every provider adapter talks to its API through an
 * instance of this client.
 */

import { IntegrationError, IntegrationErrorKind } from './errors';
import { withRetry, type RetryOptions } from './retry';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  // WebDAV / CalDAV verbs (used by the Apple Calendar adapter).
  | 'REPORT'
  | 'PROPFIND'
  | 'MKCALENDAR';
export type QueryValue = string | number | boolean | undefined | null;

export interface HttpRequestOptions {
  readonly method?: HttpMethod;
  readonly headers?: Record<string, string>;
  readonly query?: Record<string, QueryValue>;
  /** JSON request body (sets Content-Type: application/json). */
  readonly json?: unknown;
  /** Form-encoded body (sets Content-Type: application/x-www-form-urlencoded). */
  readonly form?: Record<string, string | number | boolean | undefined>;
  /** Raw string body (caller sets Content-Type via `headers`). */
  readonly body?: string;
  /** How to parse a successful response. Default 'json'. */
  readonly parse?: 'json' | 'text' | 'none';
  /** Per-request timeout in ms. Default 15_000. */
  readonly timeoutMs?: number;
  /** Retry configuration, or `false` to disable retries for this call. */
  readonly retry?: RetryOptions | false;
}

export interface HttpResponse<T> {
  readonly status: number;
  readonly headers: Headers;
  readonly data: T;
}

export interface HttpClientConfig {
  readonly baseUrl?: string;
  readonly defaultHeaders?: Record<string, string>;
  readonly defaultTimeoutMs?: number;
  readonly defaultRetry?: RetryOptions;
  readonly provider?: string;
  /** Override fetch (tests / non-standard runtimes). */
  readonly fetch?: typeof fetch;
}

function parseRetryAfter(headers: Headers): number | undefined {
  const value = headers.get('retry-after');
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultTimeoutMs: number;
  private readonly defaultRetry: RetryOptions | undefined;
  private readonly provider: string | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(config: HttpClientConfig = {}) {
    this.baseUrl = (config.baseUrl ?? '').replace(/\/$/, '');
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.defaultTimeoutMs = config.defaultTimeoutMs ?? 15_000;
    this.defaultRetry = config.defaultRetry;
    this.provider = config.provider;
    const impl = config.fetch ?? globalThis.fetch;
    if (!impl) {
      throw new Error('No fetch implementation available for HttpClient.');
    }
    this.fetchImpl = impl;
  }

  /** Return a new client that inherits config but adds/overrides headers. */
  withHeaders(headers: Record<string, string>): HttpClient {
    return new HttpClient({
      baseUrl: this.baseUrl,
      defaultHeaders: { ...this.defaultHeaders, ...headers },
      defaultTimeoutMs: this.defaultTimeoutMs,
      ...(this.defaultRetry ? { defaultRetry: this.defaultRetry } : {}),
      ...(this.provider ? { provider: this.provider } : {}),
      fetch: this.fetchImpl,
    });
  }

  get<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST' });
  }

  put<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PUT' });
  }

  patch<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PATCH' });
  }

  delete<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  async request<T>(path: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    const url = this.buildUrl(path, options.query);
    const { headers, body } = this.buildBody(options);
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;

    const doFetch = async (): Promise<HttpResponse<T>> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await this.fetchImpl(url, {
          method: options.method ?? 'GET',
          headers,
          signal: controller.signal,
          ...(body !== undefined ? { body } : {}),
        });
      } catch (error) {
        const aborted = error instanceof Error && error.name === 'AbortError';
        throw new IntegrationError(
          aborted ? `Request timed out after ${timeoutMs}ms.` : 'Network request failed.',
          {
            kind: IntegrationErrorKind.Transient,
            ...(this.provider ? { provider: this.provider } : {}),
            cause: error,
          },
        );
      } finally {
        clearTimeout(timer);
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw IntegrationError.fromHttp(
          response.status,
          text,
          this.provider,
          parseRetryAfter(response.headers),
        );
      }

      return {
        status: response.status,
        headers: response.headers,
        data: await this.parseResponse<T>(response, options.parse ?? 'json'),
      };
    };

    if (options.retry === false) return doFetch();
    return withRetry(doFetch, { ...this.defaultRetry, ...(options.retry ?? {}) });
  }

  private buildUrl(path: string, query?: Record<string, QueryValue>): string {
    const base = /^https?:\/\//.test(path) ? path : `${this.baseUrl}${path}`;
    if (!query) return base;
    const url = new URL(base);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  private buildBody(options: HttpRequestOptions): {
    headers: Record<string, string>;
    body: string | undefined;
  } {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...this.defaultHeaders,
      ...options.headers,
    };

    if (options.json !== undefined) {
      headers['Content-Type'] = 'application/json';
      return { headers, body: JSON.stringify(options.json) };
    }
    if (options.form !== undefined) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options.form)) {
        if (value !== undefined) params.set(key, String(value));
      }
      return { headers, body: params.toString() };
    }
    if (options.body !== undefined) {
      return { headers, body: options.body };
    }
    return { headers, body: undefined };
  }

  private async parseResponse<T>(response: Response, parse: 'json' | 'text' | 'none'): Promise<T> {
    if (parse === 'none' || response.status === 204) return undefined as T;
    const text = await response.text();
    if (parse === 'text') return text as T;
    return (text ? JSON.parse(text) : undefined) as T;
  }
}
