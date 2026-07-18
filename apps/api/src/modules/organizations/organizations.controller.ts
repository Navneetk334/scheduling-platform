import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  createOrganizationSchema,
  inviteMemberSchema,
  type CreateOrganizationInput,
  type InviteMemberInput,
} from '@invincible/utils';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { SessionContext } from '../../auth/auth.service';

import { OrganizationsService } from './organizations.service';

@Controller({ path: 'organizations', version: '1' })
@UseGuards(SessionAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get()
  list(@CurrentUser() user: SessionContext['user']) {
    return this.organizations.listForUser(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: SessionContext['user'],
    @Body(new ZodValidationPipe(createOrganizationSchema)) body: CreateOrganizationInput,
  ) {
    return this.organizations.create(user.id, body);
  }

  @Post('invitations')
  @UseGuards(OrgMembershipGuard)
  invite(
    @CurrentUser() user: SessionContext['user'],
    @ActiveOrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(inviteMemberSchema)) body: InviteMemberInput,
  ) {
    return this.organizations.inviteMember(organizationId, user.id, body);
  }
}
