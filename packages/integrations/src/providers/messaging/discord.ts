/**
 * Discord messaging provider using a channel Webhook URL.
 * https://discord.com/developers/docs/resources/webhook#execute-webhook
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  getString,
  requireString,
  type ChatMessage,
  type DeliveryResult,
  type HealthCheckResult,
  type MessagingProvider,
  type ProviderRuntimeContext,
} from '../../core';

class DiscordProvider implements MessagingProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'discord',
    name: 'Discord',
    category: 'MESSAGING',
    authType: 'WEBHOOK',
    description: 'Post booking notifications to a Discord channel via a webhook.',
    docsUrl: 'https://discord.com/developers/docs/resources/webhook',
    supportsInboundWebhooks: false,
    configFields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'secret', required: true },
      { key: 'username', label: 'Override username', type: 'string', required: false },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const url = requireString(ctx.config, 'webhookUrl');
    const started = Date.now();
    // Discord webhooks support GET for metadata.
    await ctx.http.get(url, { retry: { maxAttempts: 2 } });
    return { healthy: true, latencyMs: Date.now() - started };
  }

  async sendMessage(ctx: ProviderRuntimeContext, message: ChatMessage): Promise<DeliveryResult> {
    const url = requireString(ctx.config, 'webhookUrl');
    const username = getString(ctx.config, 'username');
    const content = message.title ? `**${message.title}**\n${message.text}` : message.text;
    const { status } = await ctx.http.post(url, {
      query: { wait: true },
      json: { content, ...(username ? { username } : {}), ...(message.rich ? { embeds: message.rich } : {}) },
      parse: 'none',
    });
    return { accepted: 1, raw: { status } };
  }
}

export const discord = new DiscordProvider();
