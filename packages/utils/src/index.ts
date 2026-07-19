/**
 * @invincible/utils — framework-free utilities shared across the platform:
 * datetime/timezone helpers, slugging, error/result primitives, Zod
 * validation schemas, and the availability/scheduling engine.
 *
 * Everything is re-exported flat from the root for broad compatibility with
 * CommonJS consumers (e.g. the NestJS API), and also namespaced for callers
 * that prefer `validation.*` / `scheduling.*` access.
 */

export * from './datetime';
export * from './errors';
export * from './result';
export * from './slug';
export * from './validation';
export * from './scheduling';
export * from './billing';

export * as validation from './validation';
export * as scheduling from './scheduling';
export * as billing from './billing';
