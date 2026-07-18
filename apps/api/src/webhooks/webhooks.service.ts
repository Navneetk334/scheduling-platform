import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { AppError } from '@invincible/utils';
import { Queue } from 'bullmq';

import { PrismaService } from '../prisma/prisma.service';
import { WEBHOOKS_QUEUE } from '../queue/queue.module';

import { type WebhookJobData } from './webhook-events';

/** HMAC-SHA256 signature over the exact JSON body. */
export function signPayload(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(WEBHOOKS_QUEUE) private readonly queue: Queue<WebhookJobData>,
  ) {}

  create(organizationId: string, createdById: string, input: { url: string; events: string[] }) {
    return this.prisma.webhook.create({
      data: {
        organizationId,
        createdById,
        url: input.url,
        events: input.events,
        secret: `whsec_${randomBytes(24).toString('base64url')}`,
      },
      select: { id: true, url: true, events: true, status: true, secret: true, createdAt: true },
    });
  }

  list(organizationId: string) {
    return this.prisma.webhook.findMany({
      where: { organizationId },
      select: { id: true, url: true, events: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  listDeliveries(organizationId: string, webhookId: string) {
    return this.prisma.webhookDelivery.findMany({
      where: { webhookId, webhook: { organizationId } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, organizationId } });
    if (!webhook) throw AppError.notFound('Webhook', id);
    await this.prisma.webhook.delete({ where: { id } });
  }

  /** Constant-time signature verification for inbound verification/testing. */
  static verifySignature(body: string, signature: string, secret: string): boolean {
    const expected = signPayload(body, secret);
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  /**
   * Fan out an event to every active endpoint subscribed to it: records a
   * PENDING delivery and enqueues a job (retried with exponential backoff).
   */
  async dispatch(organizationId: string, event: string, payload: unknown): Promise<void> {
    const webhooks = await this.prisma.webhook.findMany({
      where: { organizationId, status: 'ACTIVE', events: { has: event } },
    });
    if (webhooks.length === 0) return;

    await Promise.all(
      webhooks.map(async (webhook) => {
        const delivery = await this.prisma.webhookDelivery.create({
          data: { webhookId: webhook.id, eventType: event, payload: payload as object, status: 'PENDING' },
        });
        await this.queue.add(
          'deliver',
          {
            deliveryId: delivery.id,
            webhookId: webhook.id,
            url: webhook.url,
            secret: webhook.secret,
            event,
            payload,
          },
          { attempts: 5, backoff: { type: 'exponential', delay: 2000 } },
        );
      }),
    ).catch((error: unknown) => this.logger.error('Failed to enqueue webhook delivery', error as Error));
  }
}
