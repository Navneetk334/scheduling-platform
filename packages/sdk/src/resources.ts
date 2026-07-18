import type { AvailableSlot, Booking, MeetingType, Organization, Schedule } from '@invincible/types';
import type {
  CancelBookingInput,
  CreateBookingInput,
  CreateMeetingTypeInput,
  CreateOrganizationInput,
  CreateScheduleInput,
  InviteMemberInput,
  UpdateMeetingTypeInput,
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

export class MeetingTypesResource {
  constructor(private readonly http: HttpClient) {}

  list(options: OrgScoped): Promise<MeetingType[]> {
    return this.http.get('/meeting-types', options);
  }

  get(id: string, options: OrgScoped): Promise<MeetingType> {
    return this.http.get(`/meeting-types/${id}`, options);
  }

  create(input: CreateMeetingTypeInput, options: OrgScoped): Promise<MeetingType> {
    return this.http.post('/meeting-types', input, options);
  }

  update(id: string, input: UpdateMeetingTypeInput, options: OrgScoped): Promise<MeetingType> {
    return this.http.patch(`/meeting-types/${id}`, input, options);
  }

  remove(id: string, options: OrgScoped): Promise<void> {
    return this.http.delete(`/meeting-types/${id}`, options);
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

export interface Money {
  amount: number; // minor units
  currency: string;
}

export interface PublicOrganizationProfile {
  name: string;
  slug: string;
  logoUrl: string | null;
  timeZone: string;
}

export interface PublicService {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  kind: string;
  color: string;
  staffCount: number;
  price: Money | null;
}

export interface PublicOrganization {
  organization: PublicOrganizationProfile;
  services: PublicService[];
}

export interface StaffMember {
  id: string;
  name: string;
  image: string | null;
}

/** Full booking detail returned by the public get-by-reference endpoint. */
export interface BookingDetail {
  id: string;
  reference: string;
  status: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  meetingTypeId: string;
  notes: string | null;
  cancelReason: string | null;
  guests: { id: string; name: string; email: string; role: string; isPrimary: boolean }[];
  meetingType: {
    id: string;
    title: string;
    slug: string;
    durationMinutes: number;
    color: string;
    locationLinks: { location: { kind: string; value: string | null } }[];
  };
}

export interface BookingPage {
  organization: PublicOrganizationProfile;
  meetingType: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    durationMinutes: number;
    kind: string;
    color: string;
    price: Money | null;
    locations: { type: string; value: string | null }[];
    host: { name: string; image: string | null; timeZone: string };
    staff: StaffMember[];
  };
}

/** Unauthenticated public booking endpoints. */
export class PublicResource {
  constructor(private readonly http: HttpClient) {}

  getOrganization(orgSlug: string, options?: RequestOptions): Promise<PublicOrganization> {
    return this.http.get(`/public/organizations/${orgSlug}`, options);
  }

  getBookingPage(orgSlug: string, eventSlug: string, options?: RequestOptions): Promise<BookingPage> {
    return this.http.get(`/public/booking-pages/${orgSlug}/${eventSlug}`, options);
  }

  getAvailability(
    meetingTypeId: string,
    params: { from: string; to: string; timeZone: string },
    options?: RequestOptions,
  ): Promise<AvailableSlot[]> {
    return this.http.get(`/public/meeting-types/${meetingTypeId}/availability`, {
      ...options,
      query: params,
    });
  }

  createBooking(input: CreateBookingInput, options?: RequestOptions): Promise<Booking> {
    return this.http.post('/public/bookings', input, options);
  }

  getBooking(reference: string, options?: RequestOptions): Promise<BookingDetail> {
    return this.http.get(`/public/bookings/${reference}`, options);
  }

  cancelBooking(
    reference: string,
    input: CancelBookingInput,
    options?: RequestOptions,
  ): Promise<Booking> {
    return this.http.post(`/public/bookings/${reference}/cancel`, input, options);
  }

  rescheduleBooking(
    reference: string,
    input: { startTime: string; reason?: string },
    options?: RequestOptions,
  ): Promise<Booking> {
    return this.http.post(`/public/bookings/${reference}/reschedule`, input, options);
  }
}
