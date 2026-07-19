/**
 * Shared implementation for automation providers (Zapier, Make, n8n). Each is a
 * thin wrapper that POSTs platform events to a user-configured "catch" webhook
 * URL. Optional static headers (e.g. an n8n auth header) are supported.
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  getString,
  requireString,
  type AutomationEvent,
  type AutomationProvider,
  type DeliveryResult,
  type HealthCheckResult,
  type ProviderRuntimeContext,
} from '../../core';

export function createWebhookAutomationProvider(
  descriptor: ProviderDescriptor,
): AutomationProvider {
  return {
    descriptor,

    async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
      // We cannot reliably GET a catch-hook URL, so validate configuration and
      // confirm the URL is well-formed.
      const url = requireString(ctx.config, 'webhookUrl');
      if (!URL.canParse(url)) {
        return { healthy: false, message: 'Configured webhook URL is not a valid URL.' };
      }
      return { healthy: true, message: 'Webhook target configured.' };
    },

    async emit(ctx: ProviderRuntimeContext, event: AutomationEvent): Promise<DeliveryResult> {
      const url = requireString(ctx.config, 'webhookUrl');
      const authHeader = getString(ctx.config, 'authHeader');
      const { status } = await ctx.http.post(url, {
        headers: authHeader ? { Authorization: authHeader } : {},
        json: {
          event: event.event,
          payload: event.payload,
          occurredAt: event.occurredAt ?? new Date().toISOString(),
          source: 'invincible-pros',
        },
        parse: 'none',
      });
      return { accepted: 1, raw: { status } };
    },
  };
}
