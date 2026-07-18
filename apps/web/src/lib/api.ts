import { createApiClient, type ApiClient } from '@invincible/sdk';

import { env } from './env';

/**
 * Browser-side API client (singleton). Cookies flow automatically via
 * `credentials: 'include'`, carrying the Better Auth session.
 */
let browserClient: ApiClient | undefined;

export function getApiClient(): ApiClient {
  browserClient ??= createApiClient({ baseUrl: env.apiUrl });
  return browserClient;
}

/**
 * Server-side API client factory. Pass the forwarded request headers (e.g.
 * cookies) so authenticated calls work during SSR / server actions.
 */
export function createServerApiClient(headers: Record<string, string>): ApiClient {
  return createApiClient({
    baseUrl: env.apiUrl,
    getDefaultHeaders: () => headers,
  });
}
