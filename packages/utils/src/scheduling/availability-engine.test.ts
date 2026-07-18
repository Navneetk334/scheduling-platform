import { describe, expect, it } from 'vitest';

import { generateAvailableSlots, isSlotBookable } from './availability-engine';
import type { EngineMeetingTypeConfig, EngineScheduleConfig } from './types';

/** Mon–Fri 09:00–17:00 in New York. */
const nySchedule: EngineScheduleConfig = {
  timeZone: 'America/New_York',
  rules: [1, 2, 3, 4, 5].map((weekday) => ({
    weekday,
    startMinute: 9 * 60,
    endMinute: 17 * 60,
  })),
  overrides: [],
};

const baseEvent: EngineMeetingTypeConfig = {
  durationMinutes: 30,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  minimumNoticeMinutes: 0,
  bookingWindowDays: 60,
  slotIntervalMinutes: 15,
  seatsPerSlot: 1,
};

const iso = (d: Date): string => d.toISOString();

describe('generateAvailableSlots — basics', () => {
  it('generates 30-min slots across a NY working day (EDT, summer)', () => {
    // 2026-07-13 is a Monday. Working 09:00–17:00 EDT = 13:00–21:00 UTC.
    const slots = generateAvailableSlots({
      now: new Date('2026-07-10T00:00:00.000Z'),
      fromDate: '2026-07-13',
      toDate: '2026-07-13',
      meetingType: baseEvent,
      schedule: nySchedule,
    });

    expect(slots).toHaveLength(31);
    expect(iso(slots[0]!.start)).toBe('2026-07-13T13:00:00.000Z');
    expect(iso(slots[0]!.end)).toBe('2026-07-13T13:30:00.000Z');
    expect(iso(slots.at(-1)!.start)).toBe('2026-07-13T20:30:00.000Z');
    expect(slots.every((s) => s.seatsRemaining === 1)).toBe(true);
  });

  it('applies the correct offset in winter (EST, UTC-5)', () => {
    // 2026-01-05 is a Monday. Working 09:00–17:00 EST = 14:00–22:00 UTC.
    const slots = generateAvailableSlots({
      now: new Date('2026-01-01T00:00:00.000Z'),
      fromDate: '2026-01-05',
      toDate: '2026-01-05',
      meetingType: baseEvent,
      schedule: nySchedule,
    });
    expect(iso(slots[0]!.start)).toBe('2026-01-05T14:00:00.000Z');
    expect(iso(slots.at(-1)!.start)).toBe('2026-01-05T21:30:00.000Z');
  });

  it('returns no slots on a weekend (no matching weekly rule)', () => {
    const slots = generateAvailableSlots({
      now: new Date('2026-07-10T00:00:00.000Z'),
      fromDate: '2026-07-18', // Saturday
      toDate: '2026-07-18',
      meetingType: baseEvent,
      schedule: nySchedule,
    });
    expect(slots).toHaveLength(0);
  });

  it('spans multiple days inclusively', () => {
    const slots = generateAvailableSlots({
      now: new Date('2026-07-10T00:00:00.000Z'),
      fromDate: '2026-07-13', // Mon
      toDate: '2026-07-15', // Wed
      meetingType: baseEvent,
      schedule: nySchedule,
    });
    const days = new Set(slots.map((s) => s.start.toISOString().slice(0, 10)));
    expect([...days].sort()).toEqual(['2026-07-13', '2026-07-14', '2026-07-15']);
  });
});

describe('generateAvailableSlots — constraints', () => {
  it('enforces minimum notice', () => {
    // now = 10:00 NY (14:00 UTC) on the target Monday, 120-min notice.
    const slots = generateAvailableSlots({
      now: new Date('2026-07-13T14:00:00.000Z'),
      fromDate: '2026-07-13',
      toDate: '2026-07-13',
      meetingType: { ...baseEvent, minimumNoticeMinutes: 120 },
      schedule: nySchedule,
    });
    // Earliest bookable is 16:00 UTC.
    expect(iso(slots[0]!.start)).toBe('2026-07-13T16:00:00.000Z');
  });

  it('enforces the rolling booking window', () => {
    const slots = generateAvailableSlots({
      now: new Date('2026-07-10T00:00:00.000Z'),
      fromDate: '2026-07-10',
      toDate: '2027-01-01',
      meetingType: { ...baseEvent, bookingWindowDays: 3 },
      schedule: nySchedule,
    });
    const windowEnd = new Date('2026-07-13T00:00:00.000Z').getTime();
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every((s) => s.start.getTime() <= windowEnd)).toBe(true);
  });

  it('blocks slots that conflict with busy intervals (including buffers)', () => {
    const slots = generateAvailableSlots({
      now: new Date('2026-07-10T00:00:00.000Z'),
      fromDate: '2026-07-13',
      toDate: '2026-07-13',
      meetingType: { ...baseEvent, bufferBeforeMinutes: 15, bufferAfterMinutes: 15 },
      schedule: nySchedule,
      busyIntervals: [
        { start: new Date('2026-07-13T15:00:00.000Z'), end: new Date('2026-07-13T15:30:00.000Z') },
      ],
    });
    const starts = slots.map((s) => iso(s.start));
    // 14:45–15:15 padded to 14:30–15:30 → conflicts.
    expect(starts).not.toContain('2026-07-13T14:45:00.000Z');
    // 15:15–15:45 padded to 15:00–16:00 → conflicts with [15:00,15:30).
    expect(starts).not.toContain('2026-07-13T15:15:00.000Z');
    // 15:45–16:15 padded to 15:30–16:30 → free.
    expect(starts).toContain('2026-07-13T15:45:00.000Z');
  });
});

describe('generateAvailableSlots — overrides & seats', () => {
  it('treats an empty override as a fully blocked day', () => {
    const slots = generateAvailableSlots({
      now: new Date('2026-07-10T00:00:00.000Z'),
      fromDate: '2026-07-13',
      toDate: '2026-07-13',
      meetingType: baseEvent,
      schedule: { ...nySchedule, overrides: [{ date: '2026-07-13', intervals: [] }] },
    });
    expect(slots).toHaveLength(0);
  });

  it('uses override intervals in place of weekly rules', () => {
    const slots = generateAvailableSlots({
      now: new Date('2026-07-10T00:00:00.000Z'),
      fromDate: '2026-07-13',
      toDate: '2026-07-13',
      meetingType: baseEvent,
      schedule: {
        ...nySchedule,
        overrides: [
          { date: '2026-07-13', intervals: [{ startMinute: 13 * 60, endMinute: 14 * 60 }] },
        ],
      },
    });
    // 13:00–14:00 NY = 17:00–18:00 UTC → starts 17:00, 17:15, 17:30.
    expect(slots.map((s) => iso(s.start))).toEqual([
      '2026-07-13T17:00:00.000Z',
      '2026-07-13T17:15:00.000Z',
      '2026-07-13T17:30:00.000Z',
    ]);
  });

  it('honors seat maps for GROUP meeting types', () => {
    const seatMap = new Map<string, number>([
      ['2026-07-13T13:00:00.000Z', 2],
      ['2026-07-13T13:15:00.000Z', 3],
    ]);
    const slots = generateAvailableSlots({
      now: new Date('2026-07-10T00:00:00.000Z'),
      fromDate: '2026-07-13',
      toDate: '2026-07-13',
      meetingType: { ...baseEvent, seatsPerSlot: 3 },
      schedule: nySchedule,
      seatMap,
    });
    const byStart = new Map(slots.map((s) => [iso(s.start), s.seatsRemaining]));
    expect(byStart.get('2026-07-13T13:00:00.000Z')).toBe(1);
    expect(byStart.has('2026-07-13T13:15:00.000Z')).toBe(false); // fully booked
    expect(byStart.get('2026-07-13T13:30:00.000Z')).toBe(3);
  });
});

describe('isSlotBookable', () => {
  const commonParams = {
    now: new Date('2026-07-10T00:00:00.000Z'),
    meetingType: baseEvent,
    schedule: nySchedule,
  };

  it('accepts a valid aligned slot', () => {
    expect(isSlotBookable(new Date('2026-07-13T13:00:00.000Z'), commonParams)).toBe(true);
  });

  it('rejects a misaligned start', () => {
    expect(isSlotBookable(new Date('2026-07-13T13:07:00.000Z'), commonParams)).toBe(false);
  });

  it('rejects a slot outside working hours', () => {
    expect(isSlotBookable(new Date('2026-07-13T05:00:00.000Z'), commonParams)).toBe(false);
  });

  it('rejects a slot that conflicts with busy time', () => {
    expect(
      isSlotBookable(new Date('2026-07-13T13:00:00.000Z'), {
        ...commonParams,
        busyIntervals: [
          {
            start: new Date('2026-07-13T13:00:00.000Z'),
            end: new Date('2026-07-13T13:30:00.000Z'),
          },
        ],
      }),
    ).toBe(false);
  });
});
