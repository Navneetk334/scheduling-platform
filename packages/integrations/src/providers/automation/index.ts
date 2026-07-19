import { createWebhookAutomationProvider } from './webhook-automation';

export const zapier = createWebhookAutomationProvider({
  id: 'zapier',
  name: 'Zapier',
  category: 'AUTOMATION',
  authType: 'WEBHOOK',
  description: 'Trigger Zaps from platform events via a Zapier Catch Hook URL.',
  docsUrl: 'https://zapier.com/apps/webhook/integrations',
  supportsInboundWebhooks: false,
  configFields: [
    {
      key: 'webhookUrl',
      label: 'Catch Hook URL',
      type: 'string',
      required: true,
      placeholder: 'https://hooks.zapier.com/hooks/catch/123/abc/',
    },
  ],
});

export const make = createWebhookAutomationProvider({
  id: 'make',
  name: 'Make',
  category: 'AUTOMATION',
  authType: 'WEBHOOK',
  description: 'Trigger Make scenarios from platform events via a custom webhook.',
  docsUrl: 'https://www.make.com/en/help/tools/webhooks',
  supportsInboundWebhooks: false,
  configFields: [
    {
      key: 'webhookUrl',
      label: 'Webhook URL',
      type: 'string',
      required: true,
      placeholder: 'https://hook.eu1.make.com/xxxxxxxx',
    },
  ],
});

export const n8n = createWebhookAutomationProvider({
  id: 'n8n',
  name: 'n8n',
  category: 'AUTOMATION',
  authType: 'WEBHOOK',
  description: 'Trigger n8n workflows from platform events via a webhook node.',
  docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/',
  supportsInboundWebhooks: false,
  configFields: [
    {
      key: 'webhookUrl',
      label: 'Webhook URL',
      type: 'string',
      required: true,
      placeholder: 'https://n8n.example.com/webhook/xxxx',
    },
    {
      key: 'authHeader',
      label: 'Authorization header (optional)',
      type: 'secret',
      required: false,
      help: 'Sent as the Authorization header if your webhook node requires auth.',
    },
  ],
});

export const automationProviders = [zapier, make, n8n];
