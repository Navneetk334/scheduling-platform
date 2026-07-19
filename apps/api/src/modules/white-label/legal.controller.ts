import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { upsertLegalDocumentSchema, type UpsertLegalDocumentInput } from '@invincible/utils';

import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { LegalService } from './legal.service';

@Controller({ path: 'white-label/legal', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class LegalController {
  constructor(private readonly legal: LegalService) {}

  @Get()
  list(@ActiveOrganizationId() organizationId: string) {
    return this.legal.list(organizationId);
  }

  @Get(':id')
  get(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.legal.get(organizationId, id);
  }

  @Put()
  upsert(
    @ActiveOrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(upsertLegalDocumentSchema)) body: UpsertLegalDocumentInput,
  ) {
    return this.legal.upsert(organizationId, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.legal.remove(organizationId, id);
  }
}
