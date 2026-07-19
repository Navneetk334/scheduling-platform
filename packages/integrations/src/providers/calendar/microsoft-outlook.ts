/**
 * Microsoft Outlook / Microsoft 365 calendar provider via Microsoft Graph
 * (OAuth 2.0). Can also provision a Microsoft Teams online meeting on the event.
 * https://learn.microsoft.com/graph/api/resources/calendar
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  bearerAuth,
  type BusyInterval,
  type BusyQuery,
  type CalendarEventInput,
  type CalendarEventRef,
  type CalendarProvider,
  type ExternalAccount,
  type HealthCheckResult,
  type OAuthEndpoints,
  type ProviderRuntimeContext,
} from '../../core';

const GRAPH = 'https://graph.microsoft.com/v1.0';
const UTC_PREFER = { Prefer: 'outlook.timezone="UTC"' };

interface GraphEvent {
  id: string;
  webLink?: string;
  onlineMeeting?: { joinUrl?: string };
}

function toGraphEvent(input: CalendarEventInput): Record<string, unknown> {
  return {
    subject: input.title,
    body: { contentType: 'HTML', content: input.description ?? '' },
    start: { dateTime: input.startTime, timeZone: input.timeZone },
    end: { dateTime: input.endTime, timeZone: input.timeZone },
    location: input.location ? { displayName: input.location } : undefined,
    attendees: input.attendees.map((a) => ({
      emailAddress: { address: a.email, name: a.name },
      type: a.optional ? 'optional' : 'required',
    })),
    isOnlineMeeting: Boolean(input.createConference),
    ...(input.createConference ? { onlineMeetingProvider: 'teamsForBusiness' } : {}),
  };
}

function ensureUtc(value: string): string {
  return /Z$|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
}

class MicrosoftOutlookProvider implements CalendarProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'microsoft_outlook',
    name: 'Microsoft Outlook',
    category: 'CALENDAR',
    authType: 'OAUTH2',
    description: 'Two-way sync with Outlook / Microsoft 365 calendars via Microsoft Graph.',
    docsUrl: 'https://learn.microsoft.com/graph/api/resources/calendar',
    supportsInboundWebhooks: true,
    oauthScopes: [
      { value: 'Calendars.ReadWrite', description: 'Read and write calendar events' },
      { value: 'OnlineMeetings.ReadWrite', description: 'Create Teams meetings' },
      { value: 'User.Read', description: 'Read the signed-in account profile' },
      { value: 'offline_access', description: 'Refresh access without re-consent' },
    ],
  };

  readonly oauth: OAuthEndpoints = {
    authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: [
      'offline_access',
      'User.Read',
      'Calendars.ReadWrite',
      'OnlineMeetings.ReadWrite',
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(`${GRAPH}/me/calendars`, {
      headers: bearerAuth(ctx.credentials),
      query: { $top: 1 },
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

  async createEvent(
    ctx: ProviderRuntimeContext,
    input: CalendarEventInput,
  ): Promise<CalendarEventRef> {
    const { data } = await ctx.http.post<GraphEvent>(`${GRAPH}/me/events`, {
      headers: bearerAuth(ctx.credentials),
      json: toGraphEvent(input),
    });
    return {
      externalId: data.id,
      ...(data.webLink ? { htmlLink: data.webLink } : {}),
      ...(data.onlineMeeting?.joinUrl ? { meetingUrl: data.onlineMeeting.joinUrl } : {}),
      raw: data,
    };
  }

  async updateEvent(
    ctx: ProviderRuntimeContext,
    externalId: string,
    input: CalendarEventInput,
  ): Promise<CalendarEventRef> {
    const { data } = await ctx.http.patch<GraphEvent>(
      `${GRAPH}/me/events/${encodeURIComponent(externalId)}`,
      { headers: bearerAuth(ctx.credentials), json: toGraphEvent(input) },
    );
    return {
      externalId: data.id,
      ...(data.webLink ? { htmlLink: data.webLink } : {}),
      ...(data.onlineMeeting?.joinUrl ? { meetingUrl: data.onlineMeeting.joinUrl } : {}),
      raw: data,
    };
  }

  async deleteEvent(ctx: ProviderRuntimeContext, externalId: string): Promise<void> {
    await ctx.http.delete(`${GRAPH}/me/events/${encodeURIComponent(externalId)}`, {
      headers: bearerAuth(ctx.credentials),
      parse: 'none',
    });
  }

  async getBusy(ctx: ProviderRuntimeContext, query: BusyQuery): Promise<BusyInterval[]> {
    const { data } = await ctx.http.get<{
      value: { start: { dateTime: string }; end: { dateTime: string }; showAs?: string }[];
    }>(`${GRAPH}/me/calendarView`, {
      headers: { ...bearerAuth(ctx.credentials), ...UTC_PREFER },
      query: {
        startDateTime: query.from,
        endDateTime: query.to,
        $select: 'start,end,showAs',
        $top: 200,
      },
    });
    return data.value
      .filter((e) => e.showAs !== 'free')
      .map((e) => ({ start: ensureUtc(e.start.dateTime), end: ensureUtc(e.end.dateTime) }));
  }
}

export const microsoftOutlook = new MicrosoftOutlookProvider();
