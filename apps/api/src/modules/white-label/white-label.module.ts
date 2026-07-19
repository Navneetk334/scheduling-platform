import { Module } from '@nestjs/common';

import { OrganizationsModule } from '../organizations/organizations.module';

import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { DnsService } from './dns.service';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';
import { LegalController } from './legal.controller';
import { LegalService } from './legal.service';
import { SslService } from './ssl.service';
import { TemplateRenderer } from './template-renderer';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

/**
 * White Label module — multi-tenant brand management, custom domains with DNS
 * verification + automated TLS, branded email/SMS templates, custom legal
 * documents, and a brand asset library. All endpoints are organization-scoped.
 */
@Module({
  imports: [OrganizationsModule],
  controllers: [
    BrandsController,
    DomainsController,
    TemplatesController,
    LegalController,
    AssetsController,
  ],
  providers: [
    BrandsService,
    DomainsService,
    TemplatesService,
    LegalService,
    AssetsService,
    DnsService,
    SslService,
    TemplateRenderer,
  ],
  exports: [BrandsService, DomainsService, TemplatesService, TemplateRenderer],
})
export class WhiteLabelModule {}
