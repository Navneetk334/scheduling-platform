/**
 * Core domain entity shapes. These are transport/DTO-level representations
 * (what the API returns and the web consumes), decoupled from the Prisma
 * persistence models.
 */

import type {
  AuditFields,
  IANATimeZone,
  MinutesOfDay,
  SoftDeletable,
  OrganizationId,
  UserId,
  MembershipId,
  ScheduleId,
  MeetingTypeId,
  BookingId,
  GuestId,
  ISODateString,
} from './common';
import type {
  GuestRole,
  BookingStatus,
  CalendarProvider,
  MeetingTypeKind,
  LocationType,
  MembershipStatus,
  OrganizationRole,
  Weekday,
} from './enums';

export interface Organization extends AuditFields, SoftDeletable {
  readonly id: OrganizationId;
  readonly name: string;
  /** URL-safe unique handle used in public booking links. */
  readonly slug: string;
  readonly logoUrl: string | null;
  readonly timeZone: IANATimeZone;
}

export interface User extends AuditFields {
  readonly id: UserId;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly timeZone: IANATimeZone;
  readonly emailVerified: boolean;
}

export interface Membership extends AuditFields {
  readonly id: MembershipId;
  readonly organizationId: OrganizationId;
  readonly userId: UserId;
  readonly role: OrganizationRole;
  readonly status: MembershipStatus;
}

/** A recurring weekly availability rule (e.g. Mon–Fri 09:00–17:00). */
export interface AvailabilityRule {
  readonly weekday: Weekday;
  readonly startMinute: MinutesOfDay;
  readonly endMinute: MinutesOfDay;
}

/** A specific-date override that replaces the weekly rules for that date. */
export interface DateOverride {
  /** Calendar date in YYYY-MM-DD (interpreted in the schedule's timezone). */
  readonly date: string;
  /** Empty array means the day is fully unavailable. */
  readonly intervals: readonly { startMinute: MinutesOfDay; endMinute: MinutesOfDay }[];
}

export interface Schedule extends AuditFields {
  readonly id: ScheduleId;
  readonly organizationId: OrganizationId;
  readonly ownerId: UserId;
  readonly name: string;
  readonly timeZone: IANATimeZone;
  readonly isDefault: boolean;
  readonly rules: readonly AvailabilityRule[];
  readonly overrides: readonly DateOverride[];
}

export interface MeetingTypeLocation {
  readonly type: LocationType;
  /** Free-form address/URL/phone depending on `type`. */
  readonly value: string | null;
}

export interface MeetingType extends AuditFields, SoftDeletable {
  readonly id: MeetingTypeId;
  readonly organizationId: OrganizationId;
  readonly ownerId: UserId;
  readonly scheduleId: ScheduleId;
  readonly kind: MeetingTypeKind;
  readonly title: string;
  readonly slug: string;
  readonly description: string | null;
  readonly durationMinutes: number;
  /** Padding before a meeting, in minutes. */
  readonly bufferBeforeMinutes: number;
  /** Padding after a meeting, in minutes. */
  readonly bufferAfterMinutes: number;
  /** Minimum lead time before a slot can be booked, in minutes. */
  readonly minimumNoticeMinutes: number;
  /** How far into the future bookings are allowed, in days. */
  readonly bookingWindowDays: number;
  /** Slot start increment, in minutes (e.g. 15 → :00, :15, :30, :45). */
  readonly slotIntervalMinutes: number;
  /** Max concurrent bookings per slot (relevant for GROUP). */
  readonly seatsPerSlot: number;
  readonly locations: readonly MeetingTypeLocation[];
  readonly isActive: boolean;
  readonly color: string;
}

export interface Guest {
  readonly id: GuestId;
  readonly role: GuestRole;
  readonly name: string;
  readonly email: string;
  readonly timeZone: IANATimeZone;
  readonly userId: UserId | null;
}

export interface Booking extends AuditFields {
  readonly id: BookingId;
  readonly organizationId: OrganizationId;
  readonly meetingTypeId: MeetingTypeId;
  readonly status: BookingStatus;
  readonly startTime: ISODateString;
  readonly endTime: ISODateString;
  readonly timeZone: IANATimeZone;
  readonly guests: readonly Guest[];
  readonly location: MeetingTypeLocation | null;
  readonly meetingUrl: string | null;
  readonly notes: string | null;
  readonly cancelReason: string | null;
  /** Idempotency / public reference shown to invitees. */
  readonly reference: string;
}

export interface CalendarConnection extends AuditFields {
  readonly id: string;
  readonly userId: UserId;
  readonly provider: CalendarProvider;
  readonly email: string;
  readonly isPrimary: boolean;
  readonly syncEnabled: boolean;
}

/** A bookable slot surfaced to the public booking page. */
export interface AvailableSlot {
  readonly start: ISODateString;
  readonly end: ISODateString;
  readonly seatsRemaining: number;
}
