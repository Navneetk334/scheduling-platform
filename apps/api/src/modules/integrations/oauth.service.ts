import type { IntegrationCategory, Prisma } from '@invincible/database';
import {
  HttpClient,
  type ExternalAccount,
  type ProviderRuntimeContext,
} from '@invincible/integrations';
import { AppError, ErrorCode } from '@invincible/utils';
import { Injectable, Logger } from '@nestjs/common';

import { AppConfigService } from '../../config/app-config.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

import { CredentialsService } from './credentials.service';
import {
  OAUTH_STATE_TTL_SECONDS,
  oauthStateKey,
} from './integrations.constants';
import { OAuthClientFactory } from './oauth-client.factory';

interface StoredState {
  organizationId: string;
  userId: string;
  provider: string;
  returnTo?: string;
  codeVerifier?: string;
}

/**
 * Implements the OAuth 2.0 authorization-code flow for OAuth providers:
 *  - `authorize` builds the provider consent URL and stashes a CSRF state in
 *    Redis (with the PKCE verifier when applicable).
 *  - `handleCallback` exchanges the code for tokens, resolves the external
 *    account, and upserts an encrypted, ACTIVE connection.
 */
@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly config: AppConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly credentials: CredentialsService,
    private readonly oauthClients: OAuthClientFactory,
  ) {}

  async authorize(
    organizationId: string,
    userId: string,
    providerId: string,
    returnTo?: string,
  ): Promise<{ authorizeUrl: string }> {
    const provider = this.oauthClients.provider(providerId);
    if (provider.descriptor.authType !== 'OAUTH2' || !provider.oauth) {
      throw new AppError(ErrorCode.Validation, `"${providerId}" does not support OAuth.`);
    }
    if (!this.oauthClients.isConfigured(providerId)) {
      throw new AppError(
        ErrorCode.Validation,
        `OAuth is not configured for "${providerId}" on this server.`,
      );
    }

    const client = this.oauthClients.create(provider);
    const { url, state, codeVerifier } = client.buildAuthorizeUrl();

    const stored: StoredState = {
      organizationId,
      userId,
      provider: providerId,
      ...(returnTo ? { returnTo } : {}),
      ...(codeVerifier ? { codeVerifier } : {}),
    };
    await this.redis.client.set(
      oauthStateKey(state),
      JSON.stringify(stored),
      'EX',
      OAUTH_STATE_TTL_SECONDS,
    );

    return { authorizeUrl: url };
  }

  async handleCallback(code: string, state: string): Promise<{ returnTo: string }> {
    const raw = await this.redis.client.get(oauthStateKey(state));
    if (!raw) {
      throw new AppError(ErrorCode.Unauthorized, 'Invalid or expired OAuth state.');
    }
    await this.redis.client.del(oauthStateKey(state));
    const stored = JSON.parse(raw) as StoredState;

    const provider = this.oauthClients.provider(stored.provider);
    const client = this.oauthClients.create(provider);
    const tokens = await client.exchangeCode(code, stored.codeVerifier);

    // Carry provider-specific API base hints from the token response.
    const config: Record<string, unknown> = {};
    if (typeof tokens.raw['instance_url'] === 'string') config['instanceUrl'] = tokens.raw['instance_url'];
    if (typeof tokens.raw['api_domain'] === 'string') config['apiDomain'] = tokens.raw['api_domain'];

    const credentials: Record<string, unknown> = {
      accessToken: tokens.accessToken,
      ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
      ...(tokens.tokenType ? { tokenType: tokens.tokenType } : {}),
    };

    const account = await this.resolveAccount(provider.descriptor.id, credentials, config);

    await this.upsertConnection({
      organizationId: stored.organizationId,
      userId: stored.userId,
      providerId: provider.descriptor.id,
      category: provider.descriptor.category,
      credentials,
      config,
      account,
      scopes: tokens.scope ? tokens.scope.split(/[ ,]+/) : [...provider.oauth!.scopes],
      tokenExpiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : null,
    });

    return { returnTo: stored.returnTo ?? `${this.config.get('WEB_URL')}/dashboard/integrations` };
  }

  private async resolveAccount(
    providerId: string,
    credentials: Record<string, unknown>,
    config: Record<string, unknown>,
  ): Promise<ExternalAccount | null> {
    const provider = this.oauthClients.provider(providerId);
    if (!provider.fetchAccount) return null;
    const ctx: ProviderRuntimeContext = {
      connectionId: 'pending',
      organizationId: 'pending',
      provider: providerId,
      credentials,
      config,
      http: new HttpClient({ provider: providerId }),
      now: () => new Date(),
    };
    try {
      return await provider.fetchAccount(ctx);
    } catch (error) {
      this.logger.warn(`fetchAccount failed for ${providerId}: ${(error as Error).message}`);
      return null;
    }
  }

  private async upsertConnection(params: {
    organizationId: string;
    userId: string;
    providerId: string;
    category: IntegrationCategory;
    credentials: Record<string, unknown>;
    config: Record<string, unknown>;
    account: ExternalAccount | null;
    scopes: string[];
    tokenExpiresAt: Date | null;
  }): Promise<void> {
    const externalAccountId = params.account?.id ?? null;
    const displayName = params.account?.email
      ? `${this.oauthClients.provider(params.providerId).descriptor.name} (${params.account.email})`
      : this.oauthClients.provider(params.providerId).descriptor.name;

    const data = {
      displayName,
      authType: 'OAUTH2' as const,
      category: params.category,
      status: 'ACTIVE' as const,
      healthStatus: 'HEALTHY' as const,
      encryptedCredentials: this.credentials.encrypt(params.credentials),
      config: params.config as Prisma.InputJsonValue,
      scopes: params.scopes,
      externalAccountId,
      externalAccountEmail: params.account?.email ?? null,
      tokenExpiresAt: params.tokenExpiresAt,
      lastError: null,
    };

    const existing = await this.prisma.integrationConnection.findFirst({
      where: {
        organizationId: params.organizationId,
        provider: params.providerId,
        externalAccountId,
      },
    });

    if (existing) {
      await this.prisma.integrationConnection.update({ where: { id: existing.id }, data });
    } else {
      await this.prisma.integrationConnection.create({
        data: {
          organizationId: params.organizationId,
          provider: params.providerId,
          createdById: params.userId,
          ...data,
        },
      });
    }
  }
}
