/**
 * Slack messaging provider using a bot token (chat.postMessage). Lets the
 * platform post booking notifications to any channel the bot is in.
 * https://api.slack.com/methods/chat.postMessage
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  IntegrationError,
  IntegrationErrorKind,
  bearerAuth,
  getString,
  type ChatMessage,
  type DeliveryResult,
  type ExternalAccount,
  type HealthCheckResult,
  type MessagingProvider,
  type ProviderRuntimeContext,
} from '../../core';

const API = 'https://slack.com/api';

interface SlackResponse {
  ok: boolean;
  error?: string;
  ts?: string;
  channel?: string;
  team?: string;
  user?: string;
  bot_id?: string;
}

class SlackProvider implements MessagingProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'slack',
    name: 'Slack',
    category: 'MESSAGING',
    authType: 'API_KEY',
    description: 'Post booking notifications to Slack channels via a bot token.',
    docsUrl: 'https://api.slack.com/methods/chat.postMessage',
    supportsInboundWebhooks: true,
    credentialFields: [
      { key: 'botToken', label: 'Bot token', type: 'secret', required: true, placeholder: 'xoxb-…' },
    ],
    configFields: [
      { key: 'defaultChannel', label: 'Default channel', type: 'string', required: true, placeholder: '#bookings' },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    const { data } = await ctx.http.post<SlackResponse>(`${API}/auth.test`, {
      headers: bearerAuth(ctx.credentials, 'botToken'),
      retry: { maxAttempts: 2 },
    });
    if (!data.ok) return { healthy: false, message: data.error ?? 'auth.test failed' };
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async fetchAccount(ctx: ProviderRuntimeContext): Promise<ExternalAccount> {
    const { data } = await ctx.http.post<SlackResponse>(`${API}/auth.test`, {
      headers: bearerAuth(ctx.credentials, 'botToken'),
    });
    return { id: data.team ?? data.bot_id ?? 'slack', ...(data.user ? { name: data.user } : {}) };
  }

  async sendMessage(ctx: ProviderRuntimeContext, message: ChatMessage): Promise<DeliveryResult> {
    const channel = message.channel ?? getString(ctx.config, 'defaultChannel');
    if (!channel) {
      throw new IntegrationError('Slack requires a channel (message or default config).', {
        kind: IntegrationErrorKind.Config,
      });
    }
    const { data } = await ctx.http.post<SlackResponse>(`${API}/chat.postMessage`, {
      headers: bearerAuth(ctx.credentials, 'botToken'),
      json: {
        channel,
        text: message.title ? `*${message.title}*\n${message.text}` : message.text,
        ...(message.rich ? { blocks: message.rich } : {}),
      },
    });
    if (!data.ok) {
      throw new IntegrationError(`Slack chat.postMessage failed: ${data.error}`, {
        kind: data.error === 'invalid_auth' ? IntegrationErrorKind.Auth : IntegrationErrorKind.Provider,
      });
    }
    return { externalId: data.ts, accepted: 1, raw: data };
  }
}

export const slack = new SlackProvider();
