import {
  OAuth2Client,
  type BaseProvider,
  type ProviderRegistry,
} from '@invincible/integrations';
import { AppError, ErrorCode } from '@invincible/utils';
import { Inject, Injectable } from '@nestjs/common';

import { AppConfigService } from '../../config/app-config.service';

import { OAUTH_CLIENT_ENV, PROVIDER_REGISTRY } from './integrations.constants';

/**
 * Builds a configured {@link OAuth2Client} for a provider by combining the
 * provider's static OAuth endpoint metadata with the client id/secret pulled
 * from the environment and the platform's single OAuth callback URL.
 */
@Injectable()
export class OAuthClientFactory {
  constructor(
    private readonly config: AppConfigService,
    @Inject(PROVIDER_REGISTRY) private readonly registry: ProviderRegistry,
  ) {}

  get redirectUri(): string {
    return `${this.config.get('API_URL')}/api/v1/integrations/oauth/callback`;
  }

  /** True when this provider has configured OAuth client credentials. */
  isConfigured(providerId: string): boolean {
    const env = OAUTH_CLIENT_ENV[providerId];
    if (!env) return false;
    return Boolean(this.config.get(env.idKey) && this.config.get(env.secretKey));
  }

  create(provider: BaseProvider): OAuth2Client {
    const endpoints = provider.oauth;
    const env = OAUTH_CLIENT_ENV[provider.descriptor.id];
    if (!endpoints || !env) {
      throw new AppError(
        ErrorCode.Validation,
        `Provider "${provider.descriptor.id}" does not support OAuth.`,
      );
    }
    const clientId = String(this.config.get(env.idKey));
    const clientSecret = String(this.config.get(env.secretKey));
    if (!clientId || !clientSecret) {
      throw new AppError(
        ErrorCode.Validation,
        `OAuth client credentials for "${provider.descriptor.id}" are not configured.`,
      );
    }

    return new OAuth2Client({
      authorizeUrl: endpoints.authorizeUrl,
      tokenUrl: endpoints.tokenUrl,
      clientId,
      clientSecret,
      redirectUri: this.redirectUri,
      scopes: endpoints.scopes,
      ...(endpoints.authorizeParams ? { authorizeParams: endpoints.authorizeParams } : {}),
      ...(endpoints.useBasicAuth !== undefined ? { useBasicAuth: endpoints.useBasicAuth } : {}),
      ...(endpoints.usePkce !== undefined ? { usePkce: endpoints.usePkce } : {}),
      ...(endpoints.scopeSeparator ? { scopeSeparator: endpoints.scopeSeparator } : {}),
    });
  }

  provider(providerId: string): BaseProvider {
    return this.registry.get(providerId);
  }
}
