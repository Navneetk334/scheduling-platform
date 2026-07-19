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

export const EventTypeKind = {
  /** A single host meets a single invitee. */
  OneOnOne: 'ONE_ON_ONE',
  /** A single host meets multiple invitees in one slot. */
  Group: 'GROUP',
  /** Bookings distributed across a pool of hosts. */
  RoundRobin: 'ROUND_ROBIN',
  /** Multiple hosts must all attend. */
  Collective: 'COLLECTIVE',
} as const;
export type EventTypeKind = (typeof EventTypeKind)[keyof typeof EventTypeKind];

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

export const AttendeeRole = {
  Host: 'HOST',
  Invitee: 'INVITEE',
  Guest: 'GUEST',
} as const;
export type AttendeeRole = (typeof AttendeeRole)[keyof typeof AttendeeRole];

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

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

/** Top-level grouping of what a provider integration does. */
export const IntegrationCategory = {
  Calendar: 'CALENDAR',
  Video: 'VIDEO',
  Payment: 'PAYMENT',
  Email: 'EMAIL',
  Sms: 'SMS',
  Crm: 'CRM',
  Automation: 'AUTOMATION',
  Messaging: 'MESSAGING',
} as const;
export type IntegrationCategory = (typeof IntegrationCategory)[keyof typeof IntegrationCategory];

/** How a connection authenticates against the third-party provider. */
export const IntegrationAuthType = {
  OAuth2: 'OAUTH2',
  ApiKey: 'API_KEY',
  Basic: 'BASIC',
  Smtp: 'SMTP',
  Webhook: 'WEBHOOK',
  None: 'NONE',
} as const;
export type IntegrationAuthType = (typeof IntegrationAuthType)[keyof typeof IntegrationAuthType];

export const IntegrationConnectionStatus = {
  Pending: 'PENDING',
  Active: 'ACTIVE',
  Disabled: 'DISABLED',
  Expired: 'EXPIRED',
  Error: 'ERROR',
} as const;
export type IntegrationConnectionStatus =
  (typeof IntegrationConnectionStatus)[keyof typeof IntegrationConnectionStatus];

export const IntegrationHealthStatus = {
  Unknown: 'UNKNOWN',
  Healthy: 'HEALTHY',
  Degraded: 'DEGRADED',
  Unhealthy: 'UNHEALTHY',
} as const;
export type IntegrationHealthStatus =
  (typeof IntegrationHealthStatus)[keyof typeof IntegrationHealthStatus];

export const IntegrationLogDirection = {
  Inbound: 'INBOUND',
  Outbound: 'OUTBOUND',
  Internal: 'INTERNAL',
} as const;
export type IntegrationLogDirection =
  (typeof IntegrationLogDirection)[keyof typeof IntegrationLogDirection];

export const IntegrationLogStatus = {
  Success: 'SUCCESS',
  Failure: 'FAILURE',
  Retrying: 'RETRYING',
  Skipped: 'SKIPPED',
} as const;
export type IntegrationLogStatus =
  (typeof IntegrationLogStatus)[keyof typeof IntegrationLogStatus];

export const WebhookDeliveryStatus = {
  Pending: 'PENDING',
  Delivering: 'DELIVERING',
  Delivered: 'DELIVERED',
  Retrying: 'RETRYING',
  Failed: 'FAILED',
  Dead: 'DEAD',
} as const;
export type WebhookDeliveryStatus =
  (typeof WebhookDeliveryStatus)[keyof typeof WebhookDeliveryStatus];
