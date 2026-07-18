import { Injectable } from '@nestjs/common';
import { AppError } from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public org profile + the services (meeting types) available to book. */
  async getOrganization(orgSlug: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { slug: orgSlug, deletedAt: null },
      include: { branding: true },
    });
    if (!organization) throw AppError.notFound('Organization', orgSlug);

    const services = await this.prisma.meetingType.findMany({
      where: { organizationId: organization.id, isActive: true, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { hosts: true } } },
    });

    return {
      organization: {
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.branding?.logoUrl ?? null,
        timeZone: organization.timeZone,
      },
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
      include: { branding: true },
    });
    if (!organization) throw AppError.notFound('Organization', orgSlug);

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
        logoUrl: organization.branding?.logoUrl ?? null,
        timeZone: organization.timeZone,
      },
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
}
