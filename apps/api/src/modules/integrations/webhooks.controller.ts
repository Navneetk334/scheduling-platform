import {
  createWebhookEndpointSchema,
  updateWebhookEndpointSchema,
  type CreateWebhookEndpointInput,
  type UpdateWebhookEndpointInput,
} from '@invincible/utils';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import type { SessionContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { InboundWebhooksService } from './inbound-webhooks.service';
import { OutboundWebhooksService } from './outbound-webhooks.service';

/** Express request augmented with the captured raw body (see main.ts). */
interface RawBodyRequest extends Request {
  rawBody?: string;
}

/** Outbound webhook subscription management (authenticated, org-scoped). */
@Controller({ path: 'integrations', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class WebhookEndpointsController {
  constructor(private readonly webhooks: OutboundWebhooksService) {}

  @Get('webhook-endpoints')
  list(@ActiveOrganizationId() organizationId: string) {
    return this.webhooks.listEndpoints(organizationId);
  }

  @Post('webhook-endpoints')
  create(
    @ActiveOrganizationId() organizationId: string,
    @CurrentUser() user: SessionContext['user'],
    @Body(new ZodValidationPipe(createWebhookEndpointSchema)) body: CreateWebhookEndpointInput,
  ) {
    return this.webhooks.createEndpoint(organizationId, user.id, body);
  }

  @Patch('webhook-endpoints/:id')
  update(
    @ActiveOrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateWebhookEndpointSchema)) body: UpdateWebhookEndpointInput,
  ) {
    return this.webhooks.updateEndpoint(organizationId, id, body);
  }

  @Delete('webhook-endpoints/:id')
  @HttpCode(204)
  remove(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.webhooks.removeEndpoint(organizationId, id);
  }

  @Get('webhook-deliveries')
  deliveries(
    @ActiveOrganizationId() organizationId: string,
    @Query('endpointId') endpointId?: string,
  ) {
    return this.webhooks.listDeliveries(organizationId, endpointId);
  }
}

/** Inbound provider webhook receiver. Public — verified per connection. */
@Controller({ path: 'integrations/webhooks', version: '1' })
export class InboundWebhookController {
  constructor(private readonly inbound: InboundWebhooksService) {}

  @Post('inbound/:connectionId')
  @HttpCode(200)
  receive(
    @Param('connectionId') connectionId: string,
    @Req() req: RawBodyRequest,
    @Headers() headers: Record<string, string>,
  ) {
    const rawBody = req.rawBody ?? JSON.stringify(req.body ?? {});
    return this.inbound.handle(connectionId, rawBody, headers);
  }
}
