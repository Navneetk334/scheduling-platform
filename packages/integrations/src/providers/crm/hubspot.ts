/**
 * HubSpot CRM provider. Supports both OAuth 2.0 and private-app tokens (both
 * presented as a Bearer access token). Uses the v3 CRM objects API.
 * https://developers.hubspot.com/docs/api/crm/contacts
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  bearerAuth,
  type CrmActivity,
  type CrmContact,
  type CrmProvider,
  type CrmRef,
  type HealthCheckResult,
  type OAuthEndpoints,
  type ProviderRuntimeContext,
} from '../../core';

const API = 'https://api.hubapi.com';

class HubSpotProvider implements CrmProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM',
    authType: 'OAUTH2',
    description: 'Sync invitees as contacts and log bookings as HubSpot activities.',
    docsUrl: 'https://developers.hubspot.com/docs/api/crm/contacts',
    supportsInboundWebhooks: true,
    oauthScopes: [
      { value: 'crm.objects.contacts.write', description: 'Create/update contacts' },
      { value: 'crm.objects.contacts.read', description: 'Read contacts' },
    ],
  };

  readonly oauth: OAuthEndpoints = {
    authorizeUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'oauth'],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(`${API}/crm/v3/objects/contacts`, {
      headers: bearerAuth(ctx.credentials),
      query: { limit: 1 },
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async upsertContact(ctx: ProviderRuntimeContext, contact: CrmContact): Promise<CrmRef> {
    const properties: Record<string, unknown> = {
      email: contact.email,
      firstname: contact.firstName,
      lastname: contact.lastName,
      phone: contact.phone,
      company: contact.company,
      ...contact.properties,
    };
    const { data } = await ctx.http.post<{ results: { id: string }[] }>(
      `${API}/crm/v3/objects/contacts/batch/upsert`,
      {
        headers: bearerAuth(ctx.credentials),
        json: { inputs: [{ idProperty: 'email', id: contact.email, properties }] },
      },
    );
    return { externalId: data.results[0]?.id ?? contact.email, raw: data };
  }

  async logActivity(ctx: ProviderRuntimeContext, activity: CrmActivity): Promise<CrmRef> {
    // Resolve the contact id by email so we can associate the note.
    const contact = await ctx.http
      .get<{ id: string }>(
        `${API}/crm/v3/objects/contacts/${encodeURIComponent(activity.contactEmail)}`,
        { headers: bearerAuth(ctx.credentials), query: { idProperty: 'email' }, retry: false },
      )
      .catch(() => null);

    const timestamp = activity.occurredAt ?? new Date().toISOString();
    const { data } = await ctx.http.post<{ id: string }>(`${API}/crm/v3/objects/notes`, {
      headers: bearerAuth(ctx.credentials),
      json: {
        properties: {
          hs_note_body: `${activity.subject}${activity.body ? `\n\n${activity.body}` : ''}`,
          hs_timestamp: timestamp,
        },
        ...(contact
          ? {
              associations: [
                {
                  to: { id: contact.data.id },
                  types: [
                    { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 },
                  ],
                },
              ],
            }
          : {}),
      },
    });
    return { externalId: data.id, raw: data };
  }
}

export const hubspot = new HubSpotProvider();
