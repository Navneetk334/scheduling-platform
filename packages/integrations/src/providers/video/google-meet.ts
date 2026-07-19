/**
 * Google Meet video provider. Meet links are created by attaching conference
 * data to a Google Calendar event, so this shares Google's OAuth scopes.
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  IntegrationError,
  IntegrationErrorKind,
  bearerAuth,
  type HealthCheckResult,
  type MeetingInput,
  type MeetingLink,
  type OAuthEndpoints,
  type ProviderRuntimeContext,
  type VideoProvider,
} from '../../core';

const API = 'https://www.googleapis.com/calendar/v3';

function addMinutesIso(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

interface GoogleEvent {
  id: string;
  hangoutLink?: string;
  htmlLink?: string;
  conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] };
}

class GoogleMeetProvider implements VideoProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'google_meet',
    name: 'Google Meet',
    category: 'VIDEO',
    authType: 'OAUTH2',
    description: 'Generate Google Meet links for bookings.',
    docsUrl: 'https://developers.google.com/calendar/api/guides/create-events#conferencing',
    supportsInboundWebhooks: false,
    oauthScopes: [
      { value: 'https://www.googleapis.com/auth/calendar.events', description: 'Create events with Meet links' },
    ],
  };

  readonly oauth: OAuthEndpoints = {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
    authorizeParams: { access_type: 'offline', prompt: 'consent' },
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(`${API}/users/me/calendarList`, {
      headers: bearerAuth(ctx.credentials),
      query: { maxResults: 1 },
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async createMeeting(ctx: ProviderRuntimeContext, input: MeetingInput): Promise<MeetingLink> {
    const { data } = await ctx.http.post<GoogleEvent>(`${API}/calendars/primary/events`, {
      headers: bearerAuth(ctx.credentials),
      query: { conferenceDataVersion: 1 },
      json: {
        summary: input.topic,
        description: input.agenda,
        start: { dateTime: input.startTime, timeZone: input.timeZone },
        end: {
          dateTime: addMinutesIso(input.startTime, input.durationMinutes),
          timeZone: input.timeZone,
        },
        attendees: input.attendees?.map((a) => ({ email: a.email, displayName: a.name })),
        conferenceData: {
          createRequest: {
            requestId: input.correlationId ?? `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const joinUrl =
      data.hangoutLink ??
      data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri;
    if (!joinUrl) {
      throw new IntegrationError('Google did not return a Meet link.', {
        kind: IntegrationErrorKind.Provider,
      });
    }
    return { externalId: data.id, joinUrl, raw: data };
  }

  async deleteMeeting(ctx: ProviderRuntimeContext, externalId: string): Promise<void> {
    await ctx.http.delete(`${API}/calendars/primary/events/${encodeURIComponent(externalId)}`, {
      headers: bearerAuth(ctx.credentials),
      parse: 'none',
    });
  }
}

export const googleMeet = new GoogleMeetProvider();
