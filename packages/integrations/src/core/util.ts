/**
 * Small shared helpers used across provider adapters for reading credential /
 * config bags safely and building common auth headers.
 */

import { IntegrationError, IntegrationErrorKind } from './errors';
import type { Credentials } from './provider';

/** Read a required string field from a credential/config bag, or throw. */
export function requireString(bag: Record<string, unknown>, key: string): string {
  const value = bag[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new IntegrationError(`Missing required credential/config field "${key}".`, {
      kind: IntegrationErrorKind.Config,
    });
  }
  return value;
}

/** Read an optional string field. */
export function getString(bag: Record<string, unknown>, key: string): string | undefined {
  const value = bag[key];
  return typeof value === 'string' ? value : undefined;
}

/** Read an optional boolean field. */
export function getBoolean(bag: Record<string, unknown>, key: string): boolean | undefined {
  const value = bag[key];
  return typeof value === 'boolean' ? value : undefined;
}

/** Read an optional number field. */
export function getNumber(bag: Record<string, unknown>, key: string): number | undefined {
  const value = bag[key];
  return typeof value === 'number' ? value : undefined;
}

/** `Authorization: Bearer <token>` header from a credential access token. */
export function bearerAuth(creds: Credentials, key = 'accessToken'): Record<string, string> {
  return { Authorization: `Bearer ${requireString(creds, key)}` };
}

/** HTTP Basic auth header from a username/password pair. */
export function basicAuth(username: string, password: string): Record<string, string> {
  const encoded = Buffer.from(`${username}:${password}`).toString('base64');
  return { Authorization: `Basic ${encoded}` };
}
