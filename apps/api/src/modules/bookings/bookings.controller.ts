import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';

import { BookingsService } from './bookings.service';

@Controller({ path: 'bookings', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  list(
    @ActiveOrganizationId() organizationId: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.bookings.listForOrganization(organizationId, {
      upcoming: upcoming === 'true',
    });
  }
}
