/**
 * Resend email provider (API key). https://resend.com/docs/api-reference
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  IntegrationError,
  IntegrationErrorKind,
  bearerAuth,
  getString,
  type DeliveryResult,
  type EmailMessage,
  type EmailProvider,
  type HealthCheckResult,
  type ProviderRuntimeContext,
} from '../../core';

const API = 'https://api.resend.com';

function formatAddress(a: { email: string; name?: string }): string {
  return a.name ? `${a.name} <${a.email}>` : a.email;
}

class ResendProvider implements EmailProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'resend',
    name: 'Resend',
    category: 'EMAIL',
    authType: 'API_KEY',
    description: 'Send transactional booking emails through Resend.',
    docsUrl: 'https://resend.com/docs',
    supportsInboundWebhooks: true,
    credentialFields: [
      { key: 'apiKey', label: 'API key', type: 'secret', required: true, placeholder: 're_…' },
    ],
    configFields: [
      { key: 'from', label: 'Default from address', type: 'string', required: false },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(`${API}/domains`, {
      headers: bearerAuth(ctx.credentials, 'apiKey'),
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async sendEmail(ctx: ProviderRuntimeContext, message: EmailMessage): Promise<DeliveryResult> {
    const configuredFrom = getString(ctx.config, 'from');
    const from = message.from ?? (configuredFrom ? { email: configuredFrom } : undefined);
    if (!from) {
      throw new IntegrationError('Resend requires a "from" address (message or config).', {
        kind: IntegrationErrorKind.Config,
      });
    }
    const { data } = await ctx.http.post<{ id: string }>(`${API}/emails`, {
      headers: bearerAuth(ctx.credentials, 'apiKey'),
      json: {
        from: formatAddress(from),
        to: message.to.map(formatAddress),
        subject: message.subject,
        html: message.html,
        text: message.text,
        reply_to: message.replyTo,
        cc: message.cc?.map(formatAddress),
        bcc: message.bcc?.map(formatAddress),
      },
    });
    return { externalId: data.id, accepted: message.to.length, raw: data };
  }
}

export const resend = new ResendProvider();
