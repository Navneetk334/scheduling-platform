import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../decorators/current-user.decorator';
import { SessionAuthGuard } from '../guards/session-auth.guard';
import type { SessionContext } from '../auth.service';

import { ApiKeysService } from './api-keys.service';

const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
  scopes: z.array(z.string().min(1)).min(1).default(['read']),
});

@Controller({ path: 'api-keys', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class ApiKeysController {
  constructor(private readonly apiKeys: ApiKeysService) {}

  @Get()
  list(@ActiveOrganizationId() organizationId: string) {
    return this.apiKeys.list(organizationId);
  }

  @Post()
  create(
    @ActiveOrganizationId() organizationId: string,
    @CurrentUser() user: SessionContext['user'],
    @Body(new ZodValidationPipe(createApiKeySchema)) body: { name: string; scopes: string[] },
  ) {
    return this.apiKeys.create(organizationId, user.id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  revoke(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.apiKeys.revoke(organizationId, id);
  }
}
