import { Injectable } from '@nestjs/common';
import { AppError } from '@invincible/utils';
import type { CreateBrandAssetInput } from '@invincible/utils';

import { PrismaService } from '../../prisma/prisma.service';

/** Brand asset library: reusable logos, favicons, fonts, and images per org. */
@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string, brandId?: string) {
    return this.prisma.brandAsset.findMany({
      where: { organizationId, ...(brandId ? { brandId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(organizationId: string, input: CreateBrandAssetInput) {
    if (input.brandId) await this.ensureBrand(organizationId, input.brandId);
    return this.prisma.brandAsset.create({
      data: {
        organizationId,
        brandId: input.brandId ?? null,
        type: input.type,
        name: input.name,
        url: input.url,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        width: input.width,
        height: input.height,
      },
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const asset = await this.prisma.brandAsset.findFirst({ where: { id, organizationId } });
    if (!asset) throw AppError.notFound('Brand asset', id);
    await this.prisma.brandAsset.delete({ where: { id } });
  }

  private async ensureBrand(organizationId: string, brandId: string): Promise<void> {
    const brand = await this.prisma.brand.findFirst({
      where: { id: brandId, organizationId, deletedAt: null },
      select: { id: true },
    });
    if (!brand) throw AppError.notFound('Brand', brandId);
  }
}
