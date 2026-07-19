import { isPaymentProvider, type ProviderRegistry } from '@invincible/integrations';
import { PlatformWebhookEvent } from '@invincible/types';
import { AppError } from '@invincible/utils';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { IntegrationEventsService } from './integration-events.service';
import { IntegrationLogsService } from './integration-logs.service';
import { PROVIDER_REGISTRY } from './integrations.constants';
import { ProviderContextService } from './provider-context.service';

/** Map a provider-native payment event type to a platform event. */
function toPlatformPaymentEvent(eventType?: string): PlatformWebhookEvent | null {
  if (!eventType) return null;
  const normalized = eventType.toLowerCase();
  if (normalized.includes('refund')) return PlatformWebhookEvent.PaymentRefunded;
  if (/succeed|complete|capture|captured|paid/.test(normalized)) {
    return PlatformWebhookEvent.PaymentSucceeded;
  }
  return null;
}

/**
 * Receives inbound webhooks from third-party providers (e.g. Stripe payment
 * events). The delivery URL embeds the connection id; we verify the signature
 * using that connection's credentials, log it, and re-emit a normalized
 * platform event so the rest of the system can react.
 */
@Injectable()
export class InboundWebhooksService {
  private readonly logger = new Logger(InboundWebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ProviderContextService,
    private readonly logs: IntegrationLogsService,
    private readonly events: IntegrationEventsService,
    @Inject(PROVIDER_REGISTRY) private readonly registry: ProviderRegistry,
  ) {}

  async handle(
    connectionId: string,
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<{ received: boolean; verified: boolean }> {
    const connection = await this.prisma.integrationConnection.findUnique({
      where: { id: connectionId },
    });
    if (!connection) throw AppError.notFound('Integration connection', connectionId);

    const provider = this.registry.get(connection.provider);
    const ctx = await this.context.build(connection);

    let verified = false;
    let action = 'webhook.received';
    try {
      if (isPaymentProvider(provider)) {
        const result = await provider.verifyWebhook(ctx, rawBody, headers);
        verified = result.verified;
        action = `webhook.${result.eventType ?? 'unknown'}`;

        if (verified) {
          const platformEvent = toPlatformPaymentEvent(result.eventType);
          if (platformEvent) {
            await this.events.emit(connection.organizationId, platformEvent, {
              provider: connection.provider,
              paymentId: result.paymentId,
              reference: result.reference,
              rawEventType: result.eventType,
            });
          }
        }
      } else {
        // Generic acknowledgement for providers without payload verification.
        verified = true;
      }

      await this.logs.record({
        organizationId: connection.organizationId,
        connectionId: connection.id,
        provider: connection.provider,
        category: connection.category,
        direction: 'INBOUND',
        action,
        status: verified ? 'SUCCESS' : 'FAILURE',
        error: verified ? null : 'Signature verification failed.',
      });

      return { received: true, verified };
    } catch (error) {
      this.logger.warn(`Inbound webhook error for ${connectionId}: ${(error as Error).message}`);
      await this.logs.record({
        organizationId: connection.organizationId,
        connectionId: connection.id,
        provider: connection.provider,
        category: connection.category,
        direction: 'INBOUND',
        action,
        status: 'FAILURE',
        error: (error as Error).message.slice(0, 500),
      });
      return { received: true, verified: false };
    }
  }
}
