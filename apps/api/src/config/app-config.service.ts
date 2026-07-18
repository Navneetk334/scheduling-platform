import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from './env.validation';

/**
 * Thin, fully-typed wrapper over Nest's ConfigService. Consumers inject this
 * instead of reading `process.env` directly.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true });
  }

  get isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  get isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }
}
