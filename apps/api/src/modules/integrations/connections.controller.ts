import {
  createConnectionSchema,
  listLogsQuerySchema,
  updateConnectionSchema,
  type CreateConnectionInput,
  type UpdateConnectionInput,
} from '@invincible/utils';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import type { SessionContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { ConnectionsService } from './connections.service';
import { IntegrationLogsService } from './integration-logs.service';

@Controller({ path: 'integrations', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class ConnectionsController {
  constructor(
    private readonly connections: ConnectionsService,
    private readonly logs: IntegrationLogsService,
  ) {}

  /** The full provider catalog (available integrations). */
  @Get('catalog')
  catalog() {
    return this.connections.catalog();
  }

  @Get('connections')
  list(@ActiveOrganizationId() organizationId: string) {
    return this.connections.list(organizationId);
  }

  @Get('connections/:id')
  get(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.connections.get(organizationId, id);
  }

  @Post('connections')
  create(
    @ActiveOrganizationId() organizationId: string,
    @CurrentUser() user: SessionContext['user'],
    @Body(new ZodValidationPipe(createConnectionSchema)) body: CreateConnectionInput,
  ) {
    return this.connections.createWithCredentials(organizationId, user.id, body);
  }

  @Patch('connections/:id')
  update(
    @ActiveOrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateConnectionSchema)) body: UpdateConnectionInput,
  ) {
    return this.connections.update(organizationId, id, body);
  }

  @Delete('connections/:id')
  @HttpCode(204)
  remove(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.connections.remove(organizationId, id);
  }

  /** Trigger an on-demand health probe for a connection. */
  @Post('connections/:id/verify')
  verify(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.connections.verify(organizationId, id);
  }

  /** Integration audit log (Integration Logs view). */
  @Get('logs')
  listLogs(
    @ActiveOrganizationId() organizationId: string,
    @Query() query: Record<string, string>,
  ) {
    const parsed = listLogsQuerySchema.parse(query);
    return this.logs.list(organizationId, parsed);
  }
}
