import { describe, expect, it } from 'vitest';

import { slugWithSuffix, slugify } from './slug';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Invincible Pros Team')).toBe('invincible-pros-team');
  });
  it('strips diacritics and punctuation', () => {
    expect(slugify('Café & Crème!!')).toBe('cafe-creme');
  });
  it('collapses repeated separators and trims', () => {
    expect(slugify('  --Hello___World--  ')).toBe('hello-world');
  });
});

describe('slugWithSuffix', () => {
  it('produces a base + suffix of expected shape', () => {
    const result = slugWithSuffix('My Event', 6);
    expect(result).toMatch(/^my-event-[a-z0-9]{6}$/);
  });
  it('falls back to "item" for empty base', () => {
    expect(slugWithSuffix('!!!')).toMatch(/^item-[a-z0-9]{6}$/);
  });
});
