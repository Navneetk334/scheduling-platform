/**
 * Framework-free color + theme utilities for the white-label system. Used to
 * validate brand colors, derive accessible foregrounds, and generate the
 * light/dark design-token sets that theme booking pages and dashboards.
 */

/** Matches #rgb or #rrggbb (case-insensitive). */
export const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value);
}

/** Normalize any valid hex color to a 6-digit uppercase form (`#RRGGBB`). */
export function normalizeHexColor(value: string): string {
  if (!isHexColor(value)) {
    throw new Error(`Invalid hex color: ${value}`);
  }
  let hex = value.slice(1);
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return `#${hex.toUpperCase()}`;
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(value: string): Rgb {
  const hex = normalizeHexColor(value).slice(1);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/** WCAG relative luminance (0–1) of a hex color. */
export function relativeLuminance(value: string): number {
  const { r, g, b } = hexToRgb(value);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio (1–21) between two hex colors. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Pick the most readable foreground (black/white) for a given background. */
export function readableForeground(background: string): '#000000' | '#FFFFFF' {
  return relativeLuminance(background) > 0.5 ? '#000000' : '#FFFFFF';
}

/** Lighten (amount > 0) or darken (amount < 0) a hex color; amount in [-1, 1]. */
export function adjustLightness(value: string, amount: number): string {
  const { r, g, b } = hexToRgb(value);
  const mix = (c: number) => (amount >= 0 ? c + (255 - c) * amount : c * (1 + amount));
  return rgbToHex({ r: mix(r), g: mix(g), b: mix(b) });
}

export type ThemeModeKey = 'LIGHT' | 'DARK';

export interface ThemeTokens {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  radius: string;
  [key: string]: string;
}

export interface BrandColorInput {
  primaryColor: string;
  accentColor: string;
  backgroundColor?: string;
  foregroundColor?: string;
  radius?: string;
}

/**
 * Derive a complete token set for a given mode from a brand's core colors.
 * Deterministic, so the same brand always renders identically.
 */
export function buildThemeTokens(mode: ThemeModeKey, brand: BrandColorInput): ThemeTokens {
  const primary = normalizeHexColor(brand.primaryColor);
  const accent = normalizeHexColor(brand.accentColor);
  const radius = brand.radius ?? '0.5rem';

  if (mode === 'DARK') {
    const background = brand.backgroundColor ? normalizeHexColor(brand.backgroundColor) : '#0B1120';
    const foreground = '#F8FAFC';
    return {
      background,
      foreground,
      primary,
      primaryForeground: readableForeground(primary),
      accent,
      accentForeground: readableForeground(accent),
      muted: adjustLightness(background, 0.08),
      mutedForeground: '#94A3B8',
      border: adjustLightness(background, 0.14),
      radius,
    };
  }

  const background = brand.backgroundColor ? normalizeHexColor(brand.backgroundColor) : '#FFFFFF';
  const foreground = brand.foregroundColor ? normalizeHexColor(brand.foregroundColor) : '#0F172A';
  return {
    background,
    foreground,
    primary,
    primaryForeground: readableForeground(primary),
    accent,
    accentForeground: readableForeground(accent),
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    border: '#E2E8F0',
    radius,
  };
}

/** Serialize theme tokens to a CSS custom-property block for injection. */
export function themeTokensToCss(tokens: Record<string, string>, selector = ':root'): string {
  const toVar = (k: string) => `--${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
  const body = Object.entries(tokens)
    .map(([k, v]) => `  ${toVar(k)}: ${v};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}
