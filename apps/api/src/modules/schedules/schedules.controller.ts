import {
  createScheduleSchema,
  updateScheduleSchema,
  type CreateScheduleInput,
  type UpdateScheduleInput,
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

import { SchedulesService } from './schedules.service';

@Controller({ path: 'schedules', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  @Get()
  list(@ActiveOrganizationId() organizationId: string) {
    return this.schedules.list(organizationId);
  }

  @Get(':id')
  get(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.schedules.get(organizationId, id);
  }

  @Post()
  create(
    @ActiveOrganizationId() organizationId: string,
    @CurrentUser() user: SessionContext['user'],
    @Body(new ZodValidationPipe(createScheduleSchema)) body: CreateScheduleInput,
  ) {
    return this.schedules.create(organizationId, user.id, body);
  }

  @Patch(':id')
  update(
    @ActiveOrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateScheduleSchema)) body: UpdateScheduleInput,
  ) {
    return this.schedules.update(organizationId, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.schedules.remove(organizationId, id);
  }
}
