import { Injectable, type PipeTransform } from '@nestjs/common';

/** Remove ASCII control characters (except tab/newline/carriage return). */
function stripControlChars(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

/** Neutralize obvious XSS vectors in free-text: script/style blocks + tags. */
function stripHtml(value: string): string {
  return value
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

export function sanitizeString(value: string): string {
  return stripHtml(stripControlChars(value)).trim();
}

/** Recursively sanitize all string values in a JSON-like structure. */
export function sanitizeDeep<T>(value: T): T {
  if (typeof value === 'string') return sanitizeString(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => sanitizeDeep(v)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = sanitizeDeep(val);
    }
    return out as T;
  }
  return value;
}

/**
 * Global pipe that sanitizes incoming request payloads before validation.
 * Defense-in-depth against stored XSS; runs ahead of route-level Zod pipes.
 */
@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    return sanitizeDeep(value);
  }
}
