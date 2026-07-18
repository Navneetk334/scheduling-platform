# INVINCIBLE PROS — Delivery Roadmap

How the [Feature Catalog](./feature-catalog.md) is sequenced into phases. Each
phase is independently shippable and builds on the previous one. Statuses mirror
the catalog.

---

## Phase 1 — Foundation ✅ (delivered)

The scheduling core, multi-tenancy, and the platform skeleton.

- Monorepo (pnpm + Turborepo), strict TypeScript, shared packages
- **Availability engine** (timezone/DST-correct, buffers, notice, windows, seats)
- Booking pages, event types, availability rules/schedules
- Organizations, memberships, roles, invitations
- Concurrency-safe bookings (Redis lock + transactional seat check + idempotency)
- Cancellation, guest invitees, confirmation references
- REST API (`/api/v1`), typed SDK, Better Auth (email/password)
- Design system, dashboard shell, dark mode, accessibility, responsive
- Docker, CI, health probes

## Phase 2 — Calendar, Conferencing & Reschedule

Make bookings real against people's actual calendars.

- Google / Microsoft / Apple calendar sync (free/busy + write-back)
- Multiple calendars per user; conflict-source selection
- Video links: Google Meet / Zoom / Microsoft Teams
- Self-service **rescheduling** flow + endpoint
- OAuth social sign-in (Google/Microsoft)

## Phase 3 — Notifications & Reminders

Cut no-shows and keep everyone informed.

- Email (Resend) confirmations/reschedule/cancel + templates
- Reminder engine (BullMQ/Redis): email, **SMS (Twilio)**, **WhatsApp**
- Host notifications + digests
- Delivery logs and retries

## Phase 4 — Advanced Scheduling

Round out event types for teams.

- **Round robin** (fair/weighted/priority assignment)
- **Collective** (multi-host intersection) meetings
- **Group booking** UX + waitlists
- **Recurring meetings** (RRULE + exceptions)
- Meeting frequency limits (daily/weekly caps)

## Phase 5 — Monetization

Charge for time and run the SaaS business.

- Stripe **payments** for paid events (+ refunds)
- **Coupons** (discounts, limits, expiry)
- **Invoices**/receipts (PDF + email)
- **Subscriptions**: Free/Pro/Team/Enterprise plans + seat metering

## Phase 6 — Forms, Branding & Distribution

Customize the booking experience and where it lives.

- **Custom forms / booking questions** (form builder)
- **White label** + **custom domains** (automated TLS)
- **Embeddable widgets** (inline/popup/floating)
- **PWA** (installable, offline read + queued actions)

## Phase 7 — Developer Platform & Integrations

Open the platform up.

- **GraphQL API**, **webhooks** (signed, retried), **API keys**
- **Rate limiting** (global + per-key), OAuth apps for third parties
- **Marketplace** + **Zapier / Slack / Discord / CRM** integrations

## Phase 8 — AI Suite

Intelligence on top.

- AI scheduling assistant, availability suggestions
- AI meeting summaries, email generator
- AI spam/fraud detection

## Phase 9 — Enterprise, Analytics & Compliance

Governance, insight, and trust at scale.

- **Analytics** dashboards + exports; per-member reporting
- **Audit logs** + **security logs**
- SSO/SAML, granular **permissions**
- Formalize **SOC 2** controls + **GDPR** export/erasure workflows
- Encryption hardening, localization/RTL, native apps

---

## Cross-cutting (every phase)

- Tests (Vitest unit + Playwright e2e) and type-safety maintained
- Accessibility, responsive, and dark mode for all new UI
- Loading/empty/error states for all data views
- Structured errors + input validation on all endpoints
- Docs and feature-catalog status updated per shipped feature

## Dependency notes

- Calendar sync (P2) precedes accurate round-robin/collective (P4) — pooled
  hosts need real free/busy.
- Notifications (P3) precede reminders used by Healthcare/Sales personas.
- Payments (P5) unblock Freelancer/Consultant/Healthcare monetization.
- Developer platform (P7) unblocks marketplace + external integrations.
