import { AppError } from '@invincible/utils';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public, unauthenticated booking-page payload for an org + event slug. */
  async getBookingPage(orgSlug: string, eventSlug: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { slug: orgSlug, deletedAt: null },
    });
    if (!organization) throw AppError.notFound('Organization', orgSlug);

    const eventType = await this.prisma.eventType.findFirst({
      where: {
        organizationId: organization.id,
        slug: eventSlug,
        isActive: true,
        deletedAt: null,
      },
      include: {
        locations: true,
        owner: { select: { name: true, image: true, timeZone: true } },
      },
    });
    if (!eventType) throw AppError.notFound('Event type', eventSlug);

    return {
      organization: {
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
        timeZone: organization.timeZone,
      },
      eventType: {
        id: eventType.id,
        title: eventType.title,
        slug: eventType.slug,
        description: eventType.description,
        durationMinutes: eventType.durationMinutes,
        kind: eventType.kind,
        color: eventType.color,
        locations: eventType.locations.map((l) => ({ type: l.type, value: l.value })),
        host: eventType.owner,
      },
    };
  }
}
