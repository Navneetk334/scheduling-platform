import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { AppError, ErrorCode, slugify } from '@invincible/utils';
import type {
  CreateOrganizationInput,
  InviteMemberInput,
} from '@invincible/utils';
import type { Membership, Organization } from '@invincible/database';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Organizations the user belongs to, with their role. */
  async listForUser(userId: string): Promise<Array<Organization & { role: string }>> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { organization: true },
      orderBy: { createdAt: 'asc' },
    });
    return memberships
      .filter((m) => m.organization.deletedAt === null)
      .map((m) => ({ ...m.organization, role: m.role }));
  }

  /**
   * Create an organization, make the creator its OWNER, and provision a
   * sensible default Mon–Fri 09:00–17:00 schedule — all atomically.
   */
  async create(userId: string, input: CreateOrganizationInput): Promise<Organization> {
    const slug = await this.ensureUniqueSlug(input.slug ?? slugify(input.name));

    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: input.name, slug, timeZone: input.timeZone },
      });

      await tx.membership.create({
        data: {
          organizationId: organization.id,
          userId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });

      await tx.schedule.create({
        data: {
          organizationId: organization.id,
          ownerId: userId,
          name: 'Working Hours',
          timeZone: input.timeZone,
          isDefault: true,
          rules: {
            create: [1, 2, 3, 4, 5].map((weekday) => ({
              weekday,
              startMinute: 9 * 60,
              endMinute: 17 * 60,
            })),
          },
        },
      });

      return organization;
    });
  }

  /** Resolve a membership or throw. Used by the tenancy guard. */
  async requireMembership(organizationId: string, userId: string): Promise<Membership> {
    const membership = await this.prisma.membership.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    if (!membership || membership.status !== 'ACTIVE') {
      throw new AppError(ErrorCode.Forbidden, 'You are not a member of this organization.');
    }
    return membership;
  }

  async inviteMember(
    organizationId: string,
    inviterId: string,
    input: InviteMemberInput,
  ): Promise<{ id: string; email: string; expiresAt: Date }> {
    const existing = await this.prisma.membership.findFirst({
      where: { organizationId, user: { email: input.email } },
    });
    if (existing) {
      throw AppError.conflict('That user is already a member of this organization.');
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await this.prisma.invitation.upsert({
      where: { organizationId_email: { organizationId, email: input.email } },
      update: { role: input.role, token, expiresAt, status: 'PENDING', invitedById: inviterId },
      create: {
        organizationId,
        email: input.email,
        role: input.role,
        token,
        expiresAt,
        invitedById: inviterId,
      },
    });

    // NOTE: email delivery (Resend) is wired in the notifications module.
    return { id: invitation.id, email: invitation.email, expiresAt: invitation.expiresAt };
  }

  private async ensureUniqueSlug(base: string): Promise<string> {
    const normalized = slugify(base) || 'org';
    let candidate = normalized;
    let attempt = 0;
    // Bounded retry to avoid unbounded loops under contention.
    while (attempt < 25) {
      const exists = await this.prisma.organization.findUnique({ where: { slug: candidate } });
      if (!exists) return candidate;
      attempt += 1;
      candidate = `${normalized}-${attempt + 1}`;
    }
    throw AppError.conflict('Could not generate a unique organization slug.');
  }
}
