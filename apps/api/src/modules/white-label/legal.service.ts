import { Injectable } from '@nestjs/common';
import { AppError } from '@invincible/utils';
import type { UpsertLegalDocumentInput } from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

/**
 * Custom legal documents (privacy policy, terms, cookie policy) that override
 * platform defaults, optionally scoped per brand. Editing content bumps the
 * version; publishing stamps `publishedAt`.
 */
@Injectable()
export class LegalService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string, brandId?: string | null) {
    return this.prisma.legalDocument.findMany({
      where: { organizationId, ...(brandId !== undefined ? { brandId } : {}) },
      orderBy: [{ brandId: 'asc' }, { type: 'asc' }],
    });
  }

  async get(organizationId: string, id: string) {
    const doc = await this.prisma.legalDocument.findFirst({ where: { id, organizationId } });
    if (!doc) throw AppError.notFound('Legal document', id);
    return doc;
  }

  /** Create or replace the document for (org, brand, type). */
  async upsert(organizationId: string, input: UpsertLegalDocumentInput) {
    const brandId = input.brandId ?? null;
    if (brandId) await this.ensureBrand(organizationId, brandId);

    const existing = await this.prisma.legalDocument.findFirst({
      where: { organizationId, brandId, type: input.type },
    });

    const publishedAt = input.publish ? new Date() : undefined;

    if (existing) {
      const contentChanged = existing.content !== input.content;
      return this.prisma.legalDocument.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          content: input.content,
          version: contentChanged ? existing.version + 1 : existing.version,
          ...(publishedAt ? { publishedAt } : {}),
        },
      });
    }

    return this.prisma.legalDocument.create({
      data: {
        organizationId,
        brandId,
        type: input.type,
        title: input.title,
        content: input.content,
        version: 1,
        publishedAt: publishedAt ?? null,
      },
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.get(organizationId, id);
    await this.prisma.legalDocument.delete({ where: { id } });
  }

  private async ensureBrand(organizationId: string, brandId: string): Promise<void> {
    const brand = await this.prisma.brand.findFirst({
      where: { id: brandId, organizationId, deletedAt: null },
      select: { id: true },
    });
    if (!brand) throw AppError.notFound('Brand', brandId);
  }
}
