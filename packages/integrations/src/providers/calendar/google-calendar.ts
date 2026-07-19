/**
 * Google Calendar provider (OAuth 2.0). Creates/updates/deletes events, queries
 * free/busy, and can embed a Google Meet conference on event creation.
 * https://developers.google.com/calendar/api/v3/reference
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  bearerAuth,
  getString,
  type BusyInterval,
  type BusyQuery,
  type CalendarEventInput,
  type CalendarEventRef,
  type CalendarProvider,
  type CalendarSyncResult,
  type ExternalAccount,
  type HealthCheckResult,
  type OAuthEndpoints,
  type ProviderRuntimeContext,
} from '../../core';

const API = 'https://www.googleapis.com/calendar/v3';

interface GoogleEvent {
  id: string;
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] };
}

function calendarId(ctx: ProviderRuntimeContext): string {
  return getString(ctx.config, 'calendarId') ?? 'primary';
}

function toGoogleEvent(input: CalendarEventInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    summary: input.title,
    description: input.description,
    location: input.location,
    start: { dateTime: input.startTime, timeZone: input.timeZone },
    end: { dateTime: input.endTime, timeZone: input.timeZone },
    attendees: input.attendees.map((a) => ({
      email: a.email,
      displayName: a.name,
      optional: a.optional,
    })),
  };
  if (input.createConference) {
    body['conferenceData'] = {
      createRequest: {
        requestId: input.correlationId ?? `req-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }
  return body;
}

function extractMeetingUrl(event: GoogleEvent): string | undefined {
  if (event.hangoutLink) return event.hangoutLink;
  const video = event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video');
  return video?.uri;
}

class GoogleCalendarProvider implements CalendarProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'CALENDAR',
    authType: 'OAUTH2',
    description: 'Two-way sync of bookings with Google Calendar, with Google Meet links.',
    docsUrl: 'https://developers.google.com/calendar',
    supportsInboundWebhooks: true,
    oauthScopes: [
      { value: 'https://www.googleapis.com/auth/calendar.events', description: 'Manage events' },
      {
        value: 'https://www.googleapis.com/auth/calendar.readonly',
        description: 'Read calendars for free/busy',
      },
      { value: 'https://www.googleapis.com/auth/userinfo.email', description: 'Account email' },
    ],
    configFields: [
      {
        key: 'calendarId',
        label: 'Calendar ID',
        type: 'string',
        required: false,
        placeholder: 'primary',
      },
    ],
  };

  readonly oauth: OAuthEndpoints = {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    authorizeParams: { access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true' },
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

  async fetchAccount(ctx: ProviderRuntimeContext): Promise<ExternalAccount> {
    const { data } = await ctx.http.get<{ id: string; email: string; name?: string }>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: bearerAuth(ctx.credentials) },
    );
    return { id: data.id, ...(data.email ? { email: data.email } : {}), ...(data.name ? { name: data.name } : {}) };
  }

  async createEvent(
    ctx: ProviderRuntimeContext,
    input: CalendarEventInput,
  ): Promise<CalendarEventRef> {
    const { data } = await ctx.http.post<GoogleEvent>(
      `${API}/calendars/${encodeURIComponent(calendarId(ctx))}/events`,
      {
        headers: bearerAuth(ctx.credentials),
        query: { conferenceDataVersion: input.createConference ? 1 : 0, sendUpdates: 'all' },
        json: toGoogleEvent(input),
      },
    );
    return {
      externalId: data.id,
      ...(data.htmlLink ? { htmlLink: data.htmlLink } : {}),
      ...(extractMeetingUrl(data) ? { meetingUrl: extractMeetingUrl(data) as string } : {}),
      raw: data,
    };
  }

  async updateEvent(
    ctx: ProviderRuntimeContext,
    externalId: string,
    input: CalendarEventInput,
  ): Promise<CalendarEventRef> {
    const { data } = await ctx.http.put<GoogleEvent>(
      `${API}/calendars/${encodeURIComponent(calendarId(ctx))}/events/${encodeURIComponent(externalId)}`,
      {
        headers: bearerAuth(ctx.credentials),
        query: { conferenceDataVersion: input.createConference ? 1 : 0, sendUpdates: 'all' },
        json: toGoogleEvent(input),
      },
    );
    return {
      externalId: data.id,
      ...(data.htmlLink ? { htmlLink: data.htmlLink } : {}),
      ...(extractMeetingUrl(data) ? { meetingUrl: extractMeetingUrl(data) as string } : {}),
      raw: data,
    };
  }

  async deleteEvent(ctx: ProviderRuntimeContext, externalId: string): Promise<void> {
    await ctx.http.delete(
      `${API}/calendars/${encodeURIComponent(calendarId(ctx))}/events/${encodeURIComponent(externalId)}`,
      { headers: bearerAuth(ctx.credentials), query: { sendUpdates: 'all' }, parse: 'none' },
    );
  }

  async getBusy(ctx: ProviderRuntimeContext, query: BusyQuery): Promise<BusyInterval[]> {
    const id = query.calendarId ?? calendarId(ctx);
    const { data } = await ctx.http.post<{
      calendars: Record<string, { busy: { start: string; end: string }[] }>;
    }>(`${API}/freeBusy`, {
      headers: bearerAuth(ctx.credentials),
      json: { timeMin: query.from, timeMax: query.to, items: [{ id }] },
    });
    return data.calendars[id]?.busy ?? [];
  }

  async sync(ctx: ProviderRuntimeContext, cursor?: string): Promise<CalendarSyncResult> {
    const { data } = await ctx.http.get<{ items?: unknown[]; nextSyncToken?: string }>(
      `${API}/calendars/${encodeURIComponent(calendarId(ctx))}/events`,
      {
        headers: bearerAuth(ctx.credentials),
        query: cursor
          ? { syncToken: cursor, maxResults: 250 }
          : { timeMin: new Date().toISOString(), maxResults: 250, singleEvents: true },
      },
    );
    return { changed: data.items?.length ?? 0, ...(data.nextSyncToken ? { cursor: data.nextSyncToken } : {}) };
  }
}

export const googleCalendar = new GoogleCalendarProvider();
