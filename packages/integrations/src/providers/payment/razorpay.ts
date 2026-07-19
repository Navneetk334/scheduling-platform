/**
 * Razorpay payment provider (key id + secret, HTTP Basic auth). Uses Payment
 * Links for collection and verifies webhooks with an HMAC-SHA256 signature.
 * https://razorpay.com/docs/api/
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

import type { ProviderDescriptor } from '@invincible/types';

import {
  basicAuth,
  getString,
  requireString,
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

const API = 'https://api.razorpay.com/v1';

function auth(ctx: ProviderRuntimeContext): Record<string, string> {
  return basicAuth(
    requireString(ctx.credentials, 'keyId'),
    requireString(ctx.credentials, 'keySecret'),
  );
}

class RazorpayProvider implements PaymentProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'razorpay',
    name: 'Razorpay',
    category: 'PAYMENT',
    authType: 'API_KEY',
    description: 'Collect payments (cards, UPI, netbanking) via Razorpay Payment Links.',
    docsUrl: 'https://razorpay.com/docs/api/',
    supportsInboundWebhooks: true,
    credentialFields: [
      { key: 'keyId', label: 'Key ID', type: 'string', required: true, placeholder: 'rzp_live_…' },
      { key: 'keySecret', label: 'Key secret', type: 'secret', required: true },
    ],
    configFields: [
      { key: 'webhookSecret', label: 'Webhook secret', type: 'secret', required: false },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(`${API}/payments`, {
      headers: auth(ctx),
      query: { count: 1 },
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async fetchAccount(ctx: ProviderRuntimeContext): Promise<ExternalAccount> {
    return { id: requireString(ctx.credentials, 'keyId') };
  }

  async createCheckout(ctx: ProviderRuntimeContext, input: CheckoutInput): Promise<CheckoutSession> {
    const { data } = await ctx.http.post<{ id: string; short_url: string }>(
      `${API}/payment_links`,
      {
        headers: auth(ctx),
        json: {
          amount: input.amountMinor,
          currency: input.currency.toUpperCase(),
          description: input.description,
          reference_id: input.reference,
          callback_url: input.successUrl,
          callback_method: 'get',
          ...(input.customerEmail ? { customer: { email: input.customerEmail } } : {}),
          notes: { reference: input.reference, ...input.metadata },
        },
      },
    );
    return { externalId: data.id, url: data.short_url, raw: data };
  }

  async refund(ctx: ProviderRuntimeContext, input: RefundInput): Promise<RefundResult> {
    const { data } = await ctx.http.post<{ id: string; status: string }>(
      `${API}/payments/${encodeURIComponent(input.paymentId)}/refund`,
      {
        headers: auth(ctx),
        json: input.amountMinor !== undefined ? { amount: input.amountMinor } : {},
      },
    );
    return { externalId: data.id, status: data.status, raw: data };
  }

  verifyWebhook(
    ctx: ProviderRuntimeContext,
    rawBody: string,
    headers: Record<string, string>,
  ): PaymentWebhookResult {
    const secret = getString(ctx.config, 'webhookSecret');
    const signature = headers['x-razorpay-signature'];
    if (!secret || !signature) return { verified: false };

    const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return { verified: false };

    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: { payment?: { entity?: { id?: string; notes?: { reference?: string } } } };
    };
    const entity = event.payload?.payment?.entity;
    return {
      verified: true,
      eventType: event.event,
      ...(entity?.id ? { paymentId: entity.id } : {}),
      ...(entity?.notes?.reference ? { reference: entity.notes.reference } : {}),
      data: event,
    };
  }
}

export const razorpay = new RazorpayProvider();
