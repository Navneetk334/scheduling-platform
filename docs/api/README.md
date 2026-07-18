# INVINCIBLE PROS — API Reference

Production API for the scheduling platform. Two co-equal interfaces share the
same domain services (business rules are single-sourced):

- **REST** — `https://{host}/api/v1`
- **GraphQL** — `https://{host}/api/graphql`

Interactive docs: **`/api/docs`** (Swagger UI) · Machine spec: **`/api/openapi.json`**
· Metrics: **`/api/metrics`** · Health: **`/api/v1/health/{live,ready}`**

---

## Versioning

REST uses URI versioning (`/api/v1`). Breaking changes ship under a new major
version (`/api/v2`); additive changes are backwards compatible. The GraphQL
schema evolves additively with `@deprecated` fields.

## Authentication

The API accepts three credential types. Pick one per request.

| Method | Header | Best for |
| ------ | ------ | -------- |
| **Session cookie** | `Cookie: better-auth.session_token=…` | First-party web app |
| **JWT (Bearer)** | `Authorization: Bearer <accessToken>` | Mobile / server clients |
| **API key** | `x-api-key: inv_live_…` | Machine-to-machine integrations |

Organization-scoped routes also require `x-organization-id: <orgId>` (JWT/session)
— API keys are already bound to an organization.

### JWT + refresh tokens

```
POST /api/v1/auth/token        # exchange an authenticated session for a token pair
POST /api/v1/auth/refresh      # rotate: { "refreshToken": "…" } → new pair
POST /api/v1/auth/revoke       # revoke a refresh token
```

Access tokens are short-lived (`JWT_ACCESS_TTL`, default 15m). Refresh tokens are
long-lived, **rotated on every use**, and allow-listed in Redis so they can be
revoked. Reusing a rotated refresh token fails with `401`.

### OAuth login

Social sign-in (Google, Microsoft, GitHub) is handled by the auth service under
`/api/auth/*` and produces a session; call `/api/v1/auth/token` to obtain JWTs.

### API keys

Managed per organization (session/JWT):

```
GET    /api/v1/api-keys           # list (never returns the secret)
POST   /api/v1/api-keys           # { name, scopes[] } → returns the raw key ONCE
DELETE /api/v1/api-keys/:id       # revoke
```

Keys are stored only as SHA-256 hashes; the raw value is shown a single time.

## Authorization

Organizations use role-based access control (`Role` + `Permission`). Membership
is resolved per request; the active organization comes from `x-organization-id`.

## Rate limiting

Distributed fixed-window limiter (Redis). Defaults: `RATE_LIMIT_MAX` requests per
`RATE_LIMIT_WINDOW_SEC` (120 / 60s). Responses include:

```
X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After
```

Exceeding the limit returns `429 RATE_LIMITED`. Limits are keyed by API key →
user → client IP.

## Idempotency

Send an `Idempotency-Key` header on `POST/PUT/PATCH` to make retries safe. The
first successful response is cached (24h) and replayed for identical keys;
in-flight duplicates return `409`. Booking creation additionally accepts an
`idempotencyKey` field for end-to-end safety.

## Request & response validation

All request bodies/queries are validated with Zod (single source of truth shared
with the web app). Inputs are sanitized (control-character and HTML/XSS
stripping) before validation. Responses conform to the OpenAPI schema.

## Errors

Every error returns a stable envelope:

```json
{
  "code": "SLOT_UNAVAILABLE",
  "message": "The requested time slot is no longer available.",
  "statusCode": 409,
  "details": { "fields": { "email": ["Enter a valid email."] } },
  "requestId": "b1f2…"
}
```

| Code | HTTP | Meaning |
| ---- | ---- | ------- |
| `VALIDATION_ERROR` | 422 | Invalid input (see `details.fields`) |
| `UNAUTHORIZED` | 401 | Missing/invalid credentials |
| `FORBIDDEN` | 403 | Authenticated but not permitted |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | State conflict / duplicate |
| `SLOT_UNAVAILABLE` | 409 | Time slot taken |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Pagination, sorting, filtering, searching

List endpoints accept:

```
?page=1&limit=20&sort=createdAt&order=desc&q=search-term
```

Responses use the envelope:

```json
{ "data": [ … ], "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3, "hasNext": true, "hasPrev": false } }
```

`sort` is restricted to an allow-list per endpoint; `q` performs a
case-insensitive contains search over indexed text fields.

## Webhooks

Register endpoints per organization and subscribe to events:

```
POST   /api/v1/webhooks            # { url, events: ["booking.created", …] }
GET    /api/v1/webhooks
GET    /api/v1/webhooks/:id/deliveries
DELETE /api/v1/webhooks/:id
```

**Events:** `booking.created`, `booking.cancelled`, `booking.rescheduled`.

**Delivery:** each event is enqueued (BullMQ) and POSTed with headers:

```
X-Invincible-Event: booking.created
X-Invincible-Signature: sha256=<hmac>
X-Invincible-Delivery: <deliveryId>
```

**Signature verification** (HMAC-SHA256 over the raw body with your endpoint
secret):

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';
const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
const ok = timingSafeEqual(Buffer.from(expected), Buffer.from(signature.replace('sha256=', '')));
```

**Retries:** failed deliveries retry with exponential backoff (5 attempts).
Every attempt is recorded in `WebhookDelivery` (status, response code, error).

## Background jobs, queues & cron

- **Queues:** BullMQ over Redis — `webhooks` (delivery) and `notifications`.
- **Cron:** a scheduler sweeps upcoming bookings every 30 minutes and enqueues
  reminders (email/SMS/WhatsApp adapters plug into the notifications processor).
- Jobs are retried with backoff and are safe under horizontal scaling.

## Observability

- **Health:** `/api/v1/health/live` (liveness), `/api/v1/health/ready`
  (DB + Redis readiness).
- **Metrics:** `/api/metrics` (Prometheus) — default process metrics plus
  `http_request_duration_seconds` and `http_requests_total`.
- **Logging:** structured JSON (pino) with per-request `x-request-id`
  correlation; secrets are redacted.

## Security

Helmet security headers, strict CORS allow-list, input sanitization, Zod
validation, HMAC-signed webhooks, hashed API keys, rotating refresh tokens, and
Redis-backed rate limiting. See `SECURITY.md` for the full posture.

## OpenAPI & SDK generation

The canonical spec is generated from the Zod contracts:

```bash
pnpm --filter @invincible/api openapi:export   # writes openapi.json
pnpm --filter @invincible/api sdk:generate      # generates a typed client
```

A hand-authored typed client also ships as `@invincible/sdk`.

## GraphQL

`POST /api/graphql`. Auth via `Authorization: Bearer` or session cookie.

```graphql
query {
  organization(slug: "invincible-pros") {
    organization { name timeZone }
    services { title slug durationMinutes price { amount currency } }
  }
  availability(meetingTypeId: "…", from: "2026-07-20", to: "2026-08-03") {
    start
    seatsRemaining
  }
}

mutation {
  createBooking(input: {
    meetingTypeId: "…",
    startTime: "2026-07-21T13:00:00.000Z",
    invitee: { name: "Ada", email: "ada@example.com", timeZone: "UTC" }
  }) { reference status startTime }
}
```
