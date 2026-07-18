import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { AppError, slugify } from '@invincible/utils';
import type { CreateOrganizationInput, InviteMemberInput } from '@invincible/utils';
import type { Membership, Organization } from '@invincible/database';

import { PrismaService } from '../../prisma/prisma.service';

/** Default system roles provisioned for every new organization. */
const SYSTEM_ROLES = [
  { key: 'owner', name: 'Owner' },
  { key: 'admin', name: 'Admin' },
  { key: 'member', name: 'Member' },
] as const;

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Organizations the user belongs to, with their role key. */
  async listForUser(userId: string): Promise<Array<Organization & { role: string }>> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { organization: true, role: true },
      orderBy: { createdAt: 'asc' },
    });
    return memberships
      .filter((m) => m.organization.deletedAt === null)
      .map((m) => ({ ...m.organization, role: m.role.key }));
  }

  /**
   * Create an organization, provision its system roles, make the creator OWNER,
   * and add a default Mon–Fri 09:00–17:00 availability — all atomically.
   */
  async create(userId: string, input: CreateOrganizationInput): Promise<Organization> {
    const slug = await this.ensureUniqueSlug(input.slug ?? slugify(input.name));

    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: input.name, slug, timeZone: input.timeZone },
      });

      const roleIdByKey = new Map<string, string>();
      for (const role of SYSTEM_ROLES) {
        const created = await tx.role.create({
          data: {
            organizationId: organization.id,
            key: role.key,
            name: role.name,
            isSystem: true,
          },
        });
        roleIdByKey.set(role.key, created.id);
      }

      await tx.membership.create({
        data: {
          organizationId: organization.id,
          userId,
          roleId: roleIdByKey.get('owner')!,
          status: 'ACTIVE',
        },
      });

      await tx.availability.create({
        data: {
          organizationId: organization.id,
          ownerId: userId,
          name: 'Working Hours',
          timeZone: input.timeZone,
          isDefault: true,
          workingHours: {
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

  /** Resolve an active membership or throw. Used by the tenancy guard. */
  async requireMembership(organizationId: string, userId: string): Promise<Membership> {
    const membership = await this.prisma.membership.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    if (!membership || membership.status !== 'ACTIVE') {
      throw new AppError('FORBIDDEN', 'You are not a member of this organization.');
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

    // Map the requested role key (ADMIN/MEMBER) to the org's role row.
    const role = await this.prisma.role.findUnique({
      where: { organizationId_key: { organizationId, key: input.role.toLowerCase() } },
    });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await this.prisma.invitation.upsert({
      where: { organizationId_email: { organizationId, email: input.email } },
      update: { roleId: role?.id ?? null, token, expiresAt, status: 'PENDING', invitedById: inviterId },
      create: {
        organizationId,
        email: input.email,
        roleId: role?.id ?? null,
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
    while (attempt < 25) {
      const exists = await this.prisma.organization.findUnique({ where: { slug: candidate } });
      if (!exists) return candidate;
      attempt += 1;
      candidate = `${normalized}-${attempt + 1}`;
    }
    throw AppError.conflict('Could not generate a unique organization slug.');
  }
}
