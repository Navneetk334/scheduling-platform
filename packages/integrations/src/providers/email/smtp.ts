/**
 * Generic SMTP email provider. Works with any SMTP server (Gmail, SES SMTP,
 * Postmark, self-hosted, ...) using the built-in {@link sendSmtpMail} client.
 */

import type { ProviderDescriptor } from '@invincible/types';

import {
  IntegrationError,
  IntegrationErrorKind,
  getBoolean,
  getNumber,
  getString,
  requireString,
  type DeliveryResult,
  type EmailMessage,
  type EmailProvider,
  type HealthCheckResult,
  type ProviderRuntimeContext,
} from '../../core';

import { sendSmtpMail, verifySmtpConnection, type SmtpConfig } from './smtp-client';

function resolveConfig(ctx: ProviderRuntimeContext): SmtpConfig {
  const port = getNumber(ctx.config, 'port') ?? 587;
  return {
    host: requireString(ctx.config, 'host'),
    port,
    secure: getBoolean(ctx.config, 'secure') ?? port === 465,
    username: requireString(ctx.credentials, 'username'),
    password: requireString(ctx.credentials, 'password'),
  };
}

class SmtpProvider implements EmailProvider {
  readonly descriptor: ProviderDescriptor = {
    id: 'smtp',
    name: 'SMTP',
    category: 'EMAIL',
    authType: 'SMTP',
    description: 'Send booking emails through any SMTP server.',
    supportsInboundWebhooks: false,
    credentialFields: [
      { key: 'username', label: 'SMTP username', type: 'string', required: true },
      { key: 'password', label: 'SMTP password', type: 'secret', required: true },
    ],
    configFields: [
      { key: 'host', label: 'Host', type: 'string', required: true, placeholder: 'smtp.example.com' },
      { key: 'port', label: 'Port', type: 'number', required: false, placeholder: '587' },
      { key: 'secure', label: 'Use implicit TLS (port 465)', type: 'boolean', required: false },
      { key: 'from', label: 'Default from address', type: 'string', required: true },
      { key: 'fromName', label: 'From display name', type: 'string', required: false },
    ],
  };

  async healthCheck(ctx: ProviderRuntimeContext): Promise<HealthCheckResult> {
    const started = Date.now();
    try {
      await verifySmtpConnection(resolveConfig(ctx));
      return { healthy: true, latencyMs: Date.now() - started };
    } catch (error) {
      return { healthy: false, message: (error as Error).message };
    }
  }

  async sendEmail(ctx: ProviderRuntimeContext, message: EmailMessage): Promise<DeliveryResult> {
    const from = message.from?.email ?? getString(ctx.config, 'from');
    if (!from) {
      throw new IntegrationError('SMTP requires a "from" address (message or config).', {
        kind: IntegrationErrorKind.Config,
      });
    }
    const fromName = message.from?.name ?? getString(ctx.config, 'fromName');
    const result = await sendSmtpMail(resolveConfig(ctx), {
      from,
      ...(fromName ? { fromName } : {}),
      to: message.to.map((a) => a.email),
      ...(message.cc?.length ? { cc: message.cc.map((a) => a.email) } : {}),
      ...(message.bcc?.length ? { bcc: message.bcc.map((a) => a.email) } : {}),
      subject: message.subject,
      ...(message.html ? { html: message.html } : {}),
      ...(message.text ? { text: message.text } : {}),
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    });
    return { accepted: message.to.length, raw: result };
  }
}

export const smtp = new SmtpProvider();
