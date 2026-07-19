/**
 * Pipedrive CRM provider (API token, passed as an `api_token` query param).
 * https://developers.pipedrive.com/docs/api/v1
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
  type ProviderRuntimeContext,
} from '../../core';

function apiBase(ctx: ProviderRuntimeContext): string {
  const domain = getString(ctx.config, 'companyDomain');
  return domain ? `https://${domain}.pipedrive.com/api/v1` : 'https://api.pipedrive.com/v1';
}

function token(ctx: ProviderRuntimeContext): string {
  return requireString(ctx.credentials, 'apiToken');
}

class PipedriveProvider implements CrmProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'pipedrive',
    name: 'Pipedrive',
    category: 'CRM',
    authType: 'API_KEY',
    description: 'Create Pipedrive persons and log bookings as activities.',
    docsUrl: 'https://developers.pipedrive.com/docs/api/v1',
    supportsInboundWebhooks: true,
    credentialFields: [{ key: 'apiToken', label: 'API token', type: 'secret', required: true }],
    configFields: [
      {
        key: 'companyDomain',
        label: 'Company domain',
        type: 'string',
        required: false,
        placeholder: 'yourcompany',
      },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(`${apiBase(ctx)}/users/me`, {
      query: { api_token: token(ctx) },
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async upsertContact(ctx: ProviderRuntimeContext, contact: CrmContact): Promise<CrmRef> {
    const found = await ctx.http
      .get<{ data?: { items?: { item: { id: number } }[] } }>(`${apiBase(ctx)}/persons/search`, {
        query: { api_token: token(ctx), term: contact.email, fields: 'email', exact_match: true },
        retry: false,
      })
      .catch(() => null);

    const existingId = found?.data.data?.items?.[0]?.item.id;
    const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email;
    const body = {
      name,
      email: [{ value: contact.email, primary: true }],
      ...(contact.phone ? { phone: [{ value: contact.phone, primary: true }] } : {}),
    };

    if (existingId) {
      const { data } = await ctx.http.request<{ data: { id: number } }>(
        `${apiBase(ctx)}/persons/${existingId}`,
        { method: 'PUT', query: { api_token: token(ctx) }, json: body },
      );
      return { externalId: String(data.data.id), raw: data };
    }
    const { data } = await ctx.http.post<{ data: { id: number } }>(`${apiBase(ctx)}/persons`, {
      query: { api_token: token(ctx) },
      json: body,
    });
    return { externalId: String(data.data.id), raw: data };
  }

  async logActivity(ctx: ProviderRuntimeContext, activity: CrmActivity): Promise<CrmRef> {
    const { data } = await ctx.http.post<{ data: { id: number } }>(`${apiBase(ctx)}/activities`, {
      query: { api_token: token(ctx) },
      json: {
        subject: activity.subject,
        type: activity.type,
        note: activity.body,
        done: 1,
        due_date: (activity.occurredAt ?? new Date().toISOString()).slice(0, 10),
      },
    });
    return { externalId: String(data.data.id), raw: data };
  }
}

export const pipedrive = new PipedriveProvider();
