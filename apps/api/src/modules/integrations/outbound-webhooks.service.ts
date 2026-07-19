import type { Prisma } from '@invincible/database';
import type { WebhookDelivery, WebhookEndpoint } from '@invincible/database';
import { generateToken } from '@invincible/integrations';
import type {
  WebhookDelivery as WebhookDeliveryDto,
  WebhookEndpoint as WebhookEndpointDto,
} from '@invincible/types';
import { AppError } from '@invincible/utils';
import type {
  CreateWebhookEndpointInput,
  UpdateWebhookEndpointInput,
} from '@invincible/utils';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CredentialsService } from './credentials.service';

/**
 * Manages outbound webhook subscriptions and enqueues signed deliveries when
 * platform events fire. Actual delivery + retry is performed asynchronously by
 * the {@link WebhookDispatcherService}.
 */
@Injectable()
export class OutboundWebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly credentials: CredentialsService,
  ) {}

  /** Create an endpoint. Returns the endpoint plus the signing secret ONCE. */
  async createEndpoint(
    organizationId: string,
    userId: string,
    input: CreateWebhookEndpointInput,
  ): Promise<WebhookEndpointDto & { secret: string }> {
    const secret = `whsec_${generateToken(24)}`;
    const endpoint = await this.prisma.webhookEndpoint.create({
      data: {
        organizationId,
        url: input.url,
        description: input.description ?? null,
        events: input.events,
        encryptedSecret: this.credentials.encryptValue(secret),
        headers: input.headers ?? undefined,
        createdById: userId,
      },
    });
    return { ...this.serializeEndpoint(endpoint), secret };
  }

  async listEndpoints(organizationId: string): Promise<WebhookEndpointDto[]> {
    const rows = await this.prisma.webhookEndpoint.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.serializeEndpoint(row));
  }

  async updateEndpoint(
    organizationId: string,
    id: string,
    input: UpdateWebhookEndpointInput,
  ): Promise<WebhookEndpointDto> {
    await this.requireEndpoint(organizationId, id);
    const updated = await this.prisma.webhookEndpoint.update({
      where: { id },
      data: {
        ...(input.url !== undefined ? { url: input.url } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.events !== undefined ? { events: input.events } : {}),
        ...(input.headers !== undefined ? { headers: input.headers ?? undefined } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
    return this.serializeEndpoint(updated);
  }

  async removeEndpoint(organizationId: string, id: string): Promise<void> {
    await this.requireEndpoint(organizationId, id);
    await this.prisma.webhookEndpoint.delete({ where: { id } });
  }

  async listDeliveries(
    organizationId: string,
    endpointId?: string,
  ): Promise<WebhookDeliveryDto[]> {
    const rows = await this.prisma.webhookDelivery.findMany({
      where: { organizationId, ...(endpointId ? { endpointId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((row) => this.serializeDelivery(row));
  }

  /**
   * Fan out an event to every active endpoint subscribed to it (or to '*').
   * Creates PENDING deliveries due immediately; the dispatcher takes over.
   */
  async enqueue(
    organizationId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<number> {
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: { organizationId, isActive: true },
    });
    const matching = endpoints.filter(
      (e) => e.events.includes(eventType) || e.events.includes('*'),
    );
    if (matching.length === 0) return 0;

    await this.prisma.webhookDelivery.createMany({
      data: matching.map((endpoint) => ({
        endpointId: endpoint.id,
        organizationId,
        eventType,
        payload: {
          event: eventType,
          data: payload,
          createdAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
        status: 'PENDING' as const,
        nextAttemptAt: new Date(),
      })),
    });
    return matching.length;
  }

  private async requireEndpoint(organizationId: string, id: string): Promise<WebhookEndpoint> {
    const endpoint = await this.prisma.webhookEndpoint.findFirst({
      where: { id, organizationId },
    });
    if (!endpoint) throw AppError.notFound('Webhook endpoint', id);
    return endpoint;
  }

  serializeEndpoint(row: WebhookEndpoint): WebhookEndpointDto {
    return {
      id: row.id,
      organizationId: row.organizationId as WebhookEndpointDto['organizationId'],
      url: row.url,
      description: row.description,
      events: row.events,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  serializeDelivery(row: WebhookDelivery): WebhookDeliveryDto {
    return {
      id: row.id,
      endpointId: row.endpointId,
      eventType: row.eventType,
      status: row.status,
      attempt: row.attempt,
      maxAttempts: row.maxAttempts,
      responseStatus: row.responseStatus,
      error: row.error,
      nextAttemptAt: row.nextAttemptAt ? row.nextAttemptAt.toISOString() : null,
      deliveredAt: row.deliveredAt ? row.deliveredAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
