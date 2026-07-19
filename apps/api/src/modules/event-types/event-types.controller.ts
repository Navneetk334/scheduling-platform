import {
  createEventTypeSchema,
  updateEventTypeSchema,
  type CreateEventTypeInput,
  type UpdateEventTypeInput,
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
  UseGuards,
} from '@nestjs/common';

import type { SessionContext } from '../../auth/auth.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { EventTypesService } from './event-types.service';

@Controller({ path: 'event-types', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class EventTypesController {
  constructor(private readonly eventTypes: EventTypesService) {}

  @Get()
  list(@ActiveOrganizationId() organizationId: string) {
    return this.eventTypes.list(organizationId);
  }

  @Get(':id')
  get(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.eventTypes.get(organizationId, id);
  }

  @Post()
  create(
    @ActiveOrganizationId() organizationId: string,
    @CurrentUser() user: SessionContext['user'],
    @Body(new ZodValidationPipe(createEventTypeSchema)) body: CreateEventTypeInput,
  ) {
    return this.eventTypes.create(organizationId, user.id, body);
  }

  @Patch(':id')
  update(
    @ActiveOrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEventTypeSchema)) body: UpdateEventTypeInput,
  ) {
    return this.eventTypes.update(organizationId, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.eventTypes.remove(organizationId, id);
  }
}
