import type { AppErrorShape } from '@invincible/types';

import { SdkError } from './errors';

export interface RequestOptions {
  /** Scopes the request to an organization via the `x-organization-id` header. */
  organizationId?: string;
  /** Extra headers (e.g. forwarded cookies during SSR). */
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Query string parameters. Undefined values are omitted. */
  query?: Record<string, string | number | boolean | undefined>;
}

export interface HttpClientConfig {
  /** API origin, e.g. "http://localhost:4000". */
  baseUrl: string;
  /** API path prefix. Defaults to "/api/v1". */
  basePath?: string;
  /** Injected for SSR (forward cookies) or auth. */
  getDefaultHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  /** Override the fetch implementation (tests / non-browser runtimes). */
  fetch?: typeof fetch;
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/**
 * Minimal, dependency-free HTTP client. Sends credentials (cookies) by default
 * so the Better Auth session flows automatically, normalizes errors into
 * {@link SdkError}, and supports SSR header injection.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly basePath: string;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.basePath = config.basePath ?? '/api/v1';
    this.fetchImpl = config.fetch ?? globalThis.fetch;
    if (!this.fetchImpl) {
      throw new Error('No fetch implementation available; pass `fetch` in the SDK config.');
    }
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  private async request<T>(
    method: Method,
    path: string,
    body: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${this.basePath}${path}`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const defaultHeaders = (await this.config.getDefaultHeaders?.()) ?? {};
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...defaultHeaders,
      ...options.headers,
    };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (options.organizationId) headers['x-organization-id'] = options.organizationId;

    const response = await this.fetchImpl(url.toString(), {
      method,
      headers,
      credentials: 'include',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const payload: unknown = text ? JSON.parse(text) : undefined;

    if (!response.ok) {
      const shape: AppErrorShape =
        payload && typeof payload === 'object' && 'code' in payload
          ? (payload as AppErrorShape)
          : {
              code: 'INTERNAL_ERROR',
              message: response.statusText || 'Request failed.',
              statusCode: response.status,
            };
      throw new SdkError(shape);
    }

    return payload as T;
  }
}
