/**
 * Salesforce CRM provider (OAuth 2.0 web-server flow). The token response
 * carries an `instance_url`, persisted in the connection config and used as the
 * REST API base. https://developer.salesforce.com/docs/apis
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  bearerAuth,
  requireString,
  type CrmActivity,
  type CrmContact,
  type CrmProvider,
  type CrmRef,
  type ExternalAccount,
  type HealthCheckResult,
  type OAuthEndpoints,
  type ProviderRuntimeContext,
} from '../../core';

const API_VERSION = 'v59.0';

function instanceUrl(ctx: ProviderRuntimeContext): string {
  return requireString(ctx.config, 'instanceUrl').replace(/\/$/, '');
}

function sobjectUrl(ctx: ProviderRuntimeContext, path: string): string {
  return `${instanceUrl(ctx)}/services/data/${API_VERSION}/${path}`;
}

class SalesforceProvider implements CrmProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    authType: 'OAUTH2',
    description: 'Create Salesforce contacts and log bookings as Tasks.',
    docsUrl: 'https://developer.salesforce.com/docs/apis',
    supportsInboundWebhooks: false,
    oauthScopes: [
      { value: 'api', description: 'Access and manage data via the REST API' },
      { value: 'refresh_token', description: 'Maintain access without re-consent' },
    ],
    configFields: [
      {
        key: 'instanceUrl',
        label: 'Instance URL',
        type: 'string',
        required: false,
        help: 'Auto-filled from the OAuth token response.',
      },
    ],
  };

  readonly oauth: OAuthEndpoints = {
    authorizeUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
    scopes: ['api', 'refresh_token'],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(sobjectUrl(ctx, 'limits'), {
      headers: bearerAuth(ctx.credentials),
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async fetchAccount(ctx: ProviderRuntimeContext): Promise<ExternalAccount> {
    return { id: instanceUrl(ctx) };
  }

  async upsertContact(ctx: ProviderRuntimeContext, contact: CrmContact): Promise<CrmRef> {
    const body: Record<string, unknown> = {
      LastName: contact.lastName ?? contact.email,
      FirstName: contact.firstName,
      Email: contact.email,
      Phone: contact.phone,
      ...contact.properties,
    };
    const { data } = await ctx.http.post<{ id: string }>(sobjectUrl(ctx, 'sobjects/Contact'), {
      headers: bearerAuth(ctx.credentials),
      json: body,
      // Duplicates are reported as 400 with DUPLICATES_DETECTED; treat as non-retryable.
      retry: { maxAttempts: 2 },
    });
    return { externalId: data.id, raw: data };
  }

  async logActivity(ctx: ProviderRuntimeContext, activity: CrmActivity): Promise<CrmRef> {
    const { data } = await ctx.http.post<{ id: string }>(sobjectUrl(ctx, 'sobjects/Task'), {
      headers: bearerAuth(ctx.credentials),
      json: {
        Subject: activity.subject,
        Description: activity.body,
        Status: 'Completed',
        ActivityDate: (activity.occurredAt ?? new Date().toISOString()).slice(0, 10),
      },
    });
    return { externalId: data.id, raw: data };
  }
}

export const salesforce = new SalesforceProvider();
