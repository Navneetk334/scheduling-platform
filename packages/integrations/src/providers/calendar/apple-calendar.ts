/**
 * Apple Calendar (iCloud) provider over CalDAV. Apple does not offer OAuth for
 * calendar access, so this uses HTTP Basic auth with an Apple ID + an
 * app-specific password against the iCloud CalDAV endpoint.
 *
 * Events are written as iCalendar (RFC 5545) resources; free/busy is queried
 * with a CalDAV `free-busy-query` REPORT (RFC 4791).
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  IntegrationError,
  IntegrationErrorKind,
  basicAuth,
  requireString,
  type BusyInterval,
  type BusyQuery,
  type CalendarEventInput,
  type CalendarEventRef,
  type CalendarProvider,
  type ExternalAccount,
  type HealthCheckResult,
  type ProviderRuntimeContext,
} from '../../core';

/** Format an ISO/offset datetime as iCalendar UTC basic form: 20260719T090000Z. */
function toICalUtc(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new IntegrationError(`Invalid datetime for iCal: ${iso}`, {
      kind: IntegrationErrorKind.Config,
    });
  }
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function buildIcs(uid: string, input: CalendarEventInput): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//INVINCIBLE PROS//Scheduling//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toICalUtc(new Date().toISOString())}`,
    `DTSTART:${toICalUtc(input.startTime)}`,
    `DTEND:${toICalUtc(input.endTime)}`,
    `SUMMARY:${escapeText(input.title)}`,
    ...(input.description ? [`DESCRIPTION:${escapeText(input.description)}`] : []),
    ...(input.location ? [`LOCATION:${escapeText(input.location)}`] : []),
    ...input.attendees.map(
      (a) => `ATTENDEE;CN=${escapeText(a.name ?? a.email)};RSVP=TRUE:mailto:${a.email}`,
    ),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

/** Parse FREEBUSY periods out of a VFREEBUSY REPORT response. */
function parseFreeBusy(body: string): BusyInterval[] {
  const intervals: BusyInterval[] = [];
  const regex = /FREEBUSY[^:]*:(.+)/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    for (const period of match[1]!.trim().split(',')) {
      const [start, end] = period.split('/');
      if (start && end) {
        intervals.push({ start: icalToIso(start), end: icalToIso(end.startsWith('P') ? start : end) });
      }
    }
  }
  return intervals;
}

/** Convert iCal UTC basic form back to ISO-8601. */
function icalToIso(value: string): string {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/.exec(value.trim());
  if (!m) return value;
  const [, y, mo, d, h, mi, s] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}.000Z`;
}

function credentials(ctx: ProviderRuntimeContext): { headers: Record<string, string> } {
  const appleId = requireString(ctx.credentials, 'appleId');
  const appPassword = requireString(ctx.credentials, 'appPassword');
  return { headers: basicAuth(appleId, appPassword) };
}

function calendarUrl(ctx: ProviderRuntimeContext): string {
  return requireString(ctx.config, 'calendarUrl').replace(/\/$/, '');
}

function resourceUrl(ctx: ProviderRuntimeContext, resource: string): string {
  return `${calendarUrl(ctx)}/${resource}`;
}

class AppleCalendarProvider implements CalendarProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'apple_calendar',
    name: 'Apple Calendar (iCloud)',
    category: 'CALENDAR',
    authType: 'BASIC',
    description: 'Sync bookings to iCloud Calendar over CalDAV using an app-specific password.',
    docsUrl: 'https://support.apple.com/en-us/HT204397',
    supportsInboundWebhooks: false,
    credentialFields: [
      { key: 'appleId', label: 'Apple ID email', type: 'string', required: true },
      {
        key: 'appPassword',
        label: 'App-specific password',
        type: 'secret',
        required: true,
        help: 'Generate at appleid.apple.com › Sign-In and Security › App-Specific Passwords.',
      },
    ],
    configFields: [
      {
        key: 'calendarUrl',
        label: 'CalDAV calendar URL',
        type: 'string',
        required: true,
        placeholder: 'https://p01-caldav.icloud.com/1234567/calendars/home/',
      },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.request(calendarUrl(ctx), {
      method: 'PROPFIND',
      headers: { ...credentials(ctx).headers, Depth: '0', 'Content-Type': 'application/xml' },
      body: '<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:resourcetype/></d:prop></d:propfind>',
      parse: 'none',
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async fetchAccount(ctx: ProviderRuntimeContext): Promise<ExternalAccount> {
    const appleId = requireString(ctx.credentials, 'appleId');
    return { id: appleId, email: appleId };
  }

  async createEvent(
    ctx: ProviderRuntimeContext,
    input: CalendarEventInput,
  ): Promise<CalendarEventRef> {
    const uid = `${input.correlationId ?? `inv-${Date.now()}`}@invincible`;
    const resource = `${encodeURIComponent(uid)}.ics`;
    await ctx.http.put(resourceUrl(ctx, resource), {
      headers: {
        ...credentials(ctx).headers,
        'Content-Type': 'text/calendar; charset=utf-8',
        'If-None-Match': '*',
      },
      body: buildIcs(uid, input),
      parse: 'none',
    });
    return { externalId: resource, raw: { uid } };
  }

  async updateEvent(
    ctx: ProviderRuntimeContext,
    externalId: string,
    input: CalendarEventInput,
  ): Promise<CalendarEventRef> {
    const uid = decodeURIComponent(externalId.replace(/\.ics$/, ''));
    await ctx.http.put(resourceUrl(ctx, externalId), {
      headers: { ...credentials(ctx).headers, 'Content-Type': 'text/calendar; charset=utf-8' },
      body: buildIcs(uid, input),
      parse: 'none',
    });
    return { externalId, raw: { uid } };
  }

  async deleteEvent(ctx: ProviderRuntimeContext, externalId: string): Promise<void> {
    await ctx.http.delete(resourceUrl(ctx, externalId), {
      headers: credentials(ctx).headers,
      parse: 'none',
    });
  }

  async getBusy(ctx: ProviderRuntimeContext, query: BusyQuery): Promise<BusyInterval[]> {
    const report = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<C:free-busy-query xmlns:C="urn:ietf:params:xml:ns:caldav">',
      `<C:time-range start="${toICalUtc(query.from)}" end="${toICalUtc(query.to)}"/>`,
      '</C:free-busy-query>',
    ].join('');
    const { data } = await ctx.http.request<string>(query.calendarId ?? calendarUrl(ctx), {
      method: 'REPORT',
      headers: { ...credentials(ctx).headers, Depth: '1', 'Content-Type': 'application/xml' },
      body: report,
      parse: 'text',
    });
    return parseFreeBusy(data);
  }
}

export const appleCalendar = new AppleCalendarProvider();
