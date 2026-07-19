import type { Env } from '../../config/env.validation';

/** DI token for the shared, code-driven provider registry. */
export const PROVIDER_REGISTRY = Symbol('PROVIDER_REGISTRY');

/**
 * Maps an OAuth provider id to the env keys holding its client credentials.
 * Providers that share an OAuth app (Google, Microsoft) reference the same keys.
 */
export const OAUTH_CLIENT_ENV: Record<
  string,
  { readonly idKey: keyof Env; readonly secretKey: keyof Env }
> = {
  google_calendar: { idKey: 'GOOGLE_CLIENT_ID', secretKey: 'GOOGLE_CLIENT_SECRET' },
  google_meet: { idKey: 'GOOGLE_CLIENT_ID', secretKey: 'GOOGLE_CLIENT_SECRET' },
  microsoft_outlook: { idKey: 'MICROSOFT_CLIENT_ID', secretKey: 'MICROSOFT_CLIENT_SECRET' },
  microsoft_teams_video: { idKey: 'MICROSOFT_CLIENT_ID', secretKey: 'MICROSOFT_CLIENT_SECRET' },
  zoom: { idKey: 'ZOOM_CLIENT_ID', secretKey: 'ZOOM_CLIENT_SECRET' },
  hubspot: { idKey: 'HUBSPOT_CLIENT_ID', secretKey: 'HUBSPOT_CLIENT_SECRET' },
  salesforce: { idKey: 'SALESFORCE_CLIENT_ID', secretKey: 'SALESFORCE_CLIENT_SECRET' },
  zoho_crm: { idKey: 'ZOHO_CLIENT_ID', secretKey: 'ZOHO_CLIENT_SECRET' },
};

/** Redis key for a pending OAuth authorization state. */
export function oauthStateKey(state: string): string {
  return `integrations:oauth:state:${state}`;
}

/** How long an OAuth authorize state remains valid. */
export const OAUTH_STATE_TTL_SECONDS = 600;

/** Refresh an OAuth access token this many ms before it actually expires. */
export const TOKEN_REFRESH_SKEW_MS = 60_000;
