# INVINCIBLE PROS — Documentation

Central index for platform documentation.

## Product

- [Feature Catalog](./product/feature-catalog.md) — every capability, grouped by
  domain, with delivery status.
- [Persona → Feature Matrix](./product/persona-matrix.md) — who we serve and what
  each audience needs.
- [Delivery Roadmap](./product/roadmap.md) — phased build sequence.

## API

- [API Reference](./api/README.md) — REST + GraphQL, auth (JWT/refresh/API keys),
  rate limiting, idempotency, errors, pagination, webhooks, jobs, observability,
  OpenAPI/SDK generation.
- [Billing & Subscriptions](./billing.md) — plans, entitlements, proration, tax
  (GST/VAT), discounts, dunning, gateways, and analytics.

## Engineering

- [Root README](../README.md) — architecture, stack, local setup, scripts.
- [Project conventions](../.kiro/steering/project-conventions.md) — coding and
  workflow standards.

## Conventions for these docs

- The **Feature Catalog is the source of truth for scope.** When a feature ships,
  flip its status badge (✅/🟡/📋) and reference the change.
- Keep the roadmap and catalog statuses in sync.
