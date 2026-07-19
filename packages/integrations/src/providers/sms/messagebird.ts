/**
 * MessageBird (Bird) SMS provider (API access key).
 * https://developers.messagebird.com/api/sms-messaging/
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  IntegrationError,
  IntegrationErrorKind,
  getString,
  requireString,
  type DeliveryResult,
  type HealthCheckResult,
  type ProviderRuntimeContext,
  type SmsMessage,
  type SmsProvider,
} from '../../core';

const API = 'https://rest.messagebird.com';

function auth(ctx: ProviderRuntimeContext): Record<string, string> {
  return { Authorization: `AccessKey ${requireString(ctx.credentials, 'accessKey')}` };
}

class MessageBirdProvider implements SmsProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'messagebird',
    name: 'MessageBird',
    category: 'SMS',
    authType: 'API_KEY',
    description: 'Send SMS notifications via MessageBird.',
    docsUrl: 'https://developers.messagebird.com/',
    supportsInboundWebhooks: true,
    credentialFields: [{ key: 'accessKey', label: 'Access key', type: 'secret', required: true }],
    configFields: [
      { key: 'from', label: 'Originator (name or number)', type: 'string', required: true },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    await ctx.http.get(`${API}/balance`, { headers: auth(ctx), retry: { maxAttempts: 2 } });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async sendSms(ctx: ProviderRuntimeContext, message: SmsMessage): Promise<DeliveryResult> {
    const originator = message.from ?? getString(ctx.config, 'from');
    if (!originator) {
      throw new IntegrationError('MessageBird requires an originator.', {
        kind: IntegrationErrorKind.Config,
      });
    }
    const { data } = await ctx.http.post<{ id: string; recipients?: { totalCount?: number } }>(
      `${API}/messages`,
      { headers: auth(ctx), json: { originator, recipients: [message.to], body: message.body } },
    );
    return { externalId: data.id, accepted: data.recipients?.totalCount ?? 1, raw: data };
  }
}

export const messagebird = new MessageBirdProvider();
