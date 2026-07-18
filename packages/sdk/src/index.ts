/**
 * @invincible/sdk — a typed client for the INVINCIBLE PROS API. Works in the
 * browser (cookie-based Better Auth sessions) and during SSR (inject forwarded
 * headers via `getDefaultHeaders`).
 */

import { HttpClient, type HttpClientConfig } from './http-client';
import {
  BookingsResource,
  MeetingTypesResource,
  OrganizationsResource,
  PublicResource,
  SchedulesResource,
} from './resources';

export * from './errors';
export type { HttpClientConfig, RequestOptions } from './http-client';
export type { BookingPage } from './resources';

export interface ApiClient {
  readonly http: HttpClient;
  readonly organizations: OrganizationsResource;
  readonly schedules: SchedulesResource;
  readonly meetingTypes: MeetingTypesResource;
  readonly bookings: BookingsResource;
  readonly public: PublicResource;
}

/** Create a fully-typed API client instance. */
export function createApiClient(config: HttpClientConfig): ApiClient {
  const http = new HttpClient(config);
  return {
    http,
    organizations: new OrganizationsResource(http),
    schedules: new SchedulesResource(http),
    meetingTypes: new MeetingTypesResource(http),
    bookings: new BookingsResource(http),
    public: new PublicResource(http),
  };
}
