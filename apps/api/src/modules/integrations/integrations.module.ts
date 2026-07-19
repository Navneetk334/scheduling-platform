import { createDefaultRegistry } from '@invincible/integrations';
import { Module } from '@nestjs/common';

import { OrganizationsModule } from '../organizations/organizations.module';

import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { CredentialsService } from './credentials.service';
import { HealthMonitorService } from './health-monitor.service';
import { InboundWebhooksService } from './inbound-webhooks.service';
import { IntegrationEventsService } from './integration-events.service';
import { IntegrationLogsService } from './integration-logs.service';
import { IntegrationOrchestrator } from './integration-orchestrator.service';
import { PROVIDER_REGISTRY } from './integrations.constants';
import { OAuthClientFactory } from './oauth-client.factory';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { OutboundWebhooksService } from './outbound-webhooks.service';
import { ProviderContextService } from './provider-context.service';
import { SyncService } from './sync.service';
import { WebhookDispatcherService } from './webhook-dispatcher.service';
import { WebhookEndpointsController } from './webhooks.controller';
import { InboundWebhookController } from './webhooks.controller';

/**
 * The integration system: a code-driven provider catalog wired to persistence,
 * OAuth + API-key connection flows, inbound/outbound webhooks, an append-only
 * audit log, health monitoring and background sync.
 *
 * Everything is modular and extensible — adding a provider only requires
 * registering it in `@invincible/integrations`; no changes here are needed.
 */
@Module({
  imports: [OrganizationsModule],
  controllers: [
    ConnectionsController,
    OAuthController,
    WebhookEndpointsController,
    InboundWebhookController,
  ],
  providers: [
    { provide: PROVIDER_REGISTRY, useFactory: () => createDefaultRegistry() },
    CredentialsService,
    IntegrationLogsService,
    OAuthClientFactory,
    ProviderContextService,
    IntegrationOrchestrator,
    ConnectionsService,
    OAuthService,
    OutboundWebhooksService,
    InboundWebhooksService,
    IntegrationEventsService,
    WebhookDispatcherService,
    HealthMonitorService,
    SyncService,
  ],
  exports: [
    IntegrationOrchestrator,
    IntegrationEventsService,
    ConnectionsService,
    OutboundWebhooksService,
  ],
})
export class IntegrationsModule {}
