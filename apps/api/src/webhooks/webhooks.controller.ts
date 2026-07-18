import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { SessionContext } from '../auth/auth.service';

import { WebhooksService } from './webhooks.service';

const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string().min(1)).min(1),
});

@Controller({ path: 'webhooks', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Get()
  list(@ActiveOrganizationId() organizationId: string) {
    return this.webhooks.list(organizationId);
  }

  @Post()
  create(
    @ActiveOrganizationId() organizationId: string,
    @CurrentUser() user: SessionContext['user'],
    @Body(new ZodValidationPipe(createWebhookSchema)) body: { url: string; events: string[] },
  ) {
    return this.webhooks.create(organizationId, user.id, body);
  }

  @Get(':id/deliveries')
  deliveries(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.webhooks.listDeliveries(organizationId, id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.webhooks.remove(organizationId, id);
  }
}
