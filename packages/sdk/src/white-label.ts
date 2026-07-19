import type {
  Brand,
  BrandAsset,
  BrandTheme,
  Domain,
  LegalDocument,
  MessageTemplate,
  PublicBranding,
} from '@invincible/types';
import type {
  CreateBrandAssetInput,
  CreateBrandInput,
  CreateDomainInput,
  CreateMessageTemplateInput,
  UpdateBrandInput,
  UpdateDomainInput,
  UpdateMessageTemplateInput,
  UpsertBrandThemeInput,
  UpsertLegalDocumentInput,
} from '@invincible/utils';

import type { HttpClient, RequestOptions } from './http-client';

/** Options for organization-scoped calls. */
type OrgScoped = { organizationId: string } & Pick<RequestOptions, 'headers' | 'signal'>;

/** Result of a preview render of a message template. */
export interface RenderedTemplate {
  channel: string;
  type: string;
  declaredVariables: string[];
  subject: string | null;
  html: string | null;
  text: string;
  missingVariables: string[];
}

/** Multi-brand management + per-mode design-token themes. */
export class BrandsResource {
  constructor(private readonly http: HttpClient) {}

  list(options: OrgScoped): Promise<Brand[]> {
    return this.http.get('/white-label/brands', options);
  }

  get(id: string, options: OrgScoped): Promise<Brand> {
    return this.http.get(`/white-label/brands/${id}`, options);
  }

  create(input: CreateBrandInput, options: OrgScoped): Promise<Brand> {
    return this.http.post('/white-label/brands', input, options);
  }

  update(id: string, input: UpdateBrandInput, options: OrgScoped): Promise<Brand> {
    return this.http.patch(`/white-label/brands/${id}`, input, options);
  }

  remove(id: string, options: OrgScoped): Promise<void> {
    return this.http.delete(`/white-label/brands/${id}`, options);
  }

  setDefault(id: string, options: OrgScoped): Promise<Brand> {
    return this.http.post(`/white-label/brands/${id}/default`, undefined, options);
  }

  listThemes(id: string, options: OrgScoped): Promise<BrandTheme[]> {
    return this.http.get(`/white-label/brands/${id}/themes`, options);
  }

  upsertTheme(id: string, input: UpsertBrandThemeInput, options: OrgScoped): Promise<BrandTheme> {
    return this.http.put(`/white-label/brands/${id}/themes`, input, options);
  }
}

/** Custom domains + platform subdomains with DNS verification and TLS. */
export class DomainsResource {
  constructor(private readonly http: HttpClient) {}

  list(options: OrgScoped): Promise<Domain[]> {
    return this.http.get('/white-label/domains', options);
  }

  get(id: string, options: OrgScoped): Promise<Domain> {
    return this.http.get(`/white-label/domains/${id}`, options);
  }

  create(input: CreateDomainInput, options: OrgScoped): Promise<Domain> {
    return this.http.post('/white-label/domains', input, options);
  }

  update(id: string, input: UpdateDomainInput, options: OrgScoped): Promise<Domain> {
    return this.http.patch(`/white-label/domains/${id}`, input, options);
  }

  remove(id: string, options: OrgScoped): Promise<void> {
    return this.http.delete(`/white-label/domains/${id}`, options);
  }

  /** Run DNS verification (auto-provisions TLS on success). */
  verify(id: string, options: OrgScoped): Promise<Domain> {
    return this.http.post(`/white-label/domains/${id}/verify`, undefined, options);
  }

  /** (Re)provision or renew the TLS certificate. */
  provisionSsl(id: string, options: OrgScoped): Promise<Domain> {
    return this.http.post(`/white-label/domains/${id}/ssl`, undefined, options);
  }
}

/** Branded email / SMS transactional templates. */
export class TemplatesResource {
  constructor(private readonly http: HttpClient) {}

  list(
    options: OrgScoped & { channel?: 'EMAIL' | 'SMS'; brandId?: string },
  ): Promise<MessageTemplate[]> {
    const { channel, brandId, ...rest } = options;
    return this.http.get('/white-label/templates', {
      ...rest,
      query: { ...(channel ? { channel } : {}), ...(brandId ? { brandId } : {}) },
    });
  }

  get(id: string, options: OrgScoped): Promise<MessageTemplate> {
    return this.http.get(`/white-label/templates/${id}`, options);
  }

  create(input: CreateMessageTemplateInput, options: OrgScoped): Promise<MessageTemplate> {
    return this.http.post('/white-label/templates', input, options);
  }

  update(
    id: string,
    input: UpdateMessageTemplateInput,
    options: OrgScoped,
  ): Promise<MessageTemplate> {
    return this.http.patch(`/white-label/templates/${id}`, input, options);
  }

  remove(id: string, options: OrgScoped): Promise<void> {
    return this.http.delete(`/white-label/templates/${id}`, options);
  }

  render(
    id: string,
    variables: Record<string, string>,
    options: OrgScoped,
  ): Promise<RenderedTemplate> {
    return this.http.post(`/white-label/templates/${id}/render`, { variables }, options);
  }
}

/** Custom legal documents (privacy, terms, cookie policy). */
export class LegalResource {
  constructor(private readonly http: HttpClient) {}

  list(options: OrgScoped): Promise<LegalDocument[]> {
    return this.http.get('/white-label/legal', options);
  }

  get(id: string, options: OrgScoped): Promise<LegalDocument> {
    return this.http.get(`/white-label/legal/${id}`, options);
  }

  upsert(input: UpsertLegalDocumentInput, options: OrgScoped): Promise<LegalDocument> {
    return this.http.put(`/white-label/legal`, input, options);
  }

  remove(id: string, options: OrgScoped): Promise<void> {
    return this.http.delete(`/white-label/legal/${id}`, options);
  }
}

/** Brand asset library (logos, favicons, fonts, images). */
export class AssetsResource {
  constructor(private readonly http: HttpClient) {}

  list(options: OrgScoped & { brandId?: string }): Promise<BrandAsset[]> {
    const { brandId, ...rest } = options;
    return this.http.get('/white-label/assets', {
      ...rest,
      query: brandId ? { brandId } : {},
    });
  }

  create(input: CreateBrandAssetInput, options: OrgScoped): Promise<BrandAsset> {
    return this.http.post('/white-label/assets', input, options);
  }

  remove(id: string, options: OrgScoped): Promise<void> {
    return this.http.delete(`/white-label/assets/${id}`, options);
  }
}

/** Public, unauthenticated branding lookups (theme booking/login pages). */
export class BrandingResource {
  constructor(private readonly http: HttpClient) {}

  bySlug(
    orgSlug: string,
    options?: RequestOptions,
  ): Promise<{ organization: { name: string; slug: string }; branding: PublicBranding | null }> {
    return this.http.get(`/public/branding/${orgSlug}`, options);
  }

  byDomain(
    hostname: string,
    options?: RequestOptions,
  ): Promise<{
    organization: { name: string; slug: string };
    hostname: string;
    branding: PublicBranding | null;
  }> {
    return this.http.get(`/public/branding-by-domain/${encodeURIComponent(hostname)}`, options);
  }
}
