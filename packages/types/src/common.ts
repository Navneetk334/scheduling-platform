/**
 * Common primitive and cross-cutting types shared across the platform.
 * Framework-free: no runtime dependencies allowed in this package.
 */

/** ISO-8601 timestamp string, e.g. "2026-07-18T09:30:00.000Z". */
export type ISODateString = string;

/** IANA timezone identifier, e.g. "America/New_York". */
export type IANATimeZone = string;

/** Minutes since midnight in a given day (0–1439). */
export type MinutesOfDay = number;

/** Branded ID helper to prevent mixing entity identifiers at the type level. */
export type Branded<T, B extends string> = T & { readonly __brand: B };

export type OrganizationId = Branded<string, 'OrganizationId'>;
export type UserId = Branded<string, 'UserId'>;
export type MembershipId = Branded<string, 'MembershipId'>;
export type ScheduleId = Branded<string, 'ScheduleId'>;
export type MeetingTypeId = Branded<string, 'MeetingTypeId'>;
export type BookingId = Branded<string, 'BookingId'>;
export type GuestId = Branded<string, 'GuestId'>;
export type BrandId = Branded<string, 'BrandId'>;
export type DomainId = Branded<string, 'DomainId'>;
export type BrandAssetId = Branded<string, 'BrandAssetId'>;
export type MessageTemplateId = Branded<string, 'MessageTemplateId'>;
export type LegalDocumentId = Branded<string, 'LegalDocumentId'>;

/** A half-open time interval [start, end). */
export interface TimeInterval {
  readonly start: ISODateString;
  readonly end: ISODateString;
}

/** Standard cursor pagination request. */
export interface PaginationParams {
  readonly cursor?: string;
  readonly limit?: number;
}

/** Standard cursor pagination envelope. */
export interface Paginated<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

/** Discriminated result type for operations that can fail without throwing. */
export type Result<T, E = AppErrorShape> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Serializable error contract returned by the API. */
export interface AppErrorShape {
  readonly code: string;
  readonly message: string;
  readonly statusCode: number;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly requestId?: string;
}

/** Fields present on every persisted entity. */
export interface AuditFields {
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

/** Soft-deletable entity marker. */
export interface SoftDeletable {
  readonly deletedAt: ISODateString | null;
}
