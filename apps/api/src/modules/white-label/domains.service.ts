import { Injectable } from '@nestjs/common';
import { AppError } from '@invincible/utils';
import type { CreateDomainInput, UpdateDomainInput } from '@invincible/utils';
import type { Prisma } from '@invincible/database';

import { PrismaService } from '../../prisma/prisma.service';

import { DnsService, PLATFORM_APEX } from './dns.service';
import { SslService } from './ssl.service';

/**
 * Custom domains and platform subdomains with a full verification + TLS
 * lifecycle. Ownership is proven via a DNS TXT challenge (and a CNAME for
 * custom hostnames); once verified, a certificate is provisioned automatically.
 * All operations are tenant-scoped by `organizationId`.
 */
@Injectable()
export class DomainsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dns: DnsService,
    private readonly ssl: SslService,
  ) {}

  list(organizationId: string) {
    return this.prisma.domain.findMany({
      where: { organizationId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async get(organizationId: string, id: string) {
    const domain = await this.prisma.domain.findFirst({ where: { id, organizationId } });
    if (!domain) throw AppError.notFound('Domain', id);
    return domain;
  }

  async create(organizationId: string, input: CreateDomainInput) {
    const hostname =
      input.kind === 'SUBDOMAIN' ? `${input.subdomain}.${PLATFORM_APEX}` : input.hostname!;

    const taken = await this.prisma.domain.findUnique({ where: { hostname } });
    if (taken) throw AppError.conflict(`The domain ${hostname} is already registered.`);

    if (input.brandId) await this.ensureBrand(organizationId, input.brandId);

    const token = this.dns.generateToken();
    const records = this.dns.expectedRecords(hostname, token, input.kind);

    return this.prisma.$transaction(async (tx) => {
      if (input.isPrimary) {
        await tx.domain.updateMany({
          where: { organizationId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
      return tx.domain.create({
        data: {
          organizationId,
          brandId: input.brandId ?? null,
          kind: input.kind,
          hostname,
          subdomain: input.kind === 'SUBDOMAIN' ? input.subdomain : null,
          isPrimary: Boolean(input.isPrimary),
          status: 'PENDING',
          verificationToken: token,
          dnsRecords: records as unknown as Prisma.InputJsonValue,
          sslStatus: 'NONE',
        },
      });
    });
  }

  async update(organizationId: string, id: string, input: UpdateDomainInput) {
    await this.get(organizationId, id);
    if (input.brandId) await this.ensureBrand(organizationId, input.brandId);

    return this.prisma.$transaction(async (tx) => {
      if (input.isPrimary === true) {
        await tx.domain.updateMany({
          where: { organizationId, isPrimary: true, NOT: { id } },
          data: { isPrimary: false },
        });
      }
      return tx.domain.update({
        where: { id },
        data: {
          ...(input.brandId !== undefined ? { brandId: input.brandId } : {}),
          ...(input.isPrimary !== undefined ? { isPrimary: input.isPrimary } : {}),
        },
      });
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.get(organizationId, id);
    await this.prisma.domain.delete({ where: { id } });
  }

  /**
   * Run DNS verification. On success, records ownership and immediately kicks
   * off automated TLS provisioning so the domain becomes fully ACTIVE.
   */
  async verify(organizationId: string, id: string) {
    const domain = await this.get(organizationId, id);
    if (!domain.verificationToken) {
      throw AppError.conflict('This domain has no active verification challenge.');
    }

    const now = new Date();
    const challenge = await this.dns.verifyChallenge(domain.hostname, domain.verificationToken);
    const routing =
      domain.kind === 'CUSTOM' ? await this.dns.verifyCname(domain.hostname) : { ok: true };

    if (!challenge.ok || !routing.ok) {
      return this.prisma.domain.update({
        where: { id },
        data: {
          status: 'FAILED',
          lastCheckedAt: now,
          failureReason: challenge.ok ? routing.reason : challenge.reason,
        },
      });
    }

    // Ownership verified — provision the certificate automatically.
    const cert = await this.ssl.issue(domain.hostname);
    return this.prisma.domain.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        verifiedAt: now,
        dnsVerifiedAt: now,
        lastCheckedAt: now,
        failureReason: null,
        sslStatus: 'ISSUED',
        sslIssuedAt: cert.issuedAt,
        sslExpiresAt: cert.expiresAt,
      },
    });
  }

  /** Manually (re)provision or renew the TLS certificate for a verified domain. */
  async provisionSsl(organizationId: string, id: string) {
    const domain = await this.get(organizationId, id);
    if (domain.status !== 'VERIFIED' && domain.status !== 'ACTIVE') {
      throw AppError.conflict('Verify the domain before provisioning a certificate.');
    }

    await this.prisma.domain.update({ where: { id }, data: { sslStatus: 'PENDING' } });
    const cert = await this.ssl.issue(domain.hostname);
    return this.prisma.domain.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        sslStatus: 'ISSUED',
        sslIssuedAt: cert.issuedAt,
        sslExpiresAt: cert.expiresAt,
      },
    });
  }

  private async ensureBrand(organizationId: string, brandId: string): Promise<void> {
    const brand = await this.prisma.brand.findFirst({
      where: { id: brandId, organizationId, deletedAt: null },
      select: { id: true },
    });
    if (!brand) throw AppError.notFound('Brand', brandId);
  }
}
