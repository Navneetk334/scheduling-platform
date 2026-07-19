# INVINCIBLE PROS — Scheduling Platform

An enterprise-grade, multi-tenant scheduling SaaS. Organizations publish
availability and bookable event types; invitees book conflict-free time through
beautiful public booking pages. Built as an original product with a clean,
modular, production-ready architecture.

> Status: **Phase 1 foundation** — monorepo, shared packages, a fully-tested
> availability engine, the NestJS API (auth, organizations, schedules, event
> types, availability, bookings) and the Next.js web app (marketing, auth,
> dashboard, public booking flow).

---

## Tech stack

| Area          | Technology                                                        |
| ------------- | ----------------------------------------------------------------- |
| Monorepo      | pnpm workspaces + Turborepo                                       |
| Language      | TypeScript (strict) end-to-end                                    |
| Frontend      | Next.js 15 (App Router) · React 19 · Tailwind CSS · shadcn-style UI |
| Data/forms    | TanStack Query · React Hook Form · Zod · Framer Motion            |
| Backend       | NestJS (modular, clean architecture)                              |
| Database      | PostgreSQL · Prisma ORM                                           |
| Cache / locks | Redis (ioredis)                                                  |
| Auth          | Better Auth (email/password, sessions)                           |
| Testing       | Vitest · Playwright                                              |
| Delivery      | Docker · GitHub Actions · Coolify / AWS ready                     |

## Repository layout

```
.
├─ apps/
│  ├─ api/           # NestJS API (REST, /api/v1, Better Auth at /api/auth)
│  └─ web/           # Next.js 15 app (marketing, dashboard, booking pages)
├─ packages/
│  ├─ types/         # Framework-free shared domain types + enums
│  ├─ utils/         # Datetime/timezone, Zod schemas, errors, scheduling engine
│  ├─ database/      # Prisma schema, client, migrations, seed
│  ├─ integrations/  # Provider integration framework + adapters (calendar, …)
│  ├─ ui/            # Design system (tokens, Tailwind preset, components)
│  └─ sdk/           # Typed API client consumed by the web app
├─ docker-compose.yml
└─ turbo.json
```

### Architectural highlights

- **Modular integration framework** (`packages/integrations`) — a framework-free
  plugin system with one capability interface per category (calendar, video,
  payment, email, SMS, CRM, automation, messaging) and a provider registry.
  Ships adapters for Google/Outlook/Apple calendars, Google Meet/Zoom/Teams,
  Stripe/Razorpay/PayPal, Resend/SMTP/Mailgun, Twilio/MessageBird,
  HubSpot/Salesforce/Zoho/Pipedrive, Zapier/Make/n8n and Slack/Teams/Discord.
  Adding a provider is a single `registry.register(...)` call. Cross-cutting
  concerns — OAuth 2.0, API keys, AES-256-GCM credential encryption, an HTTP
  client with exponential-backoff retry, HMAC webhook signing, integration
  logs, health monitoring and background sync — are built in. The NestJS
  `IntegrationsModule` wires it to persistence, OAuth callbacks and webhooks.
- **Framework-free availability engine** (`packages/utils/src/scheduling`) —
  pure, DST-correct slot generation with buffers, minimum notice, rolling
  windows and per-slot seat accounting. 97%+ test coverage.
- **Single source of validation** — Zod schemas in `@invincible/utils` are used
  by both the API (request validation) and the web (form validation).
- **Concurrency-safe bookings** — Redis distributed lock + transactional seat
  re-check + idempotency keys prevent double-booking under load.
- **Stable error contract** — every API error is serialized to a consistent
  shape and surfaced through the SDK as a typed `SdkError`.
- **Multi-tenancy** — organization-scoped data with role-based membership,
  enforced by guards reading the `x-organization-id` header.

## Getting started

### Prerequisites

- Node.js 22+, pnpm 10+
- Docker (for Postgres, Redis, MinIO)

### 1. Install & configure

```bash
pnpm install
cp .env.example .env   # fill in secrets
```

### 2. Start infrastructure

```bash
docker compose up -d postgres redis minio
```

### 3. Prepare the database

```bash
pnpm db:generate      # generate the Prisma client
pnpm db:migrate       # apply migrations (dev)
pnpm db:seed          # optional demo org + event type
```

### 4. Run the apps

```bash
pnpm dev              # runs api (:4000) and web (:3000) via Turborepo
```

- Web: http://localhost:3000
- API health: http://localhost:4000/api/v1/health/ready
- Demo booking page (after seeding): http://localhost:3000/invincible-pros/intro-call

## Common scripts

| Command             | Description                                        |
| ------------------- | -------------------------------------------------- |
| `pnpm dev`          | Run all apps in watch mode                         |
| `pnpm build`        | Build every package and app                        |
| `pnpm test`         | Run unit tests (Vitest) across the workspace       |
| `pnpm typecheck`    | Type-check all packages/apps                       |
| `pnpm lint`         | Lint the workspace                                 |
| `pnpm db:studio`    | Open Prisma Studio                                 |
| `pnpm format`       | Format with Prettier                               |

## API surface (Phase 1)

| Method | Path                                                        | Auth        |
| ------ | ----------------------------------------------------------- | ----------- |
| GET    | `/api/v1/health/{live,ready}`                               | public      |
| *      | `/api/auth/*`                                               | Better Auth |
| GET/POST | `/api/v1/organizations`                                   | session     |
| POST   | `/api/v1/organizations/invitations`                         | org member  |
| CRUD   | `/api/v1/schedules`                                         | org member  |
| CRUD   | `/api/v1/event-types`                                       | org member  |
| GET    | `/api/v1/bookings`                                          | org member  |
| GET    | `/api/v1/public/booking-pages/:orgSlug/:eventSlug`          | public      |
| GET    | `/api/v1/public/event-types/:id/availability`               | public      |
| POST   | `/api/v1/public/bookings`                                   | public      |
| POST   | `/api/v1/public/bookings/:reference/cancel`                 | public      |
| GET    | `/api/v1/integrations/catalog`                              | org member  |
| CRUD   | `/api/v1/integrations/connections`                          | org member  |
| POST   | `/api/v1/integrations/connections/:id/verify`               | org member  |
| GET    | `/api/v1/integrations/logs`                                 | org member  |
| POST   | `/api/v1/integrations/oauth/authorize`                      | org member  |
| GET    | `/api/v1/integrations/oauth/callback`                       | public      |
| CRUD   | `/api/v1/integrations/webhook-endpoints`                    | org member  |
| GET    | `/api/v1/integrations/webhook-deliveries`                   | org member  |
| POST   | `/api/v1/integrations/webhooks/inbound/:connectionId`       | public      |

## Deployment

Production images are defined in `apps/api/Dockerfile` and `apps/web/Dockerfile`
(both build from the repo root). `docker compose --profile full up --build`
brings up the entire stack. CI (`.github/workflows/ci.yml`) runs lint,
typecheck, tests, app builds, and Docker image smoke builds.

## Integrations

The platform ships a complete, extensible integration system
(`packages/integrations` + the API `IntegrationsModule`):

| Category   | Providers                                             |
| ---------- | ----------------------------------------------------- |
| Calendar   | Google Calendar · Microsoft Outlook · Apple (CalDAV)  |
| Video      | Google Meet · Zoom · Microsoft Teams                  |
| Payment    | Stripe · Razorpay · PayPal                            |
| Email      | Resend · SMTP · Mailgun                               |
| SMS        | Twilio · MessageBird                                  |
| CRM        | HubSpot · Salesforce · Zoho CRM · Pipedrive           |
| Automation | Zapier · Make · n8n                                   |
| Messaging  | Slack · Microsoft Teams · Discord                     |

Cross-cutting capabilities: OAuth 2.0 + API-key connection flows, encrypted
credentials at rest, an append-only integration audit log, exponential-backoff
retries, inbound/outbound signed webhooks, per-connection health monitoring and
interval-based background sync. To add a provider, implement the relevant
capability interface and register it — no framework changes required.

## Roadmap (next phases)

- Bind the integration framework into the booking lifecycle (auto calendar
  events, video links, CRM sync, notifications) and reminders via BullMQ
- Round-robin & collective event types, SSO/SAML
- Realtime updates (WebSockets), analytics, and richer audit dashboards

## License

UNLICENSED — © INVINCIBLE PROS. All rights reserved.
