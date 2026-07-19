import { randomBytes } from 'node:crypto';
import { promises as dns } from 'node:dns';

import { Injectable, Logger } from '@nestjs/common';

/** The platform apex + CNAME target customers point custom domains at. */
export const PLATFORM_APEX = 'invinciblepros.app';
export const PLATFORM_CNAME_TARGET = `cname.${PLATFORM_APEX}`;
/** Prefix for the TXT challenge record used to prove domain ownership. */
export const CHALLENGE_PREFIX = '_invincible-challenge';

export interface DnsRecordSpec {
  type: 'TXT' | 'CNAME' | 'A';
  name: string;
  value: string;
  ttl?: number;
}

export interface DnsCheckResult {
  ok: boolean;
  /** Human-readable reason when `ok` is false. */
  reason?: string;
}

/**
 * Domain-ownership + routing verification via real DNS lookups. Ownership is
 * proven with a TXT challenge; routing is confirmed with a CNAME (custom
 * hostnames) pointing at the platform edge.
 *
 * The lookups use the Node resolver, so this performs genuine network checks;
 * unresolved/fake domains fail with a descriptive reason (the correct
 * behavior). The verification *policy* is centralized here so a managed DNS
 * provider can be swapped in without touching the domain service.
 */
@Injectable()
export class DnsService {
  private readonly logger = new Logger(DnsService.name);

  /** Generate a fresh, opaque verification token. */
  generateToken(): string {
    return `inv_${randomBytes(24).toString('hex')}`;
  }

  /** The DNS records a customer must publish for the given hostname/token. */
  expectedRecords(hostname: string, token: string, kind: 'SUBDOMAIN' | 'CUSTOM'): DnsRecordSpec[] {
    const records: DnsRecordSpec[] = [
      { type: 'TXT', name: `${CHALLENGE_PREFIX}.${hostname}`, value: token, ttl: 300 },
    ];
    // Subdomains live on the platform apex and need no customer CNAME.
    if (kind === 'CUSTOM') {
      records.push({ type: 'CNAME', name: hostname, value: PLATFORM_CNAME_TARGET, ttl: 300 });
    }
    return records;
  }

  /** Confirm the TXT challenge record contains the expected token. */
  async verifyChallenge(hostname: string, token: string): Promise<DnsCheckResult> {
    const recordName = `${CHALLENGE_PREFIX}.${hostname}`;
    try {
      const chunks = await dns.resolveTxt(recordName);
      // resolveTxt returns string[][] (each record may be split into segments).
      const flattened = chunks.map((parts) => parts.join(''));
      if (flattened.some((value) => value.trim() === token)) {
        return { ok: true };
      }
      return {
        ok: false,
        reason: `TXT record ${recordName} found but did not contain the expected token.`,
      };
    } catch (error) {
      return { ok: false, reason: this.describeDnsError(recordName, error) };
    }
  }

  /** Confirm a custom hostname's CNAME points at the platform edge. */
  async verifyCname(hostname: string): Promise<DnsCheckResult> {
    try {
      const targets = await dns.resolveCname(hostname);
      if (targets.some((t) => t.replace(/\.$/, '') === PLATFORM_CNAME_TARGET)) {
        return { ok: true };
      }
      return {
        ok: false,
        reason: `CNAME for ${hostname} does not point to ${PLATFORM_CNAME_TARGET}.`,
      };
    } catch (error) {
      return { ok: false, reason: this.describeDnsError(hostname, error) };
    }
  }

  private describeDnsError(name: string, error: unknown): string {
    const code = (error as NodeJS.ErrnoException)?.code;
    this.logger.debug(`DNS lookup for ${name} failed: ${code ?? String(error)}`);
    if (code === 'ENOTFOUND' || code === 'ENODATA') {
      return `No matching DNS record found for ${name}. Add the record and try again — changes can take a few minutes to propagate.`;
    }
    if (code === 'ETIMEOUT') {
      return `DNS lookup for ${name} timed out. Please retry shortly.`;
    }
    return `Could not resolve ${name}. Verify the record and retry.`;
  }
}
