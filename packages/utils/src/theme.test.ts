import { describe, expect, it } from 'vitest';

import {
  adjustLightness,
  buildThemeTokens,
  contrastRatio,
  hexToRgb,
  isHexColor,
  normalizeHexColor,
  readableForeground,
  relativeLuminance,
  rgbToHex,
  themeTokensToCss,
} from './theme';

describe('hex color validation', () => {
  it('accepts 3- and 6-digit hex', () => {
    expect(isHexColor('#fff')).toBe(true);
    expect(isHexColor('#4F46E5')).toBe(true);
  });
  it('rejects invalid values', () => {
    expect(isHexColor('4F46E5')).toBe(false);
    expect(isHexColor('#12345')).toBe(false);
    expect(isHexColor('#zzzzzz')).toBe(false);
  });
});

describe('normalizeHexColor', () => {
  it('expands shorthand and uppercases', () => {
    expect(normalizeHexColor('#abc')).toBe('#AABBCC');
    expect(normalizeHexColor('#4f46e5')).toBe('#4F46E5');
  });
  it('throws on invalid input', () => {
    expect(() => normalizeHexColor('nope')).toThrow();
  });
});

describe('rgb conversion', () => {
  it('round-trips hex <-> rgb', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(rgbToHex({ r: 0, g: 128, b: 255 })).toBe('#0080FF');
  });
  it('clamps out-of-range channels', () => {
    expect(rgbToHex({ r: 300, g: -20, b: 128 })).toBe('#FF0080');
  });
});

describe('luminance & contrast', () => {
  it('white is brighter than black', () => {
    expect(relativeLuminance('#FFFFFF')).toBeGreaterThan(relativeLuminance('#000000'));
  });
  it('black/white contrast is maximal', () => {
    expect(Math.round(contrastRatio('#000000', '#FFFFFF'))).toBe(21);
  });
  it('picks a readable foreground', () => {
    expect(readableForeground('#FFFFFF')).toBe('#000000');
    expect(readableForeground('#0B1120')).toBe('#FFFFFF');
  });
});

describe('adjustLightness', () => {
  it('lightens toward white and darkens toward black', () => {
    expect(adjustLightness('#808080', 1)).toBe('#FFFFFF');
    expect(adjustLightness('#808080', -1)).toBe('#000000');
  });
});

describe('buildThemeTokens', () => {
  const brand = { primaryColor: '#4F46E5', accentColor: '#06B6D4' };

  it('derives a light token set', () => {
    const tokens = buildThemeTokens('LIGHT', brand);
    expect(tokens.background).toBe('#FFFFFF');
    expect(tokens.primary).toBe('#4F46E5');
    expect(tokens.primaryForeground).toBe('#FFFFFF');
    expect(tokens.radius).toBe('0.5rem');
  });

  it('derives a dark token set with a dark background', () => {
    const tokens = buildThemeTokens('DARK', brand);
    expect(tokens.background).toBe('#0B1120');
    expect(tokens.foreground).toBe('#F8FAFC');
  });

  it('honors explicit background/foreground overrides', () => {
    const tokens = buildThemeTokens('LIGHT', { ...brand, backgroundColor: '#faf5ff', foregroundColor: '#111827' });
    expect(tokens.background).toBe('#FAF5FF');
    expect(tokens.foreground).toBe('#111827');
  });
});

describe('themeTokensToCss', () => {
  it('serializes tokens to CSS custom properties', () => {
    const css = themeTokensToCss({ primaryForeground: '#FFFFFF', radius: '0.5rem' }, ':root');
    expect(css).toContain(':root {');
    expect(css).toContain('--primary-foreground: #FFFFFF;');
    expect(css).toContain('--radius: 0.5rem;');
  });
});
