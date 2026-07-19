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
import {
  AssetsResource,
  BrandingResource,
  BrandsResource,
  DomainsResource,
  LegalResource,
  TemplatesResource,
} from './white-label';

export * from './errors';
export type { HttpClientConfig, RequestOptions } from './http-client';
export type {
  BookingDetail,
  BookingPage,
  Money,
  PublicOrganization,
  PublicOrganizationProfile,
  PublicService,
  StaffMember,
} from './resources';
export type { RenderedTemplate } from './white-label';
export {
  AssetsResource,
  BrandingResource,
  BrandsResource,
  DomainsResource,
  LegalResource,
  TemplatesResource,
} from './white-label';

export interface ApiClient {
  readonly http: HttpClient;
  readonly organizations: OrganizationsResource;
  readonly schedules: SchedulesResource;
  readonly meetingTypes: MeetingTypesResource;
  readonly bookings: BookingsResource;
  readonly public: PublicResource;
  // White label
  readonly brands: BrandsResource;
  readonly domains: DomainsResource;
  readonly templates: TemplatesResource;
  readonly legal: LegalResource;
  readonly assets: AssetsResource;
  readonly branding: BrandingResource;
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
    brands: new BrandsResource(http),
    domains: new DomainsResource(http),
    templates: new TemplatesResource(http),
    legal: new LegalResource(http),
    assets: new AssetsResource(http),
    branding: new BrandingResource(http),
  };
}
