import { Injectable } from '@nestjs/common';
import { AppError } from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

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
        owner: { select: { name: true, image: true, timeZone: true } },
      },
    });
    if (!meetingType) throw AppError.notFound('Meeting type', eventSlug);

    return {
      organization: {
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.branding?.logoUrl ?? null,
        timeZone: organization.timeZone,
      },
      eventType: {
        id: meetingType.id,
        title: meetingType.title,
        slug: meetingType.slug,
        description: meetingType.description,
        durationMinutes: meetingType.durationMinutes,
        kind: meetingType.kind,
        color: meetingType.color,
        locations: meetingType.locationLinks.map((link) => ({
          type: link.location.kind,
          value: link.location.value,
        })),
        host: meetingType.owner,
      },
    };
  }
}
