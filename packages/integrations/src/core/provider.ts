/**
 * Provider plugin contracts. Every integration implements {@link BaseProvider}
 * (identity + health) plus exactly one capability interface for its category
 * (calendar, video, payment, ...). The orchestrator narrows a provider to its
 * capability using the category-based type guards at the bottom of this file.
 *
 * Adding a new provider is intentionally cheap: implement the relevant
 * interface and register the instance — no changes to the framework core.
 */

import type { IntegrationCategory, ProviderDescriptor } from '@invincible/types';

import type { HttpClient } from './http';

/** OAuth 2.0 endpoint metadata (secrets are injected by the app layer). */
export interface OAuthEndpoints {
  readonly authorizeUrl: string;
  readonly tokenUrl: string;
  readonly scopes: readonly string[];
  readonly authorizeParams?: Record<string, string>;
  readonly useBasicAuth?: boolean;
  readonly usePkce?: boolean;
  readonly scopeSeparator?: string;
}

/** Decrypted credential bag handed to a provider at call time. */
export type Credentials = Record<string, unknown>;

/** Everything a provider needs to perform an operation on a connection. */
export interface ProviderRuntimeContext {
  readonly connectionId: string;
  readonly organizationId: string;
  readonly provider: string;
  readonly credentials: Credentials;
  readonly config: Record<string, unknown>;
  /** Shared HTTP client (tests may inject a custom fetch here). */
  readonly http: HttpClient;
  /** Deterministic clock for tests. */
  readonly now: () => Date;
}

export interface ExternalAccount {
  readonly id: string;
  readonly email?: string;
  readonly name?: string;
}

export interface HealthCheckResult {
  readonly healthy: boolean;
  readonly message?: string;
  readonly latencyMs?: number;
}

/** Common identity + lifecycle every provider exposes. */
export interface BaseProvider {
  readonly descriptor: ProviderDescriptor;
  /** OAuth endpoint metadata for OAUTH2 providers. */
  readonly oauth?: OAuthEndpoints;
  /** Cheap liveness probe used by the health monitor. */
  healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult>;
  /** Resolve the connected external account (post-OAuth identity). */
  fetchAccount?(ctx: ProviderRuntimeContext): Promise<ExternalAccount>;
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export interface CalendarAttendee {
  readonly email: string;
  readonly name?: string;
  readonly optional?: boolean;
}

export interface CalendarEventInput {
  readonly title: string;
  readonly description?: string;
  readonly startTime: string; // ISO-8601
  readonly endTime: string; // ISO-8601
  readonly timeZone: string;
  readonly attendees: readonly CalendarAttendee[];
  readonly location?: string;
  /** Request an embedded conference link (e.g. Google Meet). */
  readonly createConference?: boolean;
  /** Correlation id (e.g. booking reference) for idempotency/traceability. */
  readonly correlationId?: string;
}

export interface CalendarEventRef {
  readonly externalId: string;
  readonly htmlLink?: string;
  readonly meetingUrl?: string;
  readonly raw?: unknown;
}

export interface BusyQuery {
  readonly from: string; // ISO-8601
  readonly to: string; // ISO-8601
  readonly calendarId?: string;
}

export interface BusyInterval {
  readonly start: string;
  readonly end: string;
}

export interface CalendarSyncResult {
  /** Opaque cursor to persist for the next incremental sync. */
  readonly cursor?: string;
  readonly changed: number;
}

export interface CalendarProvider extends BaseProvider {
  createEvent(ctx: ProviderRuntimeContext, input: CalendarEventInput): Promise<CalendarEventRef>;
  updateEvent(
    ctx: ProviderRuntimeContext,
    externalId: string,
    input: CalendarEventInput,
  ): Promise<CalendarEventRef>;
  deleteEvent(ctx: ProviderRuntimeContext, externalId: string): Promise<void>;
  getBusy(ctx: ProviderRuntimeContext, query: BusyQuery): Promise<BusyInterval[]>;
  /** Optional incremental sync driven by the background sync scheduler. */
  sync?(ctx: ProviderRuntimeContext, cursor?: string): Promise<CalendarSyncResult>;
}

// ---------------------------------------------------------------------------
// Video conferencing
// ---------------------------------------------------------------------------

export interface MeetingInput {
  readonly topic: string;
  readonly startTime: string; // ISO-8601
  readonly durationMinutes: number;
  readonly timeZone: string;
  readonly agenda?: string;
  readonly attendees?: readonly CalendarAttendee[];
  readonly correlationId?: string;
}

export interface MeetingLink {
  readonly externalId: string;
  readonly joinUrl: string;
  readonly password?: string;
  readonly hostUrl?: string;
  readonly raw?: unknown;
}

export interface VideoProvider extends BaseProvider {
  createMeeting(ctx: ProviderRuntimeContext, input: MeetingInput): Promise<MeetingLink>;
  deleteMeeting?(ctx: ProviderRuntimeContext, externalId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export interface CheckoutInput {
  /** Amount in the smallest currency unit (e.g. cents/paise). */
  readonly amountMinor: number;
  readonly currency: string;
  readonly description: string;
  /** Platform reference (e.g. booking reference) echoed back on webhooks. */
  readonly reference: string;
  readonly customerEmail?: string;
  readonly successUrl: string;
  readonly cancelUrl: string;
  readonly metadata?: Record<string, string>;
}

export interface CheckoutSession {
  readonly externalId: string;
  readonly url: string;
  readonly raw?: unknown;
}

export interface RefundInput {
  readonly paymentId: string;
  readonly amountMinor?: number;
  readonly reason?: string;
}

export interface RefundResult {
  readonly externalId: string;
  readonly status: string;
  readonly raw?: unknown;
}

export interface PaymentWebhookResult {
  readonly verified: boolean;
  readonly eventType?: string;
  readonly paymentId?: string;
  readonly reference?: string;
  readonly data?: unknown;
}

export interface PaymentProvider extends BaseProvider {
  createCheckout(ctx: ProviderRuntimeContext, input: CheckoutInput): Promise<CheckoutSession>;
  refund(ctx: ProviderRuntimeContext, input: RefundInput): Promise<RefundResult>;
  /** Verify + parse an inbound payment webhook using the connection secret. */
  verifyWebhook(
    ctx: ProviderRuntimeContext,
    rawBody: string,
    headers: Record<string, string>,
  ): PaymentWebhookResult | Promise<PaymentWebhookResult>;
}

// ---------------------------------------------------------------------------
// Email + SMS (shared delivery result)
// ---------------------------------------------------------------------------

export interface DeliveryResult {
  readonly externalId?: string;
  readonly accepted?: number;
  readonly raw?: unknown;
}

export interface EmailAddress {
  readonly email: string;
  readonly name?: string;
}

export interface EmailMessage {
  readonly to: readonly EmailAddress[];
  readonly from?: EmailAddress;
  readonly subject: string;
  readonly html?: string;
  readonly text?: string;
  readonly replyTo?: string;
  readonly cc?: readonly EmailAddress[];
  readonly bcc?: readonly EmailAddress[];
}

export interface EmailProvider extends BaseProvider {
  sendEmail(ctx: ProviderRuntimeContext, message: EmailMessage): Promise<DeliveryResult>;
}

export interface SmsMessage {
  readonly to: string;
  readonly from?: string;
  readonly body: string;
}

export interface SmsProvider extends BaseProvider {
  sendSms(ctx: ProviderRuntimeContext, message: SmsMessage): Promise<DeliveryResult>;
}

// ---------------------------------------------------------------------------
// CRM
// ---------------------------------------------------------------------------

export interface CrmContact {
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phone?: string;
  readonly company?: string;
  readonly properties?: Record<string, string | number | boolean>;
}

export interface CrmActivity {
  readonly contactEmail: string;
  readonly type: 'meeting' | 'note' | 'task' | 'call';
  readonly subject: string;
  readonly body?: string;
  readonly occurredAt?: string;
  readonly durationMinutes?: number;
}

export interface CrmRef {
  readonly externalId: string;
  readonly raw?: unknown;
}

export interface CrmProvider extends BaseProvider {
  upsertContact(ctx: ProviderRuntimeContext, contact: CrmContact): Promise<CrmRef>;
  logActivity(ctx: ProviderRuntimeContext, activity: CrmActivity): Promise<CrmRef>;
}

// ---------------------------------------------------------------------------
// Automation (Zapier / Make / n8n) — event fan-out to external workflows
// ---------------------------------------------------------------------------

export interface AutomationEvent {
  readonly event: string;
  readonly payload: Record<string, unknown>;
  readonly occurredAt?: string;
}

export interface AutomationProvider extends BaseProvider {
  emit(ctx: ProviderRuntimeContext, event: AutomationEvent): Promise<DeliveryResult>;
}

// ---------------------------------------------------------------------------
// Messaging / chat (Slack / Teams / Discord)
// ---------------------------------------------------------------------------

export interface ChatMessage {
  readonly text: string;
  readonly title?: string;
  readonly channel?: string;
  /** Provider-native rich content (Slack blocks, Discord embeds, etc.). */
  readonly rich?: unknown;
}

export interface MessagingProvider extends BaseProvider {
  sendMessage(ctx: ProviderRuntimeContext, message: ChatMessage): Promise<DeliveryResult>;
}

// ---------------------------------------------------------------------------
// Union + category type guards
// ---------------------------------------------------------------------------

export type AnyProvider =
  | CalendarProvider
  | VideoProvider
  | PaymentProvider
  | EmailProvider
  | SmsProvider
  | CrmProvider
  | AutomationProvider
  | MessagingProvider;

function categoryIs(p: BaseProvider, category: IntegrationCategory): boolean {
  return p.descriptor.category === category;
}

export function isCalendarProvider(p: BaseProvider): p is CalendarProvider {
  return categoryIs(p, 'CALENDAR');
}
export function isVideoProvider(p: BaseProvider): p is VideoProvider {
  return categoryIs(p, 'VIDEO');
}
export function isPaymentProvider(p: BaseProvider): p is PaymentProvider {
  return categoryIs(p, 'PAYMENT');
}
export function isEmailProvider(p: BaseProvider): p is EmailProvider {
  return categoryIs(p, 'EMAIL');
}
export function isSmsProvider(p: BaseProvider): p is SmsProvider {
  return categoryIs(p, 'SMS');
}
export function isCrmProvider(p: BaseProvider): p is CrmProvider {
  return categoryIs(p, 'CRM');
}
export function isAutomationProvider(p: BaseProvider): p is AutomationProvider {
  return categoryIs(p, 'AUTOMATION');
}
export function isMessagingProvider(p: BaseProvider): p is MessagingProvider {
  return categoryIs(p, 'MESSAGING');
}
