/**
 * Stripe payment provider (secret API key). Uses Checkout Sessions for
 * collecting payment and verifies webhooks with the Stripe signature scheme
 * (t=timestamp,v1=HMAC-SHA256). https://stripe.com/docs/api
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

import type { ProviderDescriptor } from '@invincible/types';

import {
  bearerAuth,
  getString,
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

const API = 'https://api.stripe.com/v1';

function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(',').map((kv) => kv.split('=') as [string, string]),
  );
  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

class StripeProvider implements PaymentProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'stripe',
    name: 'Stripe',
    category: 'PAYMENT',
    authType: 'API_KEY',
    description: 'Collect payments for paid bookings via Stripe Checkout.',
    docsUrl: 'https://stripe.com/docs/api',
    supportsInboundWebhooks: true,
    credentialFields: [
      { key: 'secretKey', label: 'Secret key', type: 'secret', required: true, placeholder: 'sk_live_…' },
    ],
    configFields: [
      { key: 'webhookSecret', label: 'Webhook signing secret', type: 'secret', required: false, placeholder: 'whsec_…' },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(`${API}/balance`, {
      headers: bearerAuth(ctx.credentials, 'secretKey'),
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async fetchAccount(ctx: ProviderRuntimeContext): Promise<ExternalAccount> {
    const { data } = await ctx.http.get<{ id: string; email?: string; business_profile?: { name?: string } }>(
      `${API}/account`,
      { headers: bearerAuth(ctx.credentials, 'secretKey') },
    );
    return {
      id: data.id,
      ...(data.email ? { email: data.email } : {}),
      ...(data.business_profile?.name ? { name: data.business_profile.name } : {}),
    };
  }

  async createCheckout(ctx: ProviderRuntimeContext, input: CheckoutInput): Promise<CheckoutSession> {
    const form: Record<string, string | number | boolean> = {
      mode: 'payment',
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      client_reference_id: input.reference,
      'line_items[0][quantity]': 1,
      'line_items[0][price_data][currency]': input.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': input.amountMinor,
      'line_items[0][price_data][product_data][name]': input.description,
      'metadata[reference]': input.reference,
    };
    if (input.customerEmail) form['customer_email'] = input.customerEmail;
    for (const [k, v] of Object.entries(input.metadata ?? {})) form[`metadata[${k}]`] = v;

    const { data } = await ctx.http.post<{ id: string; url: string }>(`${API}/checkout/sessions`, {
      headers: bearerAuth(ctx.credentials, 'secretKey'),
      form,
    });
    return { externalId: data.id, url: data.url, raw: data };
  }

  async refund(ctx: ProviderRuntimeContext, input: RefundInput): Promise<RefundResult> {
    const form: Record<string, string | number> = { payment_intent: input.paymentId };
    if (input.amountMinor !== undefined) form['amount'] = input.amountMinor;
    if (input.reason) form['reason'] = 'requested_by_customer';

    const { data } = await ctx.http.post<{ id: string; status: string }>(`${API}/refunds`, {
      headers: bearerAuth(ctx.credentials, 'secretKey'),
      form,
    });
    return { externalId: data.id, status: data.status, raw: data };
  }

  verifyWebhook(
    ctx: ProviderRuntimeContext,
    rawBody: string,
    headers: Record<string, string>,
  ): PaymentWebhookResult {
    const secret = getString(ctx.config, 'webhookSecret');
    const signature = headers['stripe-signature'];
    if (!secret || !signature || !verifyStripeSignature(rawBody, signature, secret)) {
      return { verified: false };
    }
    const event = JSON.parse(rawBody) as {
      type: string;
      data: { object: { id: string; client_reference_id?: string; metadata?: { reference?: string } } };
    };
    const object = event.data.object;
    return {
      verified: true,
      eventType: event.type,
      paymentId: object.id,
      ...(object.client_reference_id ?? object.metadata?.reference
        ? { reference: object.client_reference_id ?? object.metadata?.reference }
        : {}),
      data: event,
    };
  }
}

export const stripe = new StripeProvider();
export { verifyStripeSignature };
