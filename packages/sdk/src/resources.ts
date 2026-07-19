import type {
  AvailableSlot,
  Booking,
  EventType,
  IntegrationConnection,
  IntegrationHealthReport,
  IntegrationLog,
  Organization,
  ProviderDescriptor,
  Schedule,
  WebhookDelivery,
  WebhookEndpoint,
} from '@invincible/types';
import type {
  CancelBookingInput,
  CreateConnectionInput,
  CreateBookingInput,
  CreateEventTypeInput,
  CreateOrganizationInput,
  CreateScheduleInput,
  CreateWebhookEndpointInput,
  InviteMemberInput,
  StartOAuthInput,
  UpdateConnectionInput,
  UpdateEventTypeInput,
  UpdateScheduleInput,
  UpdateWebhookEndpointInput,
} from '@invincible/utils';

import type { HttpClient, RequestOptions } from './http-client';

/** Options for organization-scoped calls. */
type OrgScoped = { organizationId: string } & Pick<RequestOptions, 'headers' | 'signal'>;

export class OrganizationsResource {
  constructor(private readonly http: HttpClient) {}

  list(options?: RequestOptions): Promise<Array<Organization & { role: string }>> {
    return this.http.get('/organizations', options);
  }

  create(input: CreateOrganizationInput, options?: RequestOptions): Promise<Organization> {
    return this.http.post('/organizations', input, options);
  }

  invite(input: InviteMemberInput, options: OrgScoped) {
    return this.http.post<{ id: string; email: string; expiresAt: string }>(
      '/organizations/invitations',
      input,
      options,
    );
  }
}

export class SchedulesResource {
  constructor(private readonly http: HttpClient) {}

  list(options: OrgScoped): Promise<Schedule[]> {
    return this.http.get('/schedules', options);
  }

  get(id: string, options: OrgScoped): Promise<Schedule> {
    return this.http.get(`/schedules/${id}`, options);
  }

  create(input: CreateScheduleInput, options: OrgScoped): Promise<Schedule> {
    return this.http.post('/schedules', input, options);
  }

  update(id: string, input: UpdateScheduleInput, options: OrgScoped): Promise<Schedule> {
    return this.http.patch(`/schedules/${id}`, input, options);
  }

  remove(id: string, options: OrgScoped): Promise<void> {
    return this.http.delete(`/schedules/${id}`, options);
  }
}

export class EventTypesResource {
  constructor(private readonly http: HttpClient) {}

  list(options: OrgScoped): Promise<EventType[]> {
    return this.http.get('/event-types', options);
  }

  get(id: string, options: OrgScoped): Promise<EventType> {
    return this.http.get(`/event-types/${id}`, options);
  }

  create(input: CreateEventTypeInput, options: OrgScoped): Promise<EventType> {
    return this.http.post('/event-types', input, options);
  }

  update(id: string, input: UpdateEventTypeInput, options: OrgScoped): Promise<EventType> {
    return this.http.patch(`/event-types/${id}`, input, options);
  }

  remove(id: string, options: OrgScoped): Promise<void> {
    return this.http.delete(`/event-types/${id}`, options);
  }
}

export class BookingsResource {
  constructor(private readonly http: HttpClient) {}

  list(options: OrgScoped & { upcoming?: boolean }): Promise<Booking[]> {
    return this.http.get('/bookings', {
      ...options,
      query: options.upcoming ? { upcoming: true } : {},
    });
  }
}

export interface BookingPage {
  organization: {
    name: string;
    slug: string;
    logoUrl: string | null;
    timeZone: string;
  };
  eventType: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    durationMinutes: number;
    kind: string;
    color: string;
    locations: { type: string; value: string | null }[];
    host: { name: string; image: string | null; timeZone: string };
  };
}

/** Organization-scoped integration management (catalog, connections, webhooks). */
export class IntegrationsResource {
  constructor(private readonly http: HttpClient) {}

  /** The full catalog of available providers (secret-free descriptors). */
  catalog(options: OrgScoped): Promise<ProviderDescriptor[]> {
    return this.http.get('/integrations/catalog', options);
  }

  listConnections(options: OrgScoped): Promise<IntegrationConnection[]> {
    return this.http.get('/integrations/connections', options);
  }

  getConnection(id: string, options: OrgScoped): Promise<IntegrationConnection> {
    return this.http.get(`/integrations/connections/${id}`, options);
  }

  /** Create a connection with directly-supplied credentials (non-OAuth). */
  createConnection(
    input: CreateConnectionInput,
    options: OrgScoped,
  ): Promise<IntegrationConnection> {
    return this.http.post('/integrations/connections', input, options);
  }

  updateConnection(
    id: string,
    input: UpdateConnectionInput,
    options: OrgScoped,
  ): Promise<IntegrationConnection> {
    return this.http.patch(`/integrations/connections/${id}`, input, options);
  }

  removeConnection(id: string, options: OrgScoped): Promise<void> {
    return this.http.delete(`/integrations/connections/${id}`, options);
  }

  /** Run an on-demand health probe for a connection. */
  verifyConnection(id: string, options: OrgScoped): Promise<IntegrationHealthReport> {
    return this.http.post(`/integrations/connections/${id}/verify`, undefined, options);
  }

  /** Begin an OAuth authorize flow; returns the provider consent URL. */
  startOAuth(input: StartOAuthInput, options: OrgScoped): Promise<{ authorizeUrl: string }> {
    return this.http.post('/integrations/oauth/authorize', input, options);
  }

  listLogs(
    options: OrgScoped & {
      connectionId?: string;
      provider?: string;
      status?: string;
      limit?: number;
    },
  ): Promise<IntegrationLog[]> {
    const { connectionId, provider, status, limit, ...rest } = options;
    return this.http.get('/integrations/logs', {
      ...rest,
      query: { connectionId, provider, status, limit },
    });
  }

  // --- Outbound webhooks -----------------------------------------------------

  listWebhookEndpoints(options: OrgScoped): Promise<WebhookEndpoint[]> {
    return this.http.get('/integrations/webhook-endpoints', options);
  }

  createWebhookEndpoint(
    input: CreateWebhookEndpointInput,
    options: OrgScoped,
  ): Promise<WebhookEndpoint & { secret: string }> {
    return this.http.post('/integrations/webhook-endpoints', input, options);
  }

  updateWebhookEndpoint(
    id: string,
    input: UpdateWebhookEndpointInput,
    options: OrgScoped,
  ): Promise<WebhookEndpoint> {
    return this.http.patch(`/integrations/webhook-endpoints/${id}`, input, options);
  }

  removeWebhookEndpoint(id: string, options: OrgScoped): Promise<void> {
    return this.http.delete(`/integrations/webhook-endpoints/${id}`, options);
  }

  listWebhookDeliveries(
    options: OrgScoped & { endpointId?: string },
  ): Promise<WebhookDelivery[]> {
    const { endpointId, ...rest } = options;
    return this.http.get('/integrations/webhook-deliveries', {
      ...rest,
      query: { endpointId },
    });
  }
}

/** Unauthenticated public booking endpoints. */
export class PublicResource {
  constructor(private readonly http: HttpClient) {}

  getBookingPage(orgSlug: string, eventSlug: string, options?: RequestOptions): Promise<BookingPage> {
    return this.http.get(`/public/booking-pages/${orgSlug}/${eventSlug}`, options);
  }

  getAvailability(
    eventTypeId: string,
    params: { from: string; to: string; timeZone: string },
    options?: RequestOptions,
  ): Promise<AvailableSlot[]> {
    return this.http.get(`/public/event-types/${eventTypeId}/availability`, {
      ...options,
      query: params,
    });
  }

  createBooking(input: CreateBookingInput, options?: RequestOptions): Promise<Booking> {
    return this.http.post('/public/bookings', input, options);
  }

  getBooking(reference: string, options?: RequestOptions): Promise<Booking> {
    return this.http.get(`/public/bookings/${reference}`, options);
  }

  cancelBooking(
    reference: string,
    input: CancelBookingInput,
    options?: RequestOptions,
  ): Promise<Booking> {
    return this.http.post(`/public/bookings/${reference}/cancel`, input, options);
  }
}
