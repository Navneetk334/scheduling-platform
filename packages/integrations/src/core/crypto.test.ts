import { describe, expect, it } from 'vitest';

import { SecretBox, generateToken, signPayload, verifySignature } from './crypto';

describe('SecretBox', () => {
  const box = new SecretBox('a-sufficiently-long-encryption-key');

  it('round-trips a string through encrypt/decrypt', () => {
    const cipher = box.encrypt('hello world');
    expect(cipher.startsWith('v1:')).toBe(true);
    expect(cipher).not.toContain('hello world');
    expect(box.decrypt(cipher)).toBe('hello world');
  });

  it('round-trips JSON', () => {
    const value = { accessToken: 'abc', refreshToken: 'def', nested: { a: 1 } };
    const cipher = box.encryptJson(value);
    expect(box.decryptJson<typeof value>(cipher)).toEqual(value);
  });

  it('produces different ciphertext for the same plaintext (random IV)', () => {
    expect(box.encrypt('same')).not.toBe(box.encrypt('same'));
  });

  it('fails to decrypt tampered ciphertext', () => {
    const cipher = box.encrypt('secret');
    const tampered = `${cipher.slice(0, -2)}xx`;
    expect(() => box.decrypt(tampered)).toThrow();
  });

  it('rejects a decryption with the wrong key', () => {
    const cipher = box.encrypt('secret');
    const other = new SecretBox('a-different-encryption-key-value!!');
    expect(() => other.decrypt(cipher)).toThrow();
  });

  it('rejects short key material', () => {
    expect(() => new SecretBox('short')).toThrow();
  });
});

describe('webhook signatures', () => {
  it('verifies a matching signature and rejects a bad one', () => {
    const payload = JSON.stringify({ event: 'booking.created', id: 1 });
    const secret = generateToken();
    const sig = signPayload(payload, secret);
    expect(verifySignature(payload, secret, sig)).toBe(true);
    expect(verifySignature(payload, secret, `${sig.slice(0, -1)}0`)).toBe(false);
    expect(verifySignature(payload, 'wrong-secret', sig)).toBe(false);
  });
});
