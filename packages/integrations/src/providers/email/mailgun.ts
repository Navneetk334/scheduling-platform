/**
 * Mailgun email provider (API key + domain, HTTP Basic auth as "api").
 * https://documentation.mailgun.com/en/latest/api-sending.html
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  basicAuth,
  getString,
  requireString,
  type DeliveryResult,
  type EmailMessage,
  type EmailProvider,
  type HealthCheckResult,
  type ProviderRuntimeContext,
} from '../../core';

function apiBase(ctx: ProviderRuntimeContext): string {
  return getString(ctx.config, 'region') === 'eu'
    ? 'https://api.eu.mailgun.net'
    : 'https://api.mailgun.net';
}

function formatAddress(a: { email: string; name?: string }): string {
  return a.name ? `${a.name} <${a.email}>` : a.email;
}

class MailgunProvider implements EmailProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'mailgun',
    name: 'Mailgun',
    category: 'EMAIL',
    authType: 'API_KEY',
    description: 'Send transactional booking emails through Mailgun.',
    docsUrl: 'https://documentation.mailgun.com/',
    supportsInboundWebhooks: true,
    credentialFields: [{ key: 'apiKey', label: 'API key', type: 'secret', required: true }],
    configFields: [
      { key: 'domain', label: 'Sending domain', type: 'string', required: true, placeholder: 'mg.example.com' },
      {
        key: 'region',
        label: 'Region',
        type: 'select',
        required: false,
        options: [
          { label: 'US', value: 'us' },
          { label: 'EU', value: 'eu' },
        ],
      },
      { key: 'from', label: 'Default from address', type: 'string', required: false },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    const domain = requireString(ctx.config, 'domain');
    await ctx.http.get(`${apiBase(ctx)}/v3/${encodeURIComponent(domain)}/stats/total`, {
      headers: basicAuth('api', requireString(ctx.credentials, 'apiKey')),
      query: { event: 'delivered' },
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async sendEmail(ctx: ProviderRuntimeContext, message: EmailMessage): Promise<DeliveryResult> {
    const domain = requireString(ctx.config, 'domain');
    const from = message.from ? formatAddress(message.from) : getString(ctx.config, 'from');
    const form: Record<string, string> = {
      from: from ?? `no-reply@${domain}`,
      to: message.to.map(formatAddress).join(','),
      subject: message.subject,
    };
    if (message.html) form['html'] = message.html;
    if (message.text) form['text'] = message.text;
    if (message.cc?.length) form['cc'] = message.cc.map(formatAddress).join(',');
    if (message.bcc?.length) form['bcc'] = message.bcc.map(formatAddress).join(',');
    if (message.replyTo) form['h:Reply-To'] = message.replyTo;

    const { data } = await ctx.http.post<{ id: string; message: string }>(
      `${apiBase(ctx)}/v3/${encodeURIComponent(domain)}/messages`,
      { headers: basicAuth('api', requireString(ctx.credentials, 'apiKey')), form },
    );
    return { externalId: data.id, accepted: message.to.length, raw: data };
  }
}

export const mailgun = new MailgunProvider();
