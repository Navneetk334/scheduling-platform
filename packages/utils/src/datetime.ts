import type { IANATimeZone, ISODateString, MinutesOfDay } from '@invincible/types';
import { DateTime } from 'luxon';

export const MINUTES_PER_DAY = 24 * 60;

/** Validate an IANA timezone identifier without throwing. */
export function isValidTimeZone(tz: string): tz is IANATimeZone {
  return DateTime.local().setZone(tz).isValid;
}

/** Validate a YYYY-MM-DD calendar-date string. */
export function isValidCalendarDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && DateTime.fromISO(date).isValid;
}

/**
 * Convert a calendar date + minutes-of-day (in a specific zone) into an
 * absolute instant, correctly accounting for DST transitions.
 *
 * On "spring forward" gaps Luxon rolls forward to the next valid instant; on
 * "fall back" overlaps it picks the earlier offset — both deterministic.
 */
export function zonedDateTimeToUtc(
  date: string,
  minuteOfDay: MinutesOfDay,
  timeZone: IANATimeZone,
): Date {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  const dt = DateTime.fromObject(
    {
      year,
      month,
      day,
      hour: Math.floor(minuteOfDay / 60),
      minute: minuteOfDay % 60,
    },
    { zone: timeZone },
  );
  if (!dt.isValid) {
    throw new Error(`Invalid zoned datetime: ${date} ${minuteOfDay} ${timeZone}`);
  }
  return dt.toUTC().toJSDate();
}

/** Number of whole minutes between two instants (b - a). */
export function diffMinutes(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

/** Add minutes to an instant, returning a new Date. */
export function addMinutes(instant: Date, minutes: number): Date {
  return new Date(instant.getTime() + minutes * 60000);
}

/** The weekday (0=Sunday..6=Saturday) for an instant, evaluated in a zone. */
export function weekdayInZone(instant: Date, timeZone: IANATimeZone): number {
  // Luxon weekday: 1=Mon..7=Sun. Normalize to JS 0=Sun..6=Sat.
  const luxonWeekday = DateTime.fromJSDate(instant, { zone: timeZone }).weekday;
  return luxonWeekday % 7;
}

/** The YYYY-MM-DD calendar date of an instant, evaluated in a zone. */
export function calendarDateInZone(instant: Date, timeZone: IANATimeZone): string {
  return DateTime.fromJSDate(instant, { zone: timeZone }).toFormat('yyyy-MM-dd');
}

/** Convert a JS Date to an ISO-8601 UTC string. */
export function toISO(instant: Date): ISODateString {
  return instant.toISOString();
}

/** Parse an ISO string into a Date, throwing on invalid input. */
export function fromISO(iso: string): Date {
  const dt = DateTime.fromISO(iso, { zone: 'utc' });
  if (!dt.isValid) {
    throw new Error(`Invalid ISO datetime: ${iso}`);
  }
  return dt.toJSDate();
}

/**
 * Enumerate calendar dates (YYYY-MM-DD) in a zone between two instants,
 * inclusive of both boundary days. Used to iterate the booking window.
 */
export function enumerateDatesInZone(
  from: Date,
  to: Date,
  timeZone: IANATimeZone,
): string[] {
  const start = DateTime.fromJSDate(from, { zone: timeZone }).startOf('day');
  const end = DateTime.fromJSDate(to, { zone: timeZone }).startOf('day');
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(cursor.toFormat('yyyy-MM-dd'));
    cursor = cursor.plus({ days: 1 });
  }
  return dates;
}

/**
 * Enumerate calendar dates (YYYY-MM-DD) inclusively between two calendar-date
 * strings. Zone-independent — pure date arithmetic.
 */
export function enumerateDates(fromDate: string, toDate: string): string[] {
  const start = DateTime.fromISO(fromDate, { zone: 'utc' }).startOf('day');
  const end = DateTime.fromISO(toDate, { zone: 'utc' }).startOf('day');
  if (!start.isValid || !end.isValid) {
    throw new Error(`Invalid date range: ${fromDate}..${toDate}`);
  }
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(cursor.toFormat('yyyy-MM-dd'));
    cursor = cursor.plus({ days: 1 });
  }
  return dates;
}
