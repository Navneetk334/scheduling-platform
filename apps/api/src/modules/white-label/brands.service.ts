import { Injectable } from '@nestjs/common';
import { AppError, buildThemeTokens, slugify } from '@invincible/utils';
import type {
  CreateBrandInput,
  UpdateBrandInput,
  UpsertBrandThemeInput,
} from '@invincible/utils';
import type { Prisma } from '@invincible/database';

import { PrismaService } from '../../prisma/prisma.service';

const brandInclude = {
  themes: { orderBy: { mode: 'asc' as const } },
} satisfies Prisma.BrandInclude;

/**
 * Manages an organization's brands (multi-brand white label) and their
 * per-mode design-token themes. Every operation is tenant-scoped by
 * `organizationId`; exactly one active brand is flagged `isDefault`.
 */
@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string) {
    return this.prisma.brand.findMany({
      where: { organizationId, deletedAt: null },
      include: brandInclude,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async get(organizationId: string, id: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: brandInclude,
    });
    if (!brand) throw AppError.notFound('Brand', id);
    return brand;
  }

  async create(organizationId: string, input: CreateBrandInput) {
    const slug = await this.ensureUniqueSlug(organizationId, input.slug ?? slugify(input.name));
    const existingCount = await this.prisma.brand.count({
      where: { organizationId, deletedAt: null },
    });
    // The first brand is always the default; otherwise honor the request.
    const makeDefault = existingCount === 0 ? true : Boolean(input.isDefault);

    const { slug: _slug, isDefault: _isDefault, ...rest } = input;

    return this.prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.brand.updateMany({
          where: { organizationId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const brand = await tx.brand.create({
        data: {
          ...rest,
          organizationId,
          slug,
          isDefault: makeDefault,
        },
      });

      await this.seedDefaultThemes(tx, brand.id, {
        primaryColor: brand.primaryColor,
        accentColor: brand.accentColor,
        backgroundColor: brand.backgroundColor,
        foregroundColor: brand.foregroundColor,
      });

      return tx.brand.findUniqueOrThrow({ where: { id: brand.id }, include: brandInclude });
    });
  }

  async update(organizationId: string, id: string, input: UpdateBrandInput) {
    await this.get(organizationId, id);
    const { slug, isDefault, ...rest } = input;

    const data: Prisma.BrandUpdateInput = { ...rest };
    if (slug !== undefined) {
      data.slug = await this.ensureUniqueSlug(organizationId, slugify(slug), id);
    }

    return this.prisma.$transaction(async (tx) => {
      if (isDefault === true) {
        await tx.brand.updateMany({
          where: { organizationId, isDefault: true, NOT: { id } },
          data: { isDefault: false },
        });
        data.isDefault = true;
      }
      return tx.brand.update({ where: { id }, data, include: brandInclude });
    });
  }

  /** Soft delete a brand, promoting another to default if needed. */
  async remove(organizationId: string, id: string): Promise<void> {
    const brand = await this.get(organizationId, id);

    await this.prisma.$transaction(async (tx) => {
      await tx.brand.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false, isDefault: false },
      });

      if (brand.isDefault) {
        const next = await tx.brand.findFirst({
          where: { organizationId, deletedAt: null, NOT: { id } },
          orderBy: { createdAt: 'asc' },
        });
        if (next) {
          await tx.brand.update({ where: { id: next.id }, data: { isDefault: true } });
        }
      }
    });
  }

  async setDefault(organizationId: string, id: string) {
    await this.get(organizationId, id);
    return this.prisma.$transaction(async (tx) => {
      await tx.brand.updateMany({
        where: { organizationId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
      return tx.brand.update({ where: { id }, data: { isDefault: true }, include: brandInclude });
    });
  }

  // --- Themes ---------------------------------------------------------------

  async listThemes(organizationId: string, brandId: string) {
    await this.get(organizationId, brandId);
    return this.prisma.brandTheme.findMany({
      where: { brandId },
      orderBy: { mode: 'asc' },
    });
  }

  /**
   * Upsert a brand's light/dark theme. When explicit `tokens` are omitted, a
   * complete, accessible token set is derived from the brand's core colors.
   */
  async upsertTheme(organizationId: string, brandId: string, input: UpsertBrandThemeInput) {
    const brand = await this.get(organizationId, brandId);
    const tokens =
      input.tokens ??
      buildThemeTokens(input.mode, {
        primaryColor: brand.primaryColor,
        accentColor: brand.accentColor,
        backgroundColor: brand.backgroundColor,
        foregroundColor: brand.foregroundColor,
      });

    return this.prisma.brandTheme.upsert({
      where: { brandId_mode: { brandId, mode: input.mode } },
      create: { brandId, mode: input.mode, tokens },
      update: { tokens },
    });
  }

  private async seedDefaultThemes(
    tx: Prisma.TransactionClient,
    brandId: string,
    colors: {
      primaryColor: string;
      accentColor: string;
      backgroundColor: string;
      foregroundColor: string;
    },
  ): Promise<void> {
    for (const mode of ['LIGHT', 'DARK'] as const) {
      await tx.brandTheme.create({
        data: { brandId, mode, tokens: buildThemeTokens(mode, colors) },
      });
    }
  }

  private async ensureUniqueSlug(
    organizationId: string,
    base: string,
    excludeId?: string,
  ): Promise<string> {
    const normalized = slugify(base) || 'brand';
    let candidate = normalized;
    let attempt = 0;
    while (attempt < 25) {
      const existing = await this.prisma.brand.findUnique({
        where: { organizationId_slug: { organizationId, slug: candidate } },
      });
      if (!existing || existing.id === excludeId) return candidate;
      attempt += 1;
      candidate = `${normalized}-${attempt + 1}`;
    }
    throw AppError.conflict('Could not generate a unique brand slug.');
  }
}
