/**
 * Twilio SMS provider (Account SID + Auth Token, HTTP Basic auth).
 * https://www.twilio.com/docs/sms/api
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  IntegrationError,
  IntegrationErrorKind,
  basicAuth,
  getString,
  requireString,
  type DeliveryResult,
  type ExternalAccount,
  type HealthCheckResult,
  type ProviderRuntimeContext,
  type SmsMessage,
  type SmsProvider,
} from '../../core';

const API = 'https://api.twilio.com/2010-04-01';

function auth(ctx: ProviderRuntimeContext): Record<string, string> {
  return basicAuth(
    requireString(ctx.credentials, 'accountSid'),
    requireString(ctx.credentials, 'authToken'),
  );
}

class TwilioProvider implements SmsProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'twilio',
    name: 'Twilio',
    category: 'SMS',
    authType: 'API_KEY',
    description: 'Send SMS booking reminders and confirmations via Twilio.',
    docsUrl: 'https://www.twilio.com/docs/sms',
    supportsInboundWebhooks: true,
    credentialFields: [
      { key: 'accountSid', label: 'Account SID', type: 'string', required: true, placeholder: 'AC…' },
      { key: 'authToken', label: 'Auth token', type: 'secret', required: true },
    ],
    configFields: [
      { key: 'from', label: 'From number / Messaging Service SID', type: 'string', required: true },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    const sid = requireString(ctx.credentials, 'accountSid');
    await ctx.http.get(`${API}/Accounts/${sid}.json`, {
      headers: auth(ctx),
      retry: { maxAttempts: 2 },
    });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async fetchAccount(ctx: ProviderRuntimeContext): Promise<ExternalAccount> {
    return { id: requireString(ctx.credentials, 'accountSid') };
  }

  async sendSms(ctx: ProviderRuntimeContext, message: SmsMessage): Promise<DeliveryResult> {
    const sid = requireString(ctx.credentials, 'accountSid');
    const from = message.from ?? getString(ctx.config, 'from');
    if (!from) {
      throw new IntegrationError('Twilio requires a "from" number or Messaging Service SID.', {
        kind: IntegrationErrorKind.Config,
      });
    }
    const form: Record<string, string> = { To: message.to, Body: message.body };
    if (from.startsWith('MG')) form['MessagingServiceSid'] = from;
    else form['From'] = from;

    const { data } = await ctx.http.post<{ sid: string; status: string }>(
      `${API}/Accounts/${sid}/Messages.json`,
      { headers: auth(ctx), form },
    );
    return { externalId: data.sid, accepted: 1, raw: data };
  }
}

export const twilio = new TwilioProvider();
