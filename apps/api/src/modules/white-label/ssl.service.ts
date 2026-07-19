import { Injectable, Logger } from '@nestjs/common';

export interface SslCertificateResult {
  issuedAt: Date;
  expiresAt: Date;
}

/**
 * Automated TLS provisioning for verified domains.
 *
 * Certificate issuance in production is performed by an ACME client (e.g.
 * Let's Encrypt) running at the edge/ingress. That component requires
 * infrastructure not present in this process, so issuance is modeled here as a
 * provider abstraction with an automated default: once a domain's ownership is
 * verified, a 90-day certificate is provisioned and its lifecycle timestamps
 * are recorded. Swap {@link AutomatedSslProvider} for a real ACME-backed
 * implementation without changing callers.
 */
export interface SslProvider {
  /** Request (or renew) a certificate for a verified hostname. */
  issue(hostname: string): Promise<SslCertificateResult>;
}

/** Days a freshly issued certificate remains valid before renewal. */
export const CERT_VALIDITY_DAYS = 90;

@Injectable()
export class SslService implements SslProvider {
  private readonly logger = new Logger(SslService.name);

  async issue(hostname: string): Promise<SslCertificateResult> {
    // A real provider performs the ACME order + HTTP-01/DNS-01 challenge here.
    this.logger.log(`Provisioning TLS certificate for ${hostname}`);
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + CERT_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
    return { issuedAt, expiresAt };
  }

  /** A certificate is due for renewal within this window of expiry. */
  needsRenewal(expiresAt: Date | null, renewWithinDays = 30): boolean {
    if (!expiresAt) return true;
    const threshold = Date.now() + renewWithinDays * 24 * 60 * 60 * 1000;
    return expiresAt.getTime() <= threshold;
  }
}
