/**
 * @invincible/integrations — a framework-free, extensible provider integration
 * framework for the scheduling platform.
 *
 * It ships:
 *  - A plugin model (one capability interface per category) + a registry.
 *  - Cross-cutting primitives: an HTTP client with retry/backoff, an OAuth 2.0
 *    client, credential encryption (AES-256-GCM) and webhook HMAC signing.
 *  - Built-in adapters for calendar, video, payment, email, SMS, CRM,
 *    automation and messaging providers.
 *
 * The NestJS API layer (apps/api) wires these adapters to persistence, OAuth
 * callbacks, webhook endpoints, integration logs, health monitoring and
 * background sync.
 */

export * from './core';
export * from './providers';
