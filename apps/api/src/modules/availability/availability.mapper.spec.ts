import { describe, expect, it } from 'vitest';

import { toEngineMeetingType, toEngineSchedule } from './availability.mapper';

describe('availability.mapper', () => {
  it('maps a Prisma availability row to an engine schedule config', () => {
    const result = toEngineSchedule({
      timeZone: 'America/New_York',
      workingHours: [{ weekday: 1, startMinute: 540, endMinute: 1020 }],
      overrides: [
        { date: '2026-07-13', isUnavailable: false, intervals: [{ startMinute: 600, endMinute: 660 }] },
      ],
    });
    expect(result.timeZone).toBe('America/New_York');
    expect(result.rules).toEqual([{ weekday: 1, startMinute: 540, endMinute: 1020 }]);
    expect(result.overrides[0]?.intervals).toEqual([{ startMinute: 600, endMinute: 660 }]);
  });

  it('treats an unavailable override as a blocked day (empty intervals)', () => {
    const result = toEngineSchedule({
      timeZone: 'UTC',
      workingHours: [],
      overrides: [{ date: '2026-07-13', isUnavailable: true, intervals: [] }],
    });
    expect(result.overrides[0]?.intervals).toEqual([]);
  });

  it('maps a Prisma meeting type row to an engine meeting type config', () => {
    const result = toEngineMeetingType({
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
