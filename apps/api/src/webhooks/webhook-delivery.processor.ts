import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { PrismaService } from '../prisma/prisma.service';
import { WEBHOOKS_QUEUE } from '../queue/queue.module';

import type { WebhookJobData } from './webhook-events';
import { signPayload } from './webhooks.service';

const DELIVERY_TIMEOUT_MS = 10_000;

/**
 * Delivers webhook jobs: signs the body, POSTs it, and records the outcome.
 * Throwing re-queues the job with BullMQ's exponential backoff (retries).
 */
@Processor(WEBHOOKS_QUEUE)
export class WebhookDeliveryProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookDeliveryProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<WebhookJobData>): Promise<void> {
    const { deliveryId, url, secret, event, payload } = job.data;
    const body = JSON.stringify(payload);
    const signature = signPayload(body, secret);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Invincible-Event': event,
          'X-Invincible-Signature': `sha256=${signature}`,
          'X-Invincible-Delivery': deliveryId,
        },
        body,
        signal: controller.signal,
      });

      await this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: response.ok ? 'SUCCESS' : 'FAILED',
          responseStatus: response.status,
          attempts: job.attemptsMade + 1,
          lastAttemptAt: new Date(),
        },
      });

      if (!response.ok) {
        throw new Error(`Webhook endpoint responded ${response.status}`);
      }
      this.logger.debug(`Delivered ${event} → ${url} (${response.status})`);
    } catch (error) {
      await this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'FAILED',
          attempts: job.attemptsMade + 1,
          lastAttemptAt: new Date(),
          error: (error as Error).message,
        },
      });
      throw error; // triggers retry with backoff
    } finally {
      clearTimeout(timeout);
    }
  }
}
