/**
 * PayPal payment provider. Authenticates with client-credentials (client id +
 * secret) to obtain a short-lived access token, then uses Orders v2 for
 * checkout and the verify-webhook-signature API for inbound webhooks.
 * https://developer.paypal.com/docs/api/
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  basicAuth,
  getString,
  requireString,
  type HttpClient,
  type CheckoutInput,
  type CheckoutSession,
  type ExternalAccount,
  type HealthCheckResult,
  type PaymentProvider,
  type PaymentWebhookResult,
  type ProviderRuntimeContext,
  type RefundInput,
  type RefundResult,
} from '../../core';

function apiBase(ctx: ProviderRuntimeContext): string {
  return getString(ctx.config, 'environment') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function accessToken(ctx: ProviderRuntimeContext, http: HttpClient): Promise<string> {
  const { data } = await http.post<{ access_token: string }>(`${apiBase(ctx)}/v1/oauth2/token`, {
    headers: basicAuth(
      requireString(ctx.credentials, 'clientId'),
      requireString(ctx.credentials, 'clientSecret'),
    ),
    form: { grant_type: 'client_credentials' },
  });
  return data.access_token;
}

function toMajorUnits(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

class PayPalProvider implements PaymentProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'paypal',
    name: 'PayPal',
    category: 'PAYMENT',
    authType: 'API_KEY',
    description: 'Collect payments via PayPal Orders (Checkout).',
    docsUrl: 'https://developer.paypal.com/docs/api/',
    supportsInboundWebhooks: true,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'string', required: true },
      { key: 'clientSecret', label: 'Client secret', type: 'secret', required: true },
    ],
    configFields: [
      {
        key: 'environment',
        label: 'Environment',
        type: 'select',
        required: true,
        options: [
          { label: 'Sandbox', value: 'sandbox' },
          { label: 'Live', value: 'live' },
        ],
      },
      { key: 'webhookId', label: 'Webhook ID', type: 'string', required: false },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await accessToken(ctx, ctx.http);
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async fetchAccount(ctx: ProviderRuntimeContext): Promise<ExternalAccount> {
    return { id: requireString(ctx.credentials, 'clientId') };
  }

  async createCheckout(ctx: ProviderRuntimeContext, input: CheckoutInput): Promise<CheckoutSession> {
    const token = await accessToken(ctx, ctx.http);
    const { data } = await ctx.http.post<{
      id: string;
      links: { rel: string; href: string }[];
    }>(`${apiBase(ctx)}/v2/checkout/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      json: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: input.reference,
            custom_id: input.reference,
            description: input.description,
            amount: { currency_code: input.currency.toUpperCase(), value: toMajorUnits(input.amountMinor) },
          },
        ],
        application_context: { return_url: input.successUrl, cancel_url: input.cancelUrl },
      },
    });
    const approve = data.links.find((l) => l.rel === 'approve' || l.rel === 'payer-action');
    return { externalId: data.id, url: approve?.href ?? '', raw: data };
  }

  async refund(ctx: ProviderRuntimeContext, input: RefundInput): Promise<RefundResult> {
    const token = await accessToken(ctx, ctx.http);
    const { data } = await ctx.http.post<{ id: string; status: string }>(
      `${apiBase(ctx)}/v2/payments/captures/${encodeURIComponent(input.paymentId)}/refund`,
      {
        headers: { Authorization: `Bearer ${token}` },
        json:
          input.amountMinor !== undefined
            ? { amount: { value: toMajorUnits(input.amountMinor), currency_code: 'USD' } }
            : {},
      },
    );
    return { externalId: data.id, status: data.status, raw: data };
  }

  async verifyWebhook(
    ctx: ProviderRuntimeContext,
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<PaymentWebhookResult> {
    const webhookId = getString(ctx.config, 'webhookId');
    if (!webhookId) return { verified: false };
    const token = await accessToken(ctx, ctx.http);
    const event = JSON.parse(rawBody) as {
      event_type?: string;
      resource?: { id?: string; custom_id?: string };
    };

    const { data } = await ctx.http.post<{ verification_status: string }>(
      `${apiBase(ctx)}/v1/notifications/verify-webhook-signature`,
      {
        headers: { Authorization: `Bearer ${token}` },
        json: {
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: webhookId,
          webhook_event: event,
        },
      },
    );
    const verified = data.verification_status === 'SUCCESS';
    return {
      verified,
      ...(event.event_type ? { eventType: event.event_type } : {}),
      ...(event.resource?.id ? { paymentId: event.resource.id } : {}),
      ...(event.resource?.custom_id ? { reference: event.resource.custom_id } : {}),
      data: event,
    };
  }
}

export const paypal = new PayPalProvider();
