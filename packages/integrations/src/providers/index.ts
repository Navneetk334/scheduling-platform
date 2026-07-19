import { ProviderRegistry, type BaseProvider } from '../core';

import { automationProviders } from './automation';
import { calendarProviders } from './calendar';
import { crmProviders } from './crm';
import { emailProviders } from './email';
import { messagingProviders } from './messaging';
import { paymentProviders } from './payment';
import { smsProviders } from './sms';
import { videoProviders } from './video';

export * from './calendar';
export * from './video';
export * from './payment';
export * from './email';
export * from './sms';
export * from './crm';
export * from './automation';
export * from './messaging';

/** Every built-in provider, in catalog order. */
export const allProviders: BaseProvider[] = [
  ...calendarProviders,
  ...videoProviders,
  ...paymentProviders,
  ...emailProviders,
  ...smsProviders,
  ...crmProviders,
  ...automationProviders,
  ...messagingProviders,
];

/**
 * Build a registry pre-populated with all built-in providers. Consumers can
 * `.register(...)` additional custom providers before use.
 */
export function createDefaultRegistry(): ProviderRegistry {
  return new ProviderRegistry().registerAll(allProviders);
}
