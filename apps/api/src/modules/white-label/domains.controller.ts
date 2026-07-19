import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  createDomainSchema,
  updateDomainSchema,
  type CreateDomainInput,
  type UpdateDomainInput,
} from '@invincible/utils';

import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { DomainsService } from './domains.service';

@Controller({ path: 'white-label/domains', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class DomainsController {
  constructor(private readonly domains: DomainsService) {}

  @Get()
  list(@ActiveOrganizationId() organizationId: string) {
    return this.domains.list(organizationId);
  }

  @Get(':id')
  get(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.domains.get(organizationId, id);
  }

  @Post()
  create(
    @ActiveOrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(createDomainSchema)) body: CreateDomainInput,
  ) {
    return this.domains.create(organizationId, body);
  }

  @Patch(':id')
  update(
    @ActiveOrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDomainSchema)) body: UpdateDomainInput,
  ) {
    return this.domains.update(organizationId, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.domains.remove(organizationId, id);
  }

  /** Run DNS verification; auto-provisions TLS on success. */
  @Post(':id/verify')
  verify(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.domains.verify(organizationId, id);
  }

  /** (Re)provision or renew the TLS certificate for a verified domain. */
  @Post(':id/ssl')
  provisionSsl(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.domains.provisionSsl(organizationId, id);
  }
}
