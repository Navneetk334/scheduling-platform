import { describe, expect, it } from 'vitest';

import {
  addMinutes,
  calendarDateInZone,
  diffMinutes,
  enumerateDatesInZone,
  fromISO,
  isValidCalendarDate,
  isValidTimeZone,
  toISO,
  weekdayInZone,
  zonedDateTimeToUtc,
} from './datetime';

describe('timezone validation', () => {
  it('accepts valid IANA zones', () => {
    expect(isValidTimeZone('America/New_York')).toBe(true);
    expect(isValidTimeZone('Europe/London')).toBe(true);
    expect(isValidTimeZone('UTC')).toBe(true);
  });

  it('rejects invalid zones', () => {
    expect(isValidTimeZone('Mars/Phobos')).toBe(false);
    expect(isValidTimeZone('not-a-zone')).toBe(false);
  });
});

describe('calendar date validation', () => {
  it('accepts YYYY-MM-DD', () => {
    expect(isValidCalendarDate('2026-07-18')).toBe(true);
  });
  it('rejects malformed or impossible dates', () => {
    expect(isValidCalendarDate('2026-7-8')).toBe(false);
    expect(isValidCalendarDate('2026-13-01')).toBe(false);
    expect(isValidCalendarDate('nope')).toBe(false);
  });
});

describe('zonedDateTimeToUtc', () => {
  it('converts New York morning to the correct UTC instant (EDT, summer)', () => {
    // 2026-07-18 09:00 EDT (UTC-4) → 13:00 UTC
    const utc = zonedDateTimeToUtc('2026-07-18', 9 * 60, 'America/New_York');
    expect(utc.toISOString()).toBe('2026-07-18T13:00:00.000Z');
  });

  it('converts New York morning correctly in winter (EST, UTC-5)', () => {
    // 2026-01-15 09:00 EST → 14:00 UTC
    const utc = zonedDateTimeToUtc('2026-01-15', 9 * 60, 'America/New_York');
    expect(utc.toISOString()).toBe('2026-01-15T14:00:00.000Z');
  });

  it('handles UTC directly', () => {
    const utc = zonedDateTimeToUtc('2026-07-18', 0, 'UTC');
    expect(utc.toISOString()).toBe('2026-07-18T00:00:00.000Z');
  });
});

describe('weekday + calendar helpers in zone', () => {
  it('computes weekday in zone (2026-07-18 is a Saturday)', () => {
    const instant = zonedDateTimeToUtc('2026-07-18', 12 * 60, 'America/New_York');
    expect(weekdayInZone(instant, 'America/New_York')).toBe(6); // Saturday
  });

  it('rolls date across midnight depending on zone', () => {
    // 2026-07-18 23:00 in New York is 2026-07-19 03:00 UTC.
    const instant = zonedDateTimeToUtc('2026-07-18', 23 * 60, 'America/New_York');
    expect(calendarDateInZone(instant, 'America/New_York')).toBe('2026-07-18');
    expect(calendarDateInZone(instant, 'UTC')).toBe('2026-07-19');
  });
});

describe('arithmetic + iteration helpers', () => {
  it('adds and diffs minutes', () => {
    const base = new Date('2026-07-18T10:00:00.000Z');
    expect(toISO(addMinutes(base, 90))).toBe('2026-07-18T11:30:00.000Z');
    expect(diffMinutes(base, addMinutes(base, 45))).toBe(45);
  });

  it('parses ISO strings', () => {
    expect(fromISO('2026-07-18T10:00:00.000Z').getTime()).toBe(
      new Date('2026-07-18T10:00:00.000Z').getTime(),
    );
    expect(() => fromISO('garbage')).toThrow();
  });

  it('enumerates inclusive date ranges in a zone', () => {
    const from = new Date('2026-07-18T04:00:00.000Z');
    const to = new Date('2026-07-20T04:00:00.000Z');
    expect(enumerateDatesInZone(from, to, 'UTC')).toEqual([
      '2026-07-18',
      '2026-07-19',
      '2026-07-20',
    ]);
  });
});
