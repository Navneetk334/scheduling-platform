import { SecretBox } from '@invincible/integrations';
import { Injectable } from '@nestjs/common';

import { AppConfigService } from '../../config/app-config.service';

/**
 * Encrypts/decrypts provider credential bags at rest using the platform
 * {@link SecretBox} (AES-256-GCM). The encryption key comes from
 * INTEGRATIONS_ENCRYPTION_KEY. No plaintext secret ever touches the database.
 */
@Injectable()
export class CredentialsService {
  private readonly box: SecretBox;

  constructor(config: AppConfigService) {
    this.box = new SecretBox(config.get('INTEGRATIONS_ENCRYPTION_KEY'));
  }

  encrypt(credentials: Record<string, unknown>): string {
    return this.box.encryptJson(credentials);
  }

  decrypt(payload: string | null | undefined): Record<string, unknown> {
    if (!payload) return {};
    return this.box.decryptJson<Record<string, unknown>>(payload);
  }

  /** Encrypt a single opaque string (e.g. a webhook signing secret). */
  encryptValue(value: string): string {
    return this.box.encrypt(value);
  }

  /** Decrypt a value produced by {@link encryptValue}. */
  decryptValue(payload: string): string {
    return this.box.decrypt(payload);
  }
}
