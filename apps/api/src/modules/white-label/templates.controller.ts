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
import {
  createMessageTemplateSchema,
  renderTemplateSchema,
  updateMessageTemplateSchema,
  type CreateMessageTemplateInput,
  type RenderTemplateInput,
  type UpdateMessageTemplateInput,
} from '@invincible/utils';
import type { NotificationChannel } from '@invincible/database';

import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { TemplatesService } from './templates.service';

@Controller({ path: 'white-label/templates', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @Get()
  list(
    @ActiveOrganizationId() organizationId: string,
    @Query('channel') channel?: NotificationChannel,
    @Query('brandId') brandId?: string,
  ) {
    return this.templates.list(organizationId, { channel, brandId });
  }

  @Get(':id')
  get(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.templates.get(organizationId, id);
  }

  @Post()
  create(
    @ActiveOrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(createMessageTemplateSchema)) body: CreateMessageTemplateInput,
  ) {
    return this.templates.create(organizationId, body);
  }

  @Patch(':id')
  update(
    @ActiveOrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMessageTemplateSchema)) body: UpdateMessageTemplateInput,
  ) {
    return this.templates.update(organizationId, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.templates.remove(organizationId, id);
  }

  @Post(':id/render')
  render(
    @ActiveOrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(renderTemplateSchema)) body: RenderTemplateInput,
  ) {
    return this.templates.render(organizationId, id, body.variables);
  }
}
