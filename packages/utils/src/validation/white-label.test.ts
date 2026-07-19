import { describe, expect, it } from 'vitest';

import {
  createBrandAssetSchema,
  createBrandSchema,
  createDomainSchema,
  createMessageTemplateSchema,
  hexColorSchema,
  updateBrandSchema,
  upsertBrandThemeSchema,
  upsertLegalDocumentSchema,
} from './white-label';

describe('hexColorSchema', () => {
  it('accepts valid hex and rejects invalid', () => {
    expect(hexColorSchema.safeParse('#4F46E5').success).toBe(true);
    expect(hexColorSchema.safeParse('4F46E5').success).toBe(false);
  });
});

describe('createBrandSchema', () => {
  it('requires a name', () => {
    expect(createBrandSchema.safeParse({}).success).toBe(false);
    expect(createBrandSchema.safeParse({ name: 'Acme' }).success).toBe(true);
  });
  it('validates optional colors', () => {
    expect(createBrandSchema.safeParse({ name: 'Acme', primaryColor: 'red' }).success).toBe(false);
    expect(createBrandSchema.safeParse({ name: 'Acme', primaryColor: '#123456' }).success).toBe(true);
  });
  it('update schema is fully partial', () => {
    expect(updateBrandSchema.safeParse({}).success).toBe(true);
  });
});

describe('upsertBrandThemeSchema', () => {
  it('accepts LIGHT/DARK only', () => {
    expect(upsertBrandThemeSchema.safeParse({ mode: 'LIGHT' }).success).toBe(true);
    expect(upsertBrandThemeSchema.safeParse({ mode: 'SYSTEM' }).success).toBe(false);
  });
});

describe('createMessageTemplateSchema', () => {
  it('requires a subject for email templates', () => {
    const noSubject = createMessageTemplateSchema.safeParse({
      channel: 'EMAIL',
      type: 'BOOKING_CONFIRMATION',
      name: 'Confirm',
      bodyText: 'Hello',
    });
    expect(noSubject.success).toBe(false);
  });
  it('allows SMS templates without a subject', () => {
    const sms = createMessageTemplateSchema.safeParse({
      channel: 'SMS',
      type: 'BOOKING_REMINDER',
      name: 'Reminder',
      bodyText: 'See you soon',
    });
    expect(sms.success).toBe(true);
  });
});

describe('createDomainSchema', () => {
  it('requires a hostname for custom domains', () => {
    expect(createDomainSchema.safeParse({ kind: 'CUSTOM' }).success).toBe(false);
    expect(createDomainSchema.safeParse({ kind: 'CUSTOM', hostname: 'book.acme.com' }).success).toBe(true);
  });
  it('requires a subdomain label for subdomains', () => {
    expect(createDomainSchema.safeParse({ kind: 'SUBDOMAIN' }).success).toBe(false);
    expect(createDomainSchema.safeParse({ kind: 'SUBDOMAIN', subdomain: 'acme' }).success).toBe(true);
  });
  it('rejects malformed hostnames', () => {
    expect(createDomainSchema.safeParse({ kind: 'CUSTOM', hostname: 'not a domain' }).success).toBe(false);
  });
});

describe('upsertLegalDocumentSchema', () => {
  it('validates type and content', () => {
    expect(
      upsertLegalDocumentSchema.safeParse({ type: 'PRIVACY_POLICY', title: 'Privacy', content: 'x' }).success,
    ).toBe(true);
    expect(upsertLegalDocumentSchema.safeParse({ type: 'UNKNOWN', title: 'x', content: 'y' }).success).toBe(false);
  });
});

describe('createBrandAssetSchema', () => {
  it('requires a valid url and type', () => {
    expect(
      createBrandAssetSchema.safeParse({ type: 'LOGO', name: 'Logo', url: 'https://x.com/a.svg' }).success,
    ).toBe(true);
    expect(createBrandAssetSchema.safeParse({ type: 'LOGO', name: 'Logo', url: 'not-a-url' }).success).toBe(false);
  });
});
