/**
 * Deterministic, URL-safe slugification used for org handles, event-type
 * links, etc. Kept dependency-free and Unicode-aware.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '') // trim hyphens
    .replace(/-{2,}/g, '-'); // collapse repeats
}

const RANDOM_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Append a short random suffix to guarantee uniqueness when a base slug
 * already exists. Uses the platform CSPRNG when available.
 */
export function slugWithSuffix(base: string, length = 6): string {
  const normalized = slugify(base) || 'item';
  let suffix = '';
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(length);
    cryptoObj.getRandomValues(bytes);
    for (const byte of bytes) {
      suffix += RANDOM_ALPHABET[byte % RANDOM_ALPHABET.length];
    }
  } else {
    for (let i = 0; i < length; i += 1) {
      suffix += RANDOM_ALPHABET[Math.floor(Math.random() * RANDOM_ALPHABET.length)];
    }
  }
  return `${normalized}-${suffix}`;
}
