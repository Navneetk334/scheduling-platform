/**
 * Cryptographic helpers for the integration framework:
 *  - {@link SecretBox}: authenticated symmetric encryption (AES-256-GCM) for
 *    credentials at rest.
 *  - {@link signPayload}/{@link verifySignature}: HMAC-SHA256 signing for
 *    outbound webhook payloads and inbound signature verification.
 *
 * Uses only Node's built-in `crypto` — no third-party dependencies.
 */

import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
} from 'node:crypto';

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12;
const VERSION = 'v1';

/**
 * Symmetric encryption box. The provided key material is hashed to a fixed
 * 32-byte key, so any sufficiently-long secret string is acceptable.
 */
export class SecretBox {
  private readonly key: Buffer;

  constructor(keyMaterial: string) {
    if (!keyMaterial || keyMaterial.length < 16) {
      throw new Error('SecretBox key material must be at least 16 characters.');
    }
    this.key = createHash('sha256').update(keyMaterial).digest();
  }

  /** Encrypt a UTF-8 string, returning `v1:<base64(iv|tag|ciphertext)>`. */
  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGO, this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${VERSION}:${Buffer.concat([iv, tag, ciphertext]).toString('base64')}`;
  }

  /** Decrypt a value produced by {@link encrypt}. Throws if tampered/invalid. */
  decrypt(payload: string): string {
    const [version, data] = payload.split(':');
    if (version !== VERSION || !data) {
      throw new Error('Unsupported or malformed ciphertext.');
    }
    const raw = Buffer.from(data, 'base64');
    const iv = raw.subarray(0, IV_BYTES);
    const tag = raw.subarray(IV_BYTES, IV_BYTES + 16);
    const ciphertext = raw.subarray(IV_BYTES + 16);
    const decipher = createDecipheriv(ALGO, this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }

  /** Encrypt an arbitrary JSON-serializable object. */
  encryptJson(value: unknown): string {
    return this.encrypt(JSON.stringify(value));
  }

  /** Decrypt into a typed object. */
  decryptJson<T>(payload: string): T {
    return JSON.parse(this.decrypt(payload)) as T;
  }
}

/** Compute an HMAC-SHA256 hex signature of `payload` using `secret`. */
export function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

/** Constant-time comparison of a candidate signature against the expected one. */
export function verifySignature(payload: string, secret: string, signature: string): boolean {
  const expected = signPayload(payload, secret);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Constant-time compare of two arbitrary hex/utf8 strings. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Generate a URL-safe random token (used for webhook signing secrets, state). */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** Generate a random UUID (v4). */
export function generateId(): string {
  return randomUUID();
}
