import type { AvailableSlot, Booking, EventType, Organization, Schedule } from '@invincible/types';
import type {
  CancelBookingInput,
  CreateBookingInput,
  CreateEventTypeInput,
  CreateOrganizationInput,
  CreateScheduleInput,
  InviteMemberInput,
  UpdateEventTypeInput,
  UpdateScheduleInput,
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
