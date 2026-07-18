import type {
  EngineEventTypeConfig,
  EngineScheduleConfig,
} from '@invincible/utils';

/** Prisma shapes needed to build engine inputs (structural typing). */
interface RuleRow {
  weekday: number;
  startMinute: number;
  endMinute: number;
}
interface OverrideRow {
  date: string;
  intervals: { startMinute: number; endMinute: number }[];
}
interface ScheduleRow {
  timeZone: string;
  rules: RuleRow[];
  overrides: OverrideRow[];
}
interface EventTypeRow {
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minimumNoticeMinutes: number;
  bookingWindowDays: number;
  slotIntervalMinutes: number;
  seatsPerSlot: number;
}

export function toEngineSchedule(schedule: ScheduleRow): EngineScheduleConfig {
  return {
    timeZone: schedule.timeZone,
    rules: schedule.rules.map((r) => ({
      weekday: r.weekday,
      startMinute: r.startMinute,
      endMinute: r.endMinute,
    })),
    overrides: schedule.overrides.map((o) => ({
      date: o.date,
      intervals: o.intervals.map((i) => ({ startMinute: i.startMinute, endMinute: i.endMinute })),
    })),
  };
}

export function toEngineEventType(eventType: EventTypeRow): EngineEventTypeConfig {
  return {
    durationMinutes: eventType.durationMinutes,
    bufferBeforeMinutes: eventType.bufferBeforeMinutes,
    bufferAfterMinutes: eventType.bufferAfterMinutes,
    minimumNoticeMinutes: eventType.minimumNoticeMinutes,
    bookingWindowDays: eventType.bookingWindowDays,
    slotIntervalMinutes: eventType.slotIntervalMinutes,
    seatsPerSlot: eventType.seatsPerSlot,
  };
}
