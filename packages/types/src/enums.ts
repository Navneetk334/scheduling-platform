/**
 * Domain enumerations. Declared as const objects + union types so they are
 * usable as both runtime values and compile-time types without `enum`
 * (which has known interop/tree-shaking drawbacks).
 */

export const OrganizationRole = {
  Owner: 'OWNER',
  Admin: 'ADMIN',
  Member: 'MEMBER',
} as const;
export type OrganizationRole = (typeof OrganizationRole)[keyof typeof OrganizationRole];

export const MembershipStatus = {
  Active: 'ACTIVE',
  Invited: 'INVITED',
  Suspended: 'SUSPENDED',
} as const;
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];

export const MeetingTypeKind = {
  /** A single host meets a single invitee. */
  OneOnOne: 'ONE_ON_ONE',
  /** A single host meets multiple invitees in one slot. */
  Group: 'GROUP',
  /** Bookings distributed across a pool of hosts. */
  RoundRobin: 'ROUND_ROBIN',
  /** Multiple hosts must all attend. */
  Collective: 'COLLECTIVE',
} as const;
export type MeetingTypeKind = (typeof MeetingTypeKind)[keyof typeof MeetingTypeKind];

export const LocationType = {
  GoogleMeet: 'GOOGLE_MEET',
  Zoom: 'ZOOM',
  MicrosoftTeams: 'MICROSOFT_TEAMS',
  InPerson: 'IN_PERSON',
  Phone: 'PHONE',
  Custom: 'CUSTOM',
} as const;
export type LocationType = (typeof LocationType)[keyof typeof LocationType];

export const BookingStatus = {
  Confirmed: 'CONFIRMED',
  Cancelled: 'CANCELLED',
  Rescheduled: 'RESCHEDULED',
  Pending: 'PENDING',
  NoShow: 'NO_SHOW',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const GuestRole = {
  Host: 'HOST',
  Invitee: 'INVITEE',
  Guest: 'GUEST',
} as const;
export type GuestRole = (typeof GuestRole)[keyof typeof GuestRole];

export const CalendarProvider = {
  Google: 'GOOGLE',
  Microsoft: 'MICROSOFT',
  Apple: 'APPLE',
} as const;
export type CalendarProvider = (typeof CalendarProvider)[keyof typeof CalendarProvider];

export const Weekday = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
} as const;
export type Weekday = (typeof Weekday)[keyof typeof Weekday];

export const NotificationChannel = {
  Email: 'EMAIL',
  Sms: 'SMS',
  Webhook: 'WEBHOOK',
} as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];
