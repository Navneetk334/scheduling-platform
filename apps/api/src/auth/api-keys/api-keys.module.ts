import { Module } from '@nestjs/common';

import { OrganizationsModule } from '../../modules/organizations/organizations.module';

import { ApiKeysController } from './api-keys.controller';

/**
 * Hosts the organization-scoped API-key management endpoints. `ApiKeysService`
 * and `ApiKeyGuard` are provided globally by the (global) AuthModule; this
 * module imports OrganizationsModule so `OrgMembershipGuard` can resolve.
 */
@Module({
  imports: [OrganizationsModule],
  controllers: [ApiKeysController],
})
export class ApiKeysModule {}
