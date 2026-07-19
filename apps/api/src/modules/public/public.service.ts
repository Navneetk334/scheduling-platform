import { Injectable } from '@nestjs/common';
import { AppError } from '@invincible/utils';
import type { Brand, BrandTheme, Prisma } from '@invincible/database';

import { PrismaService } from '../../prisma/prisma.service';

type BrandWithThemes = Brand & { themes: BrandTheme[] };

const defaultBrandInclude = {
  where: { isDefault: true, isActive: true, deletedAt: null },
  include: { themes: { orderBy: { mode: 'asc' as const } } },
  take: 1,
} satisfies Prisma.Organization$brandsArgs;

/** Shape the public, unauthenticated branding payload from a brand row. */
function toPublicBranding(brand: BrandWithThemes | undefined) {
  if (!brand) return null;
  return {
    brandName: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    logoDarkUrl: brand.logoDarkUrl,
    faviconUrl: brand.faviconUrl,
    primaryColor: brand.primaryColor,
    accentColor: brand.accentColor,
    backgroundColor: brand.backgroundColor,
    foregroundColor: brand.foregroundColor,
    headingFont: brand.headingFont,
    bodyFont: brand.bodyFont,
    customFontUrl: brand.customFontUrl,
    defaultThemeMode: brand.defaultThemeMode,
    customCss: brand.customCss,
    footerHtml: brand.footerHtml,
    removeBranding: brand.removeBranding,
    loginHeadline: brand.loginHeadline,
    loginSubheadline: brand.loginSubheadline,
    loginImageUrl: brand.loginImageUrl,
    themes: brand.themes.map((t) => ({ mode: t.mode, tokens: t.tokens })),
  };
}

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public org profile + the services (meeting types) available to book. */
  async getOrganization(orgSlug: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { slug: orgSlug, deletedAt: null },
      include: { brands: defaultBrandInclude },
    });
    if (!organization) throw AppError.notFound('Organization', orgSlug);

    const branding = toPublicBranding(organization.brands[0]);

    const services = await this.prisma.meetingType.findMany({
      where: { organizationId: organization.id, isActive: true, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { hosts: true } } },
    });

    return {
      organization: {
        name: organization.name,
        slug: organization.slug,
        logoUrl: branding?.logoUrl ?? null,
        timeZone: organization.timeZone,
      },
      branding,
      services: services.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        description: s.description,
        durationMinutes: s.durationMinutes,
        kind: s.kind,
        color: s.color,
        staffCount: s._count.hosts,
        price: s.priceAmount != null ? { amount: s.priceAmount, currency: s.priceCurrency ?? 'usd' } : null,
      })),
    };
  }

  /** Public, unauthenticated booking-page payload for an org + event slug. */
  async getBookingPage(orgSlug: string, eventSlug: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { slug: orgSlug, deletedAt: null },
      include: { brands: defaultBrandInclude },
    });
    if (!organization) throw AppError.notFound('Organization', orgSlug);

    const branding = toPublicBranding(organization.brands[0]);

    const meetingType = await this.prisma.meetingType.findFirst({
      where: {
        organizationId: organization.id,
        slug: eventSlug,
        isActive: true,
        deletedAt: null,
      },
      include: {
        locationLinks: { include: { location: true }, orderBy: { position: 'asc' } },
        owner: { select: { id: true, name: true, image: true, timeZone: true } },
        hosts: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { priority: 'asc' },
        },
      },
    });
    if (!meetingType) throw AppError.notFound('Meeting type', eventSlug);

    // Staff pool: explicit hosts, falling back to the owner.
    const staff =
      meetingType.hosts.length > 0
        ? meetingType.hosts.map((h) => ({ id: h.user.id, name: h.user.name, image: h.user.image }))
        : [{ id: meetingType.owner.id, name: meetingType.owner.name, image: meetingType.owner.image }];

    return {
      organization: {
        name: organization.name,
        slug: organization.slug,
        logoUrl: branding?.logoUrl ?? null,
        timeZone: organization.timeZone,
      },
      branding,
      meetingType: {
        id: meetingType.id,
        title: meetingType.title,
        slug: meetingType.slug,
        description: meetingType.description,
        durationMinutes: meetingType.durationMinutes,
        kind: meetingType.kind,
        color: meetingType.color,
        price:
          meetingType.priceAmount != null
            ? { amount: meetingType.priceAmount, currency: meetingType.priceCurrency ?? 'usd' }
            : null,
        locations: meetingType.locationLinks.map((link) => ({
          type: link.location.kind,
          value: link.location.value,
        })),
        host: {
          name: meetingType.owner.name,
          image: meetingType.owner.image,
          timeZone: meetingType.owner.timeZone,
        },
        staff,
      },
    };
  }

  /** Resolve the branding for an organization slug (for theming booking/login pages). */
  async getBranding(orgSlug: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { slug: orgSlug, deletedAt: null },
      include: { brands: defaultBrandInclude },
    });
    if (!organization) throw AppError.notFound('Organization', orgSlug);
    return {
      organization: { name: organization.name, slug: organization.slug },
      branding: toPublicBranding(organization.brands[0]),
    };
  }

  /**
   * Resolve branding by an active custom domain/subdomain. Uses the domain's
   * linked brand when set, otherwise the organization's default brand. Powers
   * white-label booking pages served on customer domains.
   */
  async getBrandingByDomain(hostname: string) {
    const domain = await this.prisma.domain.findFirst({
      where: { hostname: hostname.toLowerCase(), status: 'ACTIVE' },
      include: {
        organization: { select: { name: true, slug: true } },
        brand: { include: { themes: { orderBy: { mode: 'asc' } } } },
      },
    });
    if (!domain) throw AppError.notFound('Domain', hostname);

    let brand = domain.brand as BrandWithThemes | null;
    if (!brand) {
      brand =
        (await this.prisma.brand.findFirst({
          where: { organizationId: domain.organizationId, isDefault: true, deletedAt: null },
          include: { themes: { orderBy: { mode: 'asc' } } },
        })) ?? null;
    }

    return {
      organization: domain.organization,
      hostname: domain.hostname,
      branding: toPublicBranding(brand ?? undefined),
    };
  }
}
