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
│  ├─ ui/            # Design system (tokens, Tailwind preset, components)
│  └─ sdk/           # Typed API client consumed by the web app
├─ docker-compose.yml
└─ turbo.json
```

### Architectural highlights

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

## Deployment

Production images are defined in `apps/api/Dockerfile` and `apps/web/Dockerfile`
(both build from the repo root). `docker compose --profile full up --build`
brings up the entire stack. CI (`.github/workflows/ci.yml`) runs lint,
typecheck, tests, app builds, and Docker image smoke builds.

## Roadmap (next phases)

- Calendar sync (Google / Microsoft / Apple) and video links (Meet / Zoom / Teams)
- Notifications (Resend email, Twilio SMS) and reminders via BullMQ
- Billing (Stripe), round-robin & collective event types, SSO/SAML
- Realtime updates (WebSockets), analytics, and audit logging

## License

UNLICENSED — © INVINCIBLE PROS. All rights reserved.
