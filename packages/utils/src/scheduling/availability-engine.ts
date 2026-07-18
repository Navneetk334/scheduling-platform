import {
  addMinutes,
  calendarDateInZone,
  enumerateDates,
  weekdayInZone,
  zonedDateTimeToUtc,
} from '../datetime';

import { mergeIntervals, overlapsAny } from './interval';
import type {
  EngineDateOverride,
  EngineScheduleConfig,
  GenerateSlotsParams,
  GeneratedSlot,
  Interval,
} from './types';

/**
 * Compute the working intervals (as absolute instants) for a single calendar
 * date, honoring date overrides first, then falling back to weekly rules.
 */
function workingIntervalsForDate(
  date: string,
  schedule: EngineScheduleConfig,
  override: EngineDateOverride | undefined,
): Interval[] {
  const raw = override
    ? override.intervals
    : (() => {
        // Derive weekday from the date at local noon to avoid DST edge issues.
        const noon = zonedDateTimeToUtc(date, 12 * 60, schedule.timeZone);
        const weekday = weekdayInZone(noon, schedule.timeZone);
        return schedule.rules
          .filter((rule) => rule.weekday === weekday)
          .map((rule) => ({ startMinute: rule.startMinute, endMinute: rule.endMinute }));
      })();

  const intervals: Interval[] = raw.map((slot) => ({
    start: zonedDateTimeToUtc(date, slot.startMinute, schedule.timeZone),
    end: zonedDateTimeToUtc(date, slot.endMinute, schedule.timeZone),
  }));

  return mergeIntervals(intervals);
}

/**
 * Generate all bookable slots for an event type over a date range.
 *
 * The algorithm is timezone- and DST-correct: working windows are defined in
 * the schedule's zone and converted to absolute instants, while conflict
 * checks operate purely on absolute time. The function is pure and
 * deterministic given its inputs (including `now`).
 */
export function generateAvailableSlots(params: GenerateSlotsParams): GeneratedSlot[] {
  const { now, fromDate, toDate, eventType, schedule } = params;
  const busyIntervals = params.busyIntervals ?? [];
  const seatMap = params.seatMap ?? new Map<string, number>();

  const {
    durationMinutes,
    bufferBeforeMinutes,
    bufferAfterMinutes,
    minimumNoticeMinutes,
    bookingWindowDays,
    slotIntervalMinutes,
    seatsPerSlot,
  } = eventType;

  // Effective earliest bookable instant (minimum notice).
  const earliest = addMinutes(now, minimumNoticeMinutes);
  // Effective latest bookable instant (rolling booking window).
  const windowEnd = addMinutes(now, bookingWindowDays * 24 * 60);

  // Clamp the requested range to the rolling booking window, evaluated in the
  // schedule's zone so the last enumerated day matches the window boundary.
  const windowEndDate = calendarDateInZone(windowEnd, schedule.timeZone);
  const effectiveToDate = toDate < windowEndDate ? toDate : windowEndDate;
  if (effectiveToDate < fromDate) {
    return [];
  }

  const overridesByDate = new Map(schedule.overrides.map((o) => [o.date, o]));
  const dates = enumerateDates(fromDate, effectiveToDate);

  const slots: GeneratedSlot[] = [];

  for (const date of dates) {
    const working = workingIntervalsForDate(date, schedule, overridesByDate.get(date));

    for (const window of working) {
      let cursor = window.start;
      // Slot fits only if its end is within the working window.
      while (addMinutes(cursor, durationMinutes).getTime() <= window.end.getTime()) {
        const slotStart = cursor;
        const slotEnd = addMinutes(cursor, durationMinutes);

        // Advance cursor for the next iteration before any early-continue.
        cursor = addMinutes(cursor, slotIntervalMinutes);

        // Enforce minimum notice and rolling window.
        if (slotStart.getTime() < earliest.getTime()) continue;
        if (slotStart.getTime() > windowEnd.getTime()) continue;

        // Apply buffers when checking against host busy time.
        const paddedStart = addMinutes(slotStart, -bufferBeforeMinutes);
        const paddedEnd = addMinutes(slotEnd, bufferAfterMinutes);
        if (overlapsAny(paddedStart, paddedEnd, busyIntervals)) continue;

        // Seat accounting (GROUP events); 1 for one-on-one.
        const taken = seatMap.get(slotStart.toISOString()) ?? 0;
        const seatsRemaining = seatsPerSlot - taken;
        if (seatsRemaining <= 0) continue;

        slots.push({ start: slotStart, end: slotEnd, seatsRemaining });
      }
    }
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Validate that a specific requested start time is a legitimately bookable
 * slot. Used at booking time to defend against stale/forged slot selections.
 */
export function isSlotBookable(
  requestedStart: Date,
  params: Omit<GenerateSlotsParams, 'fromDate' | 'toDate'>,
): boolean {
  const date = calendarDateInZone(requestedStart, params.schedule.timeZone);
  const slots = generateAvailableSlots({ ...params, fromDate: date, toDate: date });
  const target = requestedStart.getTime();
  return slots.some((slot) => slot.start.getTime() === target);
}
