/**
 * White-label transport shapes. Multi-tenant: every entity carries an
 * `organizationId`. These mirror the API responses, decoupled from Prisma.
 */

import type {
  AuditFields,
  BrandAssetId,
  BrandId,
  DomainId,
  ISODateString,
  LegalDocumentId,
  MessageTemplateId,
  OrganizationId,
  SoftDeletable,
} from './common';
import type {
  BrandAssetType,
  DomainKind,
  DomainStatus,
  LegalDocumentType,
  NotificationChannel,
  SslStatus,
  TemplateType,
  ThemeMode,
} from './enums';

/** A per-mode design-token set (light/dark). Tokens are open-ended CSS vars. */
export interface BrandTheme {
  readonly id: string;
  readonly mode: ThemeMode;
  readonly tokens: ThemeTokens;
}

/** Canonical design tokens; extra keys are allowed for forward-compat. */
export interface ThemeTokens {
  readonly background: string;
  readonly foreground: string;
  readonly primary: string;
  readonly primaryForeground: string;
  readonly accent: string;
  readonly muted: string;
  readonly border: string;
  readonly radius: string;
  readonly [key: string]: string;
}

export interface Brand extends AuditFields, SoftDeletable {
  readonly id: BrandId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly slug: string;
  readonly isDefault: boolean;
  readonly isActive: boolean;

  readonly logoUrl: string | null;
  readonly logoDarkUrl: string | null;
  readonly faviconUrl: string | null;
  readonly ogImageUrl: string | null;

  readonly primaryColor: string;
  readonly accentColor: string;
  readonly backgroundColor: string;
  readonly foregroundColor: string;

  readonly headingFont: string;
  readonly bodyFont: string;
  readonly customFontUrl: string | null;

  readonly defaultThemeMode: ThemeMode;
  readonly customCss: string | null;
  readonly footerHtml: string | null;
  readonly removeBranding: boolean;

  readonly loginHeadline: string | null;
  readonly loginSubheadline: string | null;
  readonly loginImageUrl: string | null;

  readonly emailFromName: string | null;
  readonly emailFromAddress: string | null;
  readonly emailReplyTo: string | null;
  readonly supportEmail: string | null;
  readonly smsSenderId: string | null;

  readonly themes?: readonly BrandTheme[];
}

export interface BrandAsset extends AuditFields {
  readonly id: BrandAssetId;
  readonly organizationId: OrganizationId;
  readonly brandId: BrandId | null;
  readonly type: BrandAssetType;
  readonly name: string;
  readonly url: string;
  readonly mimeType: string | null;
  readonly sizeBytes: number | null;
  readonly width: number | null;
  readonly height: number | null;
}

export interface MessageTemplate extends AuditFields {
  readonly id: MessageTemplateId;
  readonly organizationId: OrganizationId;
  readonly brandId: BrandId | null;
  readonly channel: NotificationChannel;
  readonly type: TemplateType;
  readonly name: string;
  readonly subject: string | null;
  readonly bodyHtml: string | null;
  readonly bodyText: string;
  readonly variables: Readonly<Record<string, string>> | null;
  readonly isActive: boolean;
}

export interface LegalDocument extends AuditFields {
  readonly id: LegalDocumentId;
  readonly organizationId: OrganizationId;
  readonly brandId: BrandId | null;
  readonly type: LegalDocumentType;
  readonly title: string;
  readonly content: string;
  readonly version: number;
  readonly publishedAt: ISODateString | null;
}

/** A single DNS record the customer must publish to verify/route a domain. */
export interface DnsRecord {
  readonly type: 'TXT' | 'CNAME' | 'A';
  readonly name: string;
  readonly value: string;
  readonly ttl?: number;
}

export interface Domain extends AuditFields {
  readonly id: DomainId;
  readonly organizationId: OrganizationId;
  readonly brandId: BrandId | null;
  readonly kind: DomainKind;
  readonly hostname: string;
  readonly subdomain: string | null;
  readonly isPrimary: boolean;
  readonly status: DomainStatus;
  readonly verificationToken: string | null;
  readonly dnsRecords: readonly DnsRecord[] | null;
  readonly verifiedAt: ISODateString | null;
  readonly dnsVerifiedAt: ISODateString | null;
  readonly lastCheckedAt: ISODateString | null;
  readonly failureReason: string | null;
  readonly sslStatus: SslStatus;
  readonly sslIssuedAt: ISODateString | null;
  readonly sslExpiresAt: ISODateString | null;
}

/** Public, unauthenticated branding payload used to theme booking/login pages. */
export interface PublicBranding {
  readonly brandName: string;
  readonly slug: string;
  readonly logoUrl: string | null;
  readonly logoDarkUrl: string | null;
  readonly faviconUrl: string | null;
  readonly primaryColor: string;
  readonly accentColor: string;
  readonly backgroundColor: string;
  readonly foregroundColor: string;
  readonly headingFont: string;
  readonly bodyFont: string;
  readonly customFontUrl: string | null;
  readonly defaultThemeMode: ThemeMode;
  readonly customCss: string | null;
  readonly footerHtml: string | null;
  readonly removeBranding: boolean;
  readonly loginHeadline: string | null;
  readonly loginSubheadline: string | null;
  readonly loginImageUrl: string | null;
  readonly themes: readonly BrandTheme[];
}
