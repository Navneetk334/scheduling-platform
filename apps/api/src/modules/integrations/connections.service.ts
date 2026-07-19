import type {
  IntegrationCategory,
  IntegrationConnection as PrismaConnection,
  Prisma,
} from '@invincible/database';
import type { ProviderRegistry } from '@invincible/integrations';
import type { IntegrationConnection as ConnectionDto } from '@invincible/types';
import { AppError, ErrorCode } from '@invincible/utils';
import type { CreateConnectionInput, UpdateConnectionInput } from '@invincible/utils';
import { Inject, Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CredentialsService } from './credentials.service';
import { IntegrationOrchestrator } from './integration-orchestrator.service';
import { PROVIDER_REGISTRY } from './integrations.constants';

/**
 * CRUD + lifecycle for per-organization provider connections. Owns the mapping
 * between the persisted (secret-bearing) row and the client-facing, secret-free
 * DTO. OAuth connections are created by the OAuth flow; this service handles
 * API-key / Basic / SMTP / Webhook connections created with direct credentials.
 */
@Injectable()
export class ConnectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly credentials: CredentialsService,
    private readonly orchestrator: IntegrationOrchestrator,
    @Inject(PROVIDER_REGISTRY) private readonly registry: ProviderRegistry,
  ) {}

  /** Code-driven catalog of all available providers (secret-free). */
  catalog() {
    return this.registry.descriptors();
  }

  async list(organizationId: string): Promise<ConnectionDto[]> {
    const rows = await this.prisma.integrationConnection.findMany({
      where: { organizationId },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((row) => this.serialize(row));
  }

  async getRaw(organizationId: string, id: string) {
    const connection = await this.prisma.integrationConnection.findFirst({
      where: { id, organizationId },
    });
    if (!connection) throw AppError.notFound('Integration connection', id);
    return connection;
  }

  async get(organizationId: string, id: string): Promise<ConnectionDto> {
    return this.serialize(await this.getRaw(organizationId, id));
  }

  /** Create a connection from directly-supplied credentials (non-OAuth). */
  async createWithCredentials(
    organizationId: string,
    userId: string,
    input: CreateConnectionInput,
  ): Promise<ConnectionDto> {
    const provider = this.registry.find(input.provider);
    if (!provider) throw AppError.notFound('Provider', input.provider);
    if (provider.descriptor.authType === 'OAUTH2') {
      throw new AppError(
        ErrorCode.Validation,
        `"${provider.descriptor.name}" connects via OAuth. Use the authorize flow instead.`,
      );
    }

    const created = await this.prisma.integrationConnection.create({
      data: {
        organizationId,
        provider: provider.descriptor.id,
        category: provider.descriptor.category,
        authType: provider.descriptor.authType,
        displayName: input.displayName ?? provider.descriptor.name,
        status: 'PENDING',
        encryptedCredentials: this.credentials.encrypt(input.credentials),
        config: input.config,
        createdById: userId,
      },
    });

    // Verify immediately so the user gets instant feedback + health status.
    await this.orchestrator.checkHealth(created);
    return this.get(organizationId, created.id);
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateConnectionInput,
  ): Promise<ConnectionDto> {
    const existing = await this.getRaw(organizationId, id);

    const mergedConfig =
      input.config !== undefined
        ? { ...((existing.config as Record<string, unknown> | null) ?? {}), ...input.config }
        : undefined;

    const updated = await this.prisma.integrationConnection.update({
      where: { id: existing.id },
      data: {
        ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
        ...(input.credentials !== undefined
          ? { encryptedCredentials: this.credentials.encrypt(input.credentials) }
          : {}),
        ...(mergedConfig !== undefined ? { config: mergedConfig as Prisma.InputJsonValue } : {}),
        ...(input.enabled !== undefined
          ? { status: input.enabled ? 'ACTIVE' : 'DISABLED' }
          : {}),
      },
    });
    return this.serialize(updated);
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.getRaw(organizationId, id);
    await this.prisma.integrationConnection.delete({ where: { id } });
  }

  /** Re-run a provider health probe on demand. */
  async verify(organizationId: string, id: string) {
    const connection = await this.getRaw(organizationId, id);
    const report = await this.orchestrator.checkHealth(connection);
    return { connectionId: id, provider: connection.provider, ...report };
  }

  /** All ACTIVE connections in a category (used by sync + event dispatch). */
  activeByCategory(organizationId: string, category: IntegrationCategory) {
    return this.prisma.integrationConnection.findMany({
      where: { organizationId, category, status: 'ACTIVE' },
    });
  }

  /** Map a persisted row to the secret-free DTO returned to clients. */
  serialize(row: PrismaConnection): ConnectionDto {
    return {
      id: row.id,
      organizationId: row.organizationId as ConnectionDto['organizationId'],
      provider: row.provider,
      category: row.category,
      authType: row.authType,
      displayName: row.displayName,
      status: row.status,
      healthStatus: row.healthStatus,
      scopes: row.scopes,
      externalAccountId: row.externalAccountId,
      externalAccountEmail: row.externalAccountEmail,
      config: (row.config as Record<string, unknown> | null) ?? null,
      tokenExpiresAt: row.tokenExpiresAt ? row.tokenExpiresAt.toISOString() : null,
      lastError: row.lastError,
      lastHealthCheckAt: row.lastHealthCheckAt ? row.lastHealthCheckAt.toISOString() : null,
      lastSyncedAt: row.lastSyncedAt ? row.lastSyncedAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
