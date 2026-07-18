import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { AppError } from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

export interface ApiKeyContext {
  id: string;
  organizationId: string;
  scopes: string[];
}

function hashKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/**
 * Machine-to-machine API keys. The raw key is shown once at creation; only a
 * SHA-256 hash is persisted. Keys are organization-scoped with granular scopes.
 */
@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organizationId: string,
    createdById: string,
    input: { name: string; scopes: string[]; expiresAt?: Date },
  ): Promise<{ id: string; key: string; prefix: string }> {
    const raw = `inv_live_${randomBytes(24).toString('base64url')}`;
    const prefix = raw.slice(0, 16);

    const record = await this.prisma.apiKey.create({
      data: {
        organizationId,
        createdById,
        name: input.name,
        prefix,
        hashedKey: hashKey(raw),
        scopes: input.scopes,
        expiresAt: input.expiresAt ?? null,
      },
    });

    // The raw key is returned exactly once and never stored.
    return { id: record.id, key: raw, prefix };
  }

  list(organizationId: string) {
    return this.prisma.apiKey.findMany({
      where: { organizationId, revokedAt: null },
      select: { id: true, name: true, prefix: true, scopes: true, lastUsedAt: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(organizationId: string, id: string): Promise<void> {
    const key = await this.prisma.apiKey.findFirst({ where: { id, organizationId } });
    if (!key) throw AppError.notFound('API key', id);
    await this.prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  /** Verify a raw key; returns its context or null. Updates last-used stamp. */
  async verify(raw: string): Promise<ApiKeyContext | null> {
    const key = await this.prisma.apiKey.findUnique({ where: { hashedKey: hashKey(raw) } });
    if (!key || key.revokedAt) return null;
    if (key.expiresAt && key.expiresAt.getTime() < Date.now()) return null;

    await this.prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
    return { id: key.id, organizationId: key.organizationId, scopes: key.scopes };
  }
}
