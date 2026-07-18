import type { IANATimeZone, MinutesOfDay } from '@invincible/types';

/** A half-open absolute time interval [start, end). */
export interface Interval {
  readonly start: Date;
  readonly end: Date;
}

/** Weekly recurring availability rule (schedule-local minutes). */
export interface EngineAvailabilityRule {
  /** 0=Sunday .. 6=Saturday. */
  readonly weekday: number;
  readonly startMinute: MinutesOfDay;
  readonly endMinute: number;
}

/** Specific-date override. Empty `intervals` means fully unavailable. */
export interface EngineDateOverride {
  readonly date: string; // YYYY-MM-DD (schedule zone)
  readonly intervals: readonly { startMinute: MinutesOfDay; endMinute: number }[];
}

export interface EngineScheduleConfig {
  readonly timeZone: IANATimeZone;
  readonly rules: readonly EngineAvailabilityRule[];
  readonly overrides: readonly EngineDateOverride[];
}

export interface EngineMeetingTypeConfig {
  readonly durationMinutes: number;
  readonly bufferBeforeMinutes: number;
  readonly bufferAfterMinutes: number;
  readonly minimumNoticeMinutes: number;
  readonly bookingWindowDays: number;
  readonly slotIntervalMinutes: number;
  readonly seatsPerSlot: number;
}

export interface GenerateSlotsParams {
  /** Current instant. Injected for deterministic behavior/testing. */
  readonly now: Date;
  /** Inclusive first calendar date (YYYY-MM-DD), interpreted in schedule zone. */
  readonly fromDate: string;
  /** Inclusive last calendar date (YYYY-MM-DD), interpreted in schedule zone. */
  readonly toDate: string;
  readonly meetingType: EngineMeetingTypeConfig;
  readonly schedule: EngineScheduleConfig;
  /**
   * Hard-blocking busy intervals for the host: existing bookings for *other*
   * meeting types, and external calendar events. Buffers are applied by the
   * engine, so pass raw busy times here.
   *
   * For GROUP meeting types, do NOT include this event's own concurrent
   * bookings here — supply them via {@link seatMap} instead.
   */
  readonly busyIntervals?: readonly Interval[];
  /** Map of slot-start ISO string → seats already taken (GROUP events). */
  readonly seatMap?: ReadonlyMap<string, number>;
}

export interface GeneratedSlot {
  readonly start: Date;
  readonly end: Date;
  readonly seatsRemaining: number;
}
