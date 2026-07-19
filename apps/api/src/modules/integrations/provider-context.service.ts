import type { IntegrationConnection, Prisma } from '@invincible/database';
import {
  HttpClient,
  type ProviderRuntimeContext,
} from '@invincible/integrations';
import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CredentialsService } from './credentials.service';
import { TOKEN_REFRESH_SKEW_MS } from './integrations.constants';
import { OAuthClientFactory } from './oauth-client.factory';

/**
 * Materializes a decrypted {@link ProviderRuntimeContext} for a connection.
 * For OAuth connections it transparently refreshes an access token that is
 * expired (or about to expire) and persists the rotated credentials.
 */
@Injectable()
export class ProviderContextService {
  private readonly logger = new Logger(ProviderContextService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly credentials: CredentialsService,
    private readonly oauthClients: OAuthClientFactory,
  ) {}

  async build(connection: IntegrationConnection): Promise<ProviderRuntimeContext> {
    let credentials = this.credentials.decrypt(connection.encryptedCredentials);
    let config = (connection.config as Record<string, unknown> | null) ?? {};

    if (this.needsRefresh(connection, credentials)) {
      const refreshed = await this.refresh(connection, credentials, config);
      credentials = refreshed.credentials;
      config = refreshed.config;
    }

    return {
      connectionId: connection.id,
      organizationId: connection.organizationId,
      provider: connection.provider,
      credentials,
      config,
      http: new HttpClient({ provider: connection.provider }),
      now: () => new Date(),
    };
  }

  private needsRefresh(
    connection: IntegrationConnection,
    credentials: Record<string, unknown>,
  ): boolean {
    if (connection.authType !== 'OAUTH2') return false;
    if (typeof credentials['refreshToken'] !== 'string') return false;
    if (!connection.tokenExpiresAt) return false;
    return connection.tokenExpiresAt.getTime() - Date.now() <= TOKEN_REFRESH_SKEW_MS;
  }

  private async refresh(
    connection: IntegrationConnection,
    credentials: Record<string, unknown>,
    config: Record<string, unknown>,
  ): Promise<{ credentials: Record<string, unknown>; config: Record<string, unknown> }> {
    const provider = this.oauthClients.provider(connection.provider);
    const client = this.oauthClients.create(provider);
    this.logger.log(`Refreshing OAuth token for connection ${connection.id}.`);

    const tokens = await client.refresh(credentials['refreshToken'] as string);
    const nextCredentials: Record<string, unknown> = {
      ...credentials,
      accessToken: tokens.accessToken,
      ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
    };
    // Some providers return the API base in the token response.
    const nextConfig = { ...config };
    if (typeof tokens.raw['instance_url'] === 'string') {
      nextConfig['instanceUrl'] = tokens.raw['instance_url'];
    }
    if (typeof tokens.raw['api_domain'] === 'string') {
      nextConfig['apiDomain'] = tokens.raw['api_domain'];
    }

    await this.prisma.integrationConnection.update({
      where: { id: connection.id },
      data: {
        encryptedCredentials: this.credentials.encrypt(nextCredentials),
        config: nextConfig as Prisma.InputJsonValue,
        tokenExpiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : null,
        status: 'ACTIVE',
      },
    });

    return { credentials: nextCredentials, config: nextConfig };
  }
}
