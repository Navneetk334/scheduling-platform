/**
 * Zoom video provider (OAuth 2.0). Creates scheduled meetings for bookings.
 * https://developers.zoom.us/docs/api/
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  bearerAuth,
  type ExternalAccount,
  type HealthCheckResult,
  type MeetingInput,
  type MeetingLink,
  type OAuthEndpoints,
  type ProviderRuntimeContext,
  type VideoProvider,
} from '../../core';

const API = 'https://api.zoom.us/v2';

interface ZoomMeeting {
  id: number;
  join_url: string;
  start_url?: string;
  password?: string;
}

class ZoomProvider implements VideoProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'zoom',
    name: 'Zoom',
    category: 'VIDEO',
    authType: 'OAUTH2',
    description: 'Create Zoom meetings automatically for confirmed bookings.',
    docsUrl: 'https://developers.zoom.us/docs/api/',
    supportsInboundWebhooks: true,
    oauthScopes: [{ value: 'meeting:write', description: 'Create and manage meetings' }],
  };

  readonly oauth: OAuthEndpoints = {
    authorizeUrl: 'https://zoom.us/oauth/authorize',
    tokenUrl: 'https://zoom.us/oauth/token',
    scopes: ['meeting:write', 'user:read'],
    useBasicAuth: true,
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(`${API}/users/me`, {
      headers: bearerAuth(ctx.credentials),
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async fetchAccount(ctx: ProviderRuntimeContext): Promise<ExternalAccount> {
    const { data } = await ctx.http.get<{ id: string; email?: string; first_name?: string }>(
      `${API}/users/me`,
      { headers: bearerAuth(ctx.credentials) },
    );
    return { id: data.id, ...(data.email ? { email: data.email } : {}), ...(data.first_name ? { name: data.first_name } : {}) };
  }

  async createMeeting(ctx: ProviderRuntimeContext, input: MeetingInput): Promise<MeetingLink> {
    const { data } = await ctx.http.post<ZoomMeeting>(`${API}/users/me/meetings`, {
      headers: bearerAuth(ctx.credentials),
      json: {
        topic: input.topic,
        type: 2, // scheduled meeting
        start_time: input.startTime,
        duration: input.durationMinutes,
        timezone: input.timeZone,
        agenda: input.agenda,
        settings: { join_before_host: true, waiting_room: false },
      },
    });
    return {
      externalId: String(data.id),
      joinUrl: data.join_url,
      ...(data.password ? { password: data.password } : {}),
      ...(data.start_url ? { hostUrl: data.start_url } : {}),
      raw: data,
    };
  }

  async deleteMeeting(ctx: ProviderRuntimeContext, externalId: string): Promise<void> {
    await ctx.http.delete(`${API}/meetings/${encodeURIComponent(externalId)}`, {
      headers: bearerAuth(ctx.credentials),
      parse: 'none',
    });
  }
}

export const zoom = new ZoomProvider();
