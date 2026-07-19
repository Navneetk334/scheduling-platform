/**
 * Integration transport/DTO shapes shared across the API, SDK and web. These
 * describe the *catalog* (code-driven provider descriptors) and the persisted
 * connections, logs and webhook subscriptions.
 *
 * Framework-free: no runtime dependencies allowed in this package.
 */

import type { AuditFields, ISODateString, OrganizationId } from './common';
import type {
  IntegrationAuthType,
  IntegrationCategory,
  IntegrationConnectionStatus,
  IntegrationHealthStatus,
  IntegrationLogDirection,
  IntegrationLogStatus,
  WebhookDeliveryStatus,
} from './enums';

/** A single OAuth scope requested by a provider, with a human description. */
export interface OAuthScopeDescriptor {
  readonly value: string;
  readonly description: string;
}

/** A non-secret configuration field a provider needs (e.g. SMTP host). */
export interface ProviderConfigField {
  readonly key: string;
  readonly label: string;
  readonly type: 'string' | 'number' | 'boolean' | 'select' | 'secret';
  readonly required: boolean;
  readonly placeholder?: string;
  readonly options?: readonly { readonly label: string; readonly value: string }[];
  readonly help?: string;
}

/**
 * Static, code-defined description of an available provider. Rendered in the
 * "Integrations" catalog UI and used to drive OAuth / API-key connect flows.
 */
export interface ProviderDescriptor {
  /** Stable identifier, e.g. "google_calendar". */
  readonly id: string;
  readonly name: string;
  readonly category: IntegrationCategory;
  readonly authType: IntegrationAuthType;
  readonly description: string;
  readonly docsUrl?: string;
  /** True when the provider can receive inbound webhooks from the third party. */
  readonly supportsInboundWebhooks: boolean;
  /** OAuth scopes requested during the authorize step (OAuth2 providers). */
  readonly oauthScopes?: readonly OAuthScopeDescriptor[];
  /** Credential fields collected for non-OAuth (API key / SMTP / basic) auth. */
  readonly credentialFields?: readonly ProviderConfigField[];
  /** Additional non-secret configuration fields. */
  readonly configFields?: readonly ProviderConfigField[];
}

/** A configured provider connection, as returned to clients (secret-free). */
export interface IntegrationConnection extends AuditFields {
  readonly id: string;
  readonly organizationId: OrganizationId;
  readonly provider: string;
  readonly category: IntegrationCategory;
  readonly authType: IntegrationAuthType;
  readonly displayName: string;
  readonly status: IntegrationConnectionStatus;
  readonly healthStatus: IntegrationHealthStatus;
  readonly scopes: readonly string[];
  readonly externalAccountId: string | null;
  readonly externalAccountEmail: string | null;
  readonly config: Readonly<Record<string, unknown>> | null;
  readonly tokenExpiresAt: ISODateString | null;
  readonly lastError: string | null;
  readonly lastHealthCheckAt: ISODateString | null;
  readonly lastSyncedAt: ISODateString | null;
}

export interface IntegrationLog {
  readonly id: string;
  readonly organizationId: OrganizationId;
  readonly connectionId: string | null;
  readonly provider: string;
  readonly category: IntegrationCategory;
  readonly direction: IntegrationLogDirection;
  readonly action: string;
  readonly status: IntegrationLogStatus;
  readonly httpStatus: number | null;
  readonly durationMs: number | null;
  readonly attempt: number;
  readonly error: string | null;
  readonly createdAt: ISODateString;
}

export interface WebhookEndpoint extends AuditFields {
  readonly id: string;
  readonly organizationId: OrganizationId;
  readonly url: string;
  readonly description: string | null;
  readonly events: readonly string[];
  readonly isActive: boolean;
}

export interface WebhookDelivery {
  readonly id: string;
  readonly endpointId: string;
  readonly eventType: string;
  readonly status: WebhookDeliveryStatus;
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly responseStatus: number | null;
  readonly error: string | null;
  readonly nextAttemptAt: ISODateString | null;
  readonly deliveredAt: ISODateString | null;
  readonly createdAt: ISODateString;
}

/** Result of a provider health probe. */
export interface IntegrationHealthReport {
  readonly connectionId: string;
  readonly provider: string;
  readonly status: IntegrationHealthStatus;
  readonly checkedAt: ISODateString;
  readonly latencyMs: number | null;
  readonly message: string | null;
}

/**
 * Canonical platform event names emitted to outbound webhooks and automation
 * providers. Extend as new domain events are introduced.
 */
export const PlatformWebhookEvent = {
  BookingCreated: 'booking.created',
  BookingRescheduled: 'booking.rescheduled',
  BookingCancelled: 'booking.cancelled',
  BookingCompleted: 'booking.completed',
  BookingNoShow: 'booking.no_show',
  InviteeCreated: 'invitee.created',
  PaymentSucceeded: 'payment.succeeded',
  PaymentRefunded: 'payment.refunded',
} as const;
export type PlatformWebhookEvent =
  (typeof PlatformWebhookEvent)[keyof typeof PlatformWebhookEvent];
