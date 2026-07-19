import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  createBrandSchema,
  updateBrandSchema,
  upsertBrandThemeSchema,
  type CreateBrandInput,
  type UpdateBrandInput,
  type UpsertBrandThemeInput,
} from '@invincible/utils';

import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { ActiveOrganizationId } from '../../common/decorators/active-organization.decorator';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { BrandsService } from './brands.service';

@Controller({ path: 'white-label/brands', version: '1' })
@UseGuards(SessionAuthGuard, OrgMembershipGuard)
export class BrandsController {
  constructor(private readonly brands: BrandsService) {}

  @Get()
  list(@ActiveOrganizationId() organizationId: string) {
    return this.brands.list(organizationId);
  }

  @Get(':id')
  get(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.brands.get(organizationId, id);
  }

  @Post()
  create(
    @ActiveOrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(createBrandSchema)) body: CreateBrandInput,
  ) {
    return this.brands.create(organizationId, body);
  }

  @Patch(':id')
  update(
    @ActiveOrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBrandSchema)) body: UpdateBrandInput,
  ) {
    return this.brands.update(organizationId, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.brands.remove(organizationId, id);
  }

  @Post(':id/default')
  setDefault(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.brands.setDefault(organizationId, id);
  }

  @Get(':id/themes')
  listThemes(@ActiveOrganizationId() organizationId: string, @Param('id') id: string) {
    return this.brands.listThemes(organizationId, id);
  }

  @Put(':id/themes')
  upsertTheme(
    @ActiveOrganizationId() organizationId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(upsertBrandThemeSchema)) body: UpsertBrandThemeInput,
  ) {
    return this.brands.upsertTheme(organizationId, id, body);
  }
}
