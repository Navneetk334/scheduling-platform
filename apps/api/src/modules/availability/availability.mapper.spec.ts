import { describe, expect, it } from 'vitest';

import { toEngineEventType, toEngineSchedule } from './availability.mapper';

describe('availability.mapper', () => {
  it('maps a Prisma schedule row to an engine schedule config', () => {
    const result = toEngineSchedule({
      timeZone: 'America/New_York',
      rules: [{ weekday: 1, startMinute: 540, endMinute: 1020 }],
      overrides: [{ date: '2026-07-13', intervals: [{ startMinute: 600, endMinute: 660 }] }],
    });
    expect(result.timeZone).toBe('America/New_York');
    expect(result.rules).toEqual([{ weekday: 1, startMinute: 540, endMinute: 1020 }]);
    expect(result.overrides[0]?.intervals).toEqual([{ startMinute: 600, endMinute: 660 }]);
  });

  it('maps a Prisma event type row to an engine event type config', () => {
    const result = toEngineEventType({
      durationMinutes: 30,
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 10,
      minimumNoticeMinutes: 120,
      bookingWindowDays: 45,
      slotIntervalMinutes: 15,
      seatsPerSlot: 1,
    });
    expect(result.durationMinutes).toBe(30);
    expect(result.bufferAfterMinutes).toBe(10);
    expect(result.seatsPerSlot).toBe(1);
  });
});
