/**
 * Microsoft Teams messaging provider using an Incoming Webhook connector.
 * Posts an actionable MessageCard to the configured channel.
 * https://learn.microsoft.com/microsoftteams/platform/webhooks-and-connectors/
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  requireString,
  type ChatMessage,
  type DeliveryResult,
  type HealthCheckResult,
  type MessagingProvider,
  type ProviderRuntimeContext,
} from '../../core';

class MicrosoftTeamsMessagingProvider implements MessagingProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'microsoft_teams_chat',
    name: 'Microsoft Teams (Chat)',
    category: 'MESSAGING',
    authType: 'WEBHOOK',
    description: 'Post booking notifications to a Teams channel via an Incoming Webhook.',
    docsUrl:
      'https://learn.microsoft.com/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook',
    supportsInboundWebhooks: false,
    configFields: [
      { key: 'webhookUrl', label: 'Incoming Webhook URL', type: 'secret', required: true },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const url = requireString(ctx.config, 'webhookUrl');
    return URL.canParse(url)
      ? { healthy: true, message: 'Webhook configured.' }
      : { healthy: false, message: 'Invalid webhook URL.' };
  }

  async sendMessage(ctx: ProviderRuntimeContext, message: ChatMessage): Promise<DeliveryResult> {
    const url = requireString(ctx.config, 'webhookUrl');
    const { status } = await ctx.http.post(url, {
      json: {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: message.title ?? 'Notification',
        themeColor: '4F46E5',
        title: message.title,
        text: message.text,
      },
      parse: 'text',
    });
    return { accepted: 1, raw: { status } };
  }
}

export const microsoftTeamsChat = new MicrosoftTeamsMessagingProvider();
