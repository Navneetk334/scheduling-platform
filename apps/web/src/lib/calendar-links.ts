/** Build "add to calendar" links/files entirely client-side (no backend). */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  start: string; // ISO-8601
  end: string; // ISO-8601
}

/** Format an ISO instant as an iCalendar UTC timestamp (YYYYMMDDTHHMMSSZ). */
function toStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function encode(value: string): string {
  return encodeURIComponent(value);
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toStamp(event.start)}/${toStamp(event.end)}`,
    details: event.description ?? '',
    location: event.location ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: new Date(event.start).toISOString(),
    enddt: new Date(event.end).toISOString(),
    body: event.description ?? '',
    location: event.location ?? '',
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/** Build a minimal, valid VCALENDAR document. */
export function buildIcs(event: CalendarEvent): string {
  const uid = `${toStamp(event.start)}-${Math.random().toString(36).slice(2)}@invinciblepros`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//INVINCIBLE PROS//Scheduling//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toStamp(new Date().toISOString())}`,
    `DTSTART:${toStamp(event.start)}`,
    `DTEND:${toStamp(event.end)}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  return lines.join('\r\n');
}

export function icsDataUri(event: CalendarEvent): string {
  return `data:text/calendar;charset=utf-8,${encode(buildIcs(event))}`;
}
