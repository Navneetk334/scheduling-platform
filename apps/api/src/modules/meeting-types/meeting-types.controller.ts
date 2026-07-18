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
  createMeetingTypeSchema,
  updateMeetingTypeSchema,
  type CreateMeetingTypeInput,
  type UpdateMeetingTypeInput,
} from '@invincible/utils';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { SessionContext } from '../../auth/auth.service';

import { MeetingTypesService } from './meeting-types.service';

@Controller({ path: 'meeting-types', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class MeetingTypesController {
  constructor(private readonly meetingTypes: MeetingTypesService) {}

  @Get()
  list(@ActiveOrganizationId() organizationId: string) {
    return this.meetingTypes.list(organizationId);
  }

  @Get(':id')
  get(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.meetingTypes.get(organizationId, id);
  }

  @Post()
  create(
    @ActiveOrganizationId() organizationId: string,
    @CurrentUser() user: SessionContext['user'],
    @Body(new ZodValidationPipe(createMeetingTypeSchema)) body: CreateMeetingTypeInput,
  ) {
    return this.meetingTypes.create(organizationId, user.id, body);
  }

  @Patch(':id')
  update(
    @ActiveOrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMeetingTypeSchema)) body: UpdateMeetingTypeInput,
  ) {
    return this.meetingTypes.update(organizationId, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.meetingTypes.remove(organizationId, id);
  }
}
