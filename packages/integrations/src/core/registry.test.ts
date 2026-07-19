import { describe, expect, it } from 'vitest';

import { createDefaultRegistry } from '../providers';

import type { BaseProvider } from './provider';
import { ProviderRegistry } from './registry';

function fakeProvider(id: string, category: 'CALENDAR' | 'EMAIL'): BaseProvider {
  return {
    descriptor: {
      id,
      name: id,
      category,
      authType: 'API_KEY',
      description: '',
      supportsInboundWebhooks: false,
    },
    async healthCheck() {
      return { healthy: true };
    },
  };
}

describe('ProviderRegistry', () => {
  it('registers and retrieves providers', () => {
    const registry = new ProviderRegistry();
    const provider = fakeProvider('x', 'EMAIL');
    registry.register(provider);
    expect(registry.has('x')).toBe(true);
    expect(registry.get('x')).toBe(provider);
    expect(registry.find('nope')).toBeUndefined();
  });

  it('throws on duplicate registration', () => {
    const registry = new ProviderRegistry();
    registry.register(fakeProvider('dup', 'EMAIL'));
    expect(() => registry.register(fakeProvider('dup', 'EMAIL'))).toThrow(/already registered/);
  });

  it('throws when getting an unknown provider', () => {
    expect(() => new ProviderRegistry().get('ghost')).toThrow(/Unknown integration provider/);
  });

  it('filters by category', () => {
    const registry = new ProviderRegistry().registerAll([
      fakeProvider('a', 'EMAIL'),
      fakeProvider('b', 'CALENDAR'),
    ]);
    expect(registry.listByCategory('EMAIL').map((p) => p.descriptor.id)).toEqual(['a']);
  });
});

describe('default registry', () => {
  it('contains all expected providers with unique ids', () => {
    const registry = createDefaultRegistry();
    const ids = registry.list().map((p) => p.descriptor.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of [
      'google_calendar',
      'microsoft_outlook',
      'apple_calendar',
      'google_meet',
      'zoom',
      'microsoft_teams_video',
      'stripe',
      'razorpay',
      'paypal',
      'resend',
      'smtp',
      'mailgun',
      'twilio',
      'messagebird',
      'hubspot',
      'salesforce',
      'zoho_crm',
      'pipedrive',
      'zapier',
      'make',
      'n8n',
      'slack',
      'microsoft_teams_chat',
      'discord',
    ]) {
      expect(registry.has(id)).toBe(true);
    }
  });

  it('every provider exposes a well-formed descriptor', () => {
    for (const provider of createDefaultRegistry().list()) {
      expect(provider.descriptor.id).toMatch(/^[a-z0-9_]+$/);
      expect(provider.descriptor.category).toBeTruthy();
      expect(typeof provider.healthCheck).toBe('function');
    }
  });
});
