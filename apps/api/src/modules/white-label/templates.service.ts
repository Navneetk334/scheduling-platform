import { Injectable } from '@nestjs/common';
import { AppError } from '@invincible/utils';
import type {
  CreateMessageTemplateInput,
  UpdateMessageTemplateInput,
} from '@invincible/utils';
import type { NotificationChannel, Prisma } from '@invincible/database';

import { PrismaService } from '../../prisma/prisma.service';

import { TemplateRenderer } from './template-renderer';

/**
 * Branded transactional message templates for email and SMS. Each (brand,
 * channel, type) combination has at most one template; a null brand is the
 * organization-wide default.
 */
@Injectable()
export class TemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly renderer: TemplateRenderer,
  ) {}

  list(
    organizationId: string,
    filters?: { channel?: NotificationChannel; brandId?: string | null },
  ) {
    const where: Prisma.MessageTemplateWhereInput = { organizationId };
    if (filters?.channel) where.channel = filters.channel;
    if (filters?.brandId !== undefined) where.brandId = filters.brandId;
    return this.prisma.messageTemplate.findMany({
      where,
      orderBy: [{ channel: 'asc' }, { type: 'asc' }],
    });
  }

  async get(organizationId: string, id: string) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { id, organizationId },
    });
    if (!template) throw AppError.notFound('Message template', id);
    return template;
  }

  async create(organizationId: string, input: CreateMessageTemplateInput) {
    const brandId = input.brandId ?? null;
    if (brandId) await this.ensureBrand(organizationId, brandId);

    const duplicate = await this.prisma.messageTemplate.findFirst({
      where: { organizationId, brandId, channel: input.channel, type: input.type },
      select: { id: true },
    });
    if (duplicate) {
      throw AppError.conflict(
        `A ${input.channel} template for ${input.type} already exists for this scope.`,
      );
    }

    return this.prisma.messageTemplate.create({
      data: {
        organizationId,
        brandId,
        channel: input.channel,
        type: input.type,
        name: input.name,
        subject: input.channel === 'EMAIL' ? input.subject ?? null : null,
        bodyHtml: input.bodyHtml ?? null,
        bodyText: input.bodyText,
        variables: input.variables ?? undefined,
        isActive: input.isActive ?? true,
      },
    });
  }

  async update(organizationId: string, id: string, input: UpdateMessageTemplateInput) {
    const template = await this.get(organizationId, id);
    return this.prisma.messageTemplate.update({
      where: { id },
      data: {
        name: input.name,
        // Subject only meaningful for email templates.
        subject: template.channel === 'EMAIL' ? input.subject : template.subject,
        bodyHtml: input.bodyHtml,
        bodyText: input.bodyText,
        variables: input.variables ?? undefined,
        isActive: input.isActive,
      },
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.get(organizationId, id);
    await this.prisma.messageTemplate.delete({ where: { id } });
  }

  /** Render a template with sample variables for preview. */
  async render(organizationId: string, id: string, variables: Record<string, string>) {
    const template = await this.get(organizationId, id);
    const rendered = this.renderer.render(
      { subject: template.subject, bodyHtml: template.bodyHtml, bodyText: template.bodyText },
      variables,
    );
    return {
      channel: template.channel,
      type: template.type,
      declaredVariables: this.renderer.extractVariables({
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        bodyText: template.bodyText,
      }),
      ...rendered,
    };
  }

  private async ensureBrand(organizationId: string, brandId: string): Promise<void> {
    const brand = await this.prisma.brand.findFirst({
      where: { id: brandId, organizationId, deletedAt: null },
      select: { id: true },
    });
    if (!brand) throw AppError.notFound('Brand', brandId);
  }
}
