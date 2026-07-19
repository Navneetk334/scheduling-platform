/**
 * Microsoft Teams video provider via Microsoft Graph online meetings (OAuth).
 * https://learn.microsoft.com/graph/api/application-post-onlinemeetings
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

const GRAPH = 'https://graph.microsoft.com/v1.0';

function addMinutesIso(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

interface GraphOnlineMeeting {
  id: string;
  joinWebUrl?: string;
  joinUrl?: string;
}

class MicrosoftTeamsVideoProvider implements VideoProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'microsoft_teams_video',
    name: 'Microsoft Teams (Meetings)',
    category: 'VIDEO',
    authType: 'OAUTH2',
    description: 'Create Microsoft Teams online meetings for bookings.',
    docsUrl: 'https://learn.microsoft.com/graph/api/application-post-onlinemeetings',
    supportsInboundWebhooks: false,
    oauthScopes: [
      { value: 'OnlineMeetings.ReadWrite', description: 'Create Teams meetings' },
      { value: 'offline_access', description: 'Refresh access without re-consent' },
    ],
  };

  readonly oauth: OAuthEndpoints = {
    authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: ['offline_access', 'User.Read', 'OnlineMeetings.ReadWrite'],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(`${GRAPH}/me`, {
      headers: bearerAuth(ctx.credentials),
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async fetchAccount(ctx: ProviderRuntimeContext): Promise<ExternalAccount> {
    const { data } = await ctx.http.get<{
      id: string;
      mail?: string;
      userPrincipalName?: string;
      displayName?: string;
    }>(`${GRAPH}/me`, { headers: bearerAuth(ctx.credentials) });
    const email = data.mail ?? data.userPrincipalName;
    return {
      id: data.id,
      ...(email ? { email } : {}),
      ...(data.displayName ? { name: data.displayName } : {}),
    };
  }

  async createMeeting(ctx: ProviderRuntimeContext, input: MeetingInput): Promise<MeetingLink> {
    const { data } = await ctx.http.post<GraphOnlineMeeting>(`${GRAPH}/me/onlineMeetings`, {
      headers: bearerAuth(ctx.credentials),
      json: {
        subject: input.topic,
        startDateTime: input.startTime,
        endDateTime: addMinutesIso(input.startTime, input.durationMinutes),
      },
    });
    return {
      externalId: data.id,
      joinUrl: data.joinWebUrl ?? data.joinUrl ?? '',
      raw: data,
    };
  }

  async deleteMeeting(ctx: ProviderRuntimeContext, externalId: string): Promise<void> {
    await ctx.http.delete(`${GRAPH}/me/onlineMeetings/${encodeURIComponent(externalId)}`, {
      headers: bearerAuth(ctx.credentials),
      parse: 'none',
    });
  }
}

export const microsoftTeamsVideo = new MicrosoftTeamsVideoProvider();
