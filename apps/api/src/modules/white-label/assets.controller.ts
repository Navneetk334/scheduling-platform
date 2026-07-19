import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { createBrandAssetSchema, type CreateBrandAssetInput } from '@invincible/utils';

import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { AssetsService } from './assets.service';

@Controller({ path: 'white-label/assets', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Get()
  list(@ActiveOrganizationId() organizationId: string, @Query('brandId') brandId?: string) {
    return this.assets.list(organizationId, brandId);
  }

  @Post()
  create(
    @ActiveOrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(createBrandAssetSchema)) body: CreateBrandAssetInput,
  ) {
    return this.assets.create(organizationId, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.assets.remove(organizationId, id);
  }
}
