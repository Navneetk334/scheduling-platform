/**
 * Zoho CRM provider (OAuth 2.0). The token response carries an `api_domain`
 * (data-center specific), persisted in config and used as the API base.
 * https://www.zoho.com/crm/developer/docs/api/v6/
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  getString,
  requireString,
  type CrmActivity,
  type CrmContact,
  type CrmProvider,
  type CrmRef,
  type HealthCheckResult,
  type OAuthEndpoints,
  type ProviderRuntimeContext,
} from '../../core';

function apiBase(ctx: ProviderRuntimeContext): string {
  return (getString(ctx.config, 'apiDomain') ?? 'https://www.zohoapis.com').replace(/\/$/, '');
}

function auth(ctx: ProviderRuntimeContext): Record<string, string> {
  return { Authorization: `Zoho-oauthtoken ${requireString(ctx.credentials, 'accessToken')}` };
}

class ZohoCrmProvider implements CrmProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'zoho_crm',
    name: 'Zoho CRM',
    category: 'CRM',
    authType: 'OAUTH2',
    description: 'Upsert Zoho CRM contacts and log bookings as tasks.',
    docsUrl: 'https://www.zoho.com/crm/developer/docs/api/v6/',
    supportsInboundWebhooks: true,
    oauthScopes: [
      { value: 'ZohoCRM.modules.ALL', description: 'Read/write CRM records' },
      { value: 'ZohoCRM.settings.ALL', description: 'Read module metadata' },
    ],
    configFields: [
      {
        key: 'apiDomain',
        label: 'API domain',
        type: 'string',
        required: false,
        help: 'Auto-filled from the OAuth token response (e.g. https://www.zohoapis.eu).',
      },
    ],
  };

  readonly oauth: OAuthEndpoints = {
    authorizeUrl: 'https://accounts.zoho.com/oauth/v2/auth',
    tokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
    scopes: ['ZohoCRM.modules.ALL', 'ZohoCRM.settings.READ'],
    authorizeParams: { access_type: 'offline', prompt: 'consent' },
    scopeSeparator: ',',
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(`${apiBase(ctx)}/crm/v6/org`, {
      headers: auth(ctx),
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async upsertContact(ctx: ProviderRuntimeContext, contact: CrmContact): Promise<CrmRef> {
    const { data } = await ctx.http.post<{ data: { details?: { id?: string } }[] }>(
      `${apiBase(ctx)}/crm/v6/Contacts/upsert`,
      {
        headers: auth(ctx),
        json: {
          data: [
            {
              Email: contact.email,
              First_Name: contact.firstName,
              Last_Name: contact.lastName ?? contact.email,
              Phone: contact.phone,
              Account_Name: contact.company,
              ...contact.properties,
            },
          ],
          duplicate_check_fields: ['Email'],
        },
      },
    );
    return { externalId: data.data[0]?.details?.id ?? contact.email, raw: data };
  }

  async logActivity(ctx: ProviderRuntimeContext, activity: CrmActivity): Promise<CrmRef> {
    const { data } = await ctx.http.post<{ data: { details?: { id?: string } }[] }>(
      `${apiBase(ctx)}/crm/v6/Tasks`,
      {
        headers: auth(ctx),
        json: {
          data: [
            {
              Subject: activity.subject,
              Description: activity.body,
              Status: 'Completed',
              Due_Date: (activity.occurredAt ?? new Date().toISOString()).slice(0, 10),
            },
          ],
        },
      },
    );
    return { externalId: data.data[0]?.details?.id ?? 'unknown', raw: data };
  }
}

export const zohoCrm = new ZohoCrmProvider();
