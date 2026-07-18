import type {
  EngineMeetingTypeConfig,
  EngineScheduleConfig,
} from '@invincible/utils';

/** Prisma shapes needed to build engine inputs (structural typing). */
interface WorkingHoursRow {
  weekday: number;
  startMinute: number;
  endMinute: number;
}
interface OverrideRow {
  date: string;
  isUnavailable: boolean;
  intervals: { startMinute: number; endMinute: number }[];
}
interface AvailabilityRow {
  timeZone: string;
  workingHours: WorkingHoursRow[];
  overrides: OverrideRow[];
}
interface MeetingTypeRow {
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minimumNoticeMinutes: number;
  bookingWindowDays: number;
  slotIntervalMinutes: number;
  seatsPerSlot: number;
}

export function toEngineSchedule(availability: AvailabilityRow): EngineScheduleConfig {
  return {
    timeZone: availability.timeZone,
    rules: availability.workingHours.map((r) => ({
      weekday: r.weekday,
      startMinute: r.startMinute,
      endMinute: r.endMinute,
    })),
    overrides: availability.overrides.map((o) => ({
      date: o.date,
      // An "unavailable" override blocks the whole day (empty intervals).
      intervals: o.isUnavailable
        ? []
        : o.intervals.map((i) => ({ startMinute: i.startMinute, endMinute: i.endMinute })),
    })),
  };
}

export function toEngineMeetingType(meetingType: MeetingTypeRow): EngineMeetingTypeConfig {
  return {
    durationMinutes: meetingType.durationMinutes,
    bufferBeforeMinutes: meetingType.bufferBeforeMinutes,
    bufferAfterMinutes: meetingType.bufferAfterMinutes,
    minimumNoticeMinutes: meetingType.minimumNoticeMinutes,
    bookingWindowDays: meetingType.bookingWindowDays,
    slotIntervalMinutes: meetingType.slotIntervalMinutes,
    seatsPerSlot: meetingType.seatsPerSlot,
  };
}
