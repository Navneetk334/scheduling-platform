import type { WebhookDelivery, WebhookEndpoint } from '@invincible/database';
import { HttpClient, computeBackoffMs, signPayload } from '@invincible/integrations';
import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import { AppConfigService } from '../../config/app-config.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

import { CredentialsService } from './credentials.service';

const BATCH_SIZE = 25;
const DISPATCH_LOCK = 'integrations:webhook:dispatch';

/**
 * Background worker that delivers pending/retrying outbound webhooks. Failed
 * deliveries are retried with exponential backoff up to `maxAttempts`, then
 * parked as DEAD. A Redis lock ensures a single worker processes the queue even
 * when multiple API instances run.
 */
@Injectable()
export class WebhookDispatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WebhookDispatcherService.name);
  private readonly http = new HttpClient({ provider: 'webhook', defaultTimeoutMs: 10_000 });
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
    private readonly credentials: CredentialsService,
  ) {}

  onModuleInit(): void {
    if (!this.config.get('INTEGRATIONS_BACKGROUND_JOBS')) return;
    const interval = this.config.get('INTEGRATIONS_WEBHOOK_INTERVAL_MS');
    this.timer = setInterval(() => {
      void this.tick();
    }, interval);
    this.timer.unref?.();
    this.logger.log(`Webhook dispatcher started (every ${interval}ms).`);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /** Process one batch of due deliveries. Safe to call manually (tests/ops). */
  async tick(): Promise<number> {
    const release = await this.redis.acquireLock(DISPATCH_LOCK, 30_000);
    if (!release) return 0;
    try {
      const due = await this.prisma.webhookDelivery.findMany({
        where: {
          status: { in: ['PENDING', 'RETRYING'] },
          nextAttemptAt: { lte: new Date() },
        },
        orderBy: { nextAttemptAt: 'asc' },
        take: BATCH_SIZE,
        include: { endpoint: true },
      });

      let delivered = 0;
      for (const delivery of due) {
        const ok = await this.deliver(delivery, delivery.endpoint);
        if (ok) delivered += 1;
      }
      return delivered;
    } finally {
      await release();
    }
  }

  private async deliver(
    delivery: WebhookDelivery,
    endpoint: WebhookEndpoint,
  ): Promise<boolean> {
    const attempt = delivery.attempt + 1;
    const body = JSON.stringify(delivery.payload);
    const secret = this.credentials.decryptValue(endpoint.encryptedSecret);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = signPayload(`${timestamp}.${body}`, secret);
    const extraHeaders = (endpoint.headers as Record<string, string> | null) ?? {};

    try {
      const { status } = await this.http.post(endpoint.url, {
        body,
        headers: {
          'Content-Type': 'application/json',
          'X-Invincible-Event': delivery.eventType,
          'X-Invincible-Delivery': delivery.id,
          'X-Invincible-Timestamp': timestamp,
          'X-Invincible-Signature': `t=${timestamp},v1=${signature}`,
          ...extraHeaders,
        },
        parse: 'none',
        retry: false, // this worker IS the retry mechanism
      });
      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'DELIVERED',
          attempt,
          responseStatus: status,
          deliveredAt: new Date(),
          nextAttemptAt: null,
          error: null,
        },
      });
      return true;
    } catch (error) {
      const exhausted = attempt >= delivery.maxAttempts;
      const backoff = computeBackoffMs(attempt, 2_000, 3_600_000);
      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: exhausted ? 'DEAD' : 'RETRYING',
          attempt,
          error: (error as Error).message.slice(0, 500),
          nextAttemptAt: exhausted ? null : new Date(Date.now() + backoff),
        },
      });
      if (exhausted) {
        this.logger.warn(`Webhook delivery ${delivery.id} is DEAD after ${attempt} attempts.`);
      }
      return false;
    }
  }
}
