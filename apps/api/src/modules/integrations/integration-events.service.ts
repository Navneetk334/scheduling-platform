import { Injectable, Logger } from '@nestjs/common';

import { ConnectionsService } from './connections.service';
import { IntegrationOrchestrator } from './integration-orchestrator.service';
import { OutboundWebhooksService } from './outbound-webhooks.service';

/**
 * The single entry point domain code uses to broadcast a platform event (e.g.
 * `booking.created`). It fans the event out to (1) all subscribed outbound
 * webhook endpoints and (2) every connected automation provider (Zapier / Make
 * / n8n). Delivery is resilient: one failing target never blocks the others.
 */
@Injectable()
export class IntegrationEventsService {
  private readonly logger = new Logger(IntegrationEventsService.name);

  constructor(
    private readonly outboundWebhooks: OutboundWebhooksService,
    private readonly connections: ConnectionsService,
    private readonly orchestrator: IntegrationOrchestrator,
  ) {}

  /** `event` is typically a {@link PlatformWebhookEvent} value (all strings). */
  async emit(
    organizationId: string,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await Promise.allSettled([
      this.outboundWebhooks.enqueue(organizationId, event, payload),
      this.notifyAutomationProviders(organizationId, event, payload),
    ]);
  }

  private async notifyAutomationProviders(
    organizationId: string,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const connections = await this.connections.activeByCategory(organizationId, 'AUTOMATION');
    await Promise.allSettled(
      connections.map((connection) =>
        this.orchestrator
          .runAutomation(connection, `emit:${event}`, (provider, ctx) =>
            provider.emit(ctx, { event, payload }),
          )
          .catch((error: unknown) => {
            this.logger.warn(
              `Automation dispatch to ${connection.provider} failed: ${(error as Error).message}`,
            );
          }),
      ),
    );
  }
}
