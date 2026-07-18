# INVINCIBLE PROS — Enterprise Feature Catalog

The complete capability set for the scheduling platform, organized by domain.
Each feature lists what it does, its key capabilities, and its current delivery
status against the codebase.

**Status legend**

| Badge | Meaning |
| ----- | ------- |
| ✅ Built | Implemented and verified in Phase 1 |
| 🟡 Partial | Foundations exist (schema/plumbing); logic to be completed |
| 📋 Planned | Designed for a later phase; not yet implemented |

> Delivery phases are defined in [`roadmap.md`](./roadmap.md). Persona coverage
> is mapped in [`persona-matrix.md`](./persona-matrix.md).

---

## 1. Scheduling Core

The heart of the product: defining what can be booked, when, and by whom.

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **Booking pages** | ✅ Built | Public, SEO-friendly pages at `/{org}/{event}` where invitees pick a slot and book. Server-rendered, timezone-aware, mobile-first. |
| **Unlimited event types** | ✅ Built | Create any number of bookable meeting types per organization. Plan-based limits enforced at billing layer (📋). |
| **Availability rules** | ✅ Built | Weekly recurring rules (per weekday, minute-precision) plus specific-date overrides (extra hours or full blackout). Multiple named schedules per user. |
| **Time zones** | ✅ Built | DST-correct engine. Hosts define availability in their zone; invitees see slots in their own detected zone. IANA-validated everywhere. |
| **Booking buffers** | ✅ Built | Configurable padding before and after each meeting; enforced during slot generation and conflict checks. |
| **Meeting limits** | 🟡 Partial | Minimum notice, rolling booking window, and per-slot seat caps are built. Daily/weekly/per-event frequency caps are planned. |
| **One-on-one meetings** | ✅ Built | Single host ↔ single invitee (default event kind). |
| **Group booking** | 🟡 Partial | Multiple invitees per slot via `seatsPerSlot`; seat accounting is in the engine. Waitlist and attendee cap UX planned. |
| **Round robin** | 🟡 Partial | Event kind modeled; distributes bookings across a host pool. Assignment strategies (fairness, weighting, availability-priority) planned. |
| **Collective meetings** | 🟡 Partial | Event kind modeled; requires all listed hosts to be free. Multi-host availability intersection planned. |
| **Recurring meetings** | 📋 Planned | Invitees book a repeating series (daily/weekly/monthly with RRULE), with per-occurrence exceptions. |
| **Custom booking durations** | ✅ Built | Per-event duration and slot interval (e.g. 15/30/60 min; :00/:15 increments). |

---

## 2. Calendar & Conferencing

Two-way sync with external calendars and automatic meeting links.

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **Calendar sync** | 📋 Planned | Two-way sync: read free/busy to block conflicts, write confirmed bookings back. `CalendarConnection` model + token storage already in schema. |
| **Multiple calendars** | 📋 Planned | Connect several calendars per user; choose which to check for conflicts and which to write to. Schema supports many connections per user. |
| **Google Calendar** | 📋 Planned | OAuth connect, free/busy, event create/update/delete, Google Meet link generation. |
| **Microsoft / Outlook** | 📋 Planned | Microsoft Graph calendar sync + Teams link generation. |
| **Apple Calendar** | 📋 Planned | CalDAV-based sync. |
| **Video providers** | 📋 Planned | Auto-generate Google Meet, Zoom, and Microsoft Teams links on booking; store `meetingUrl`. Location types already modeled. |

---

## 3. Booking Experience

Everything the invitee touches, and post-booking lifecycle.

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **Custom forms** | 📋 Planned | Per-event form builder: text, select, multi-select, checkbox, phone, file upload. Rendered dynamically on the booking page. |
| **Booking questions** | 📋 Planned | Required/optional questions attached to an event; answers stored with the booking and shown to the host. Basic `notes` field exists today. |
| **Rescheduling** | 🟡 Partial | Reschedule schema + `rescheduledFrom` link modeled; self-service reschedule flow and endpoint planned. |
| **Cancellation** | ✅ Built | Public cancel-by-reference endpoint with reason capture; status transitions tracked. |
| **Confirmation & reference** | ✅ Built | Unique human-friendly booking reference (`INV-XXXX`) shown on confirmation. |
| **Guest invitees** | ✅ Built | Add additional guests (name/email) to a booking. |
| **Idempotent booking** | ✅ Built | Client idempotency key + Redis lock + transactional seat re-check prevent double-booking under load. |
| **Waitlists** | 📋 Planned | Join a waitlist for full group slots; auto-promote on cancellation. |

---

## 4. Payments & Monetization

Charge for meetings and manage recurring revenue.

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **Payments** | 📋 Planned | Stripe-backed paid bookings (fixed price per event); capture on booking or on completion. Stripe config already scaffolded. |
| **Coupons** | 📋 Planned | Percentage/fixed discount codes, usage limits, expiry, per-event applicability. |
| **Invoices** | 📋 Planned | Auto-generated invoices/receipts for paid bookings; downloadable PDF + email delivery. |
| **Subscriptions** | 📋 Planned | Platform SaaS plans (Free/Pro/Team/Enterprise) via Stripe Billing; seat-based and usage metering. |
| **Refunds** | 📋 Planned | Full/partial refunds tied to cancellation policy. |

---

## 5. Notifications & Reminders

Keep everyone informed across channels.

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **Email notifications** | 📋 Planned | Confirmations, reschedules, cancellations, and reminders via Resend. Templated + branded. Config scaffolded. |
| **Email reminders** | 📋 Planned | Configurable reminder schedule (e.g. 24h + 1h before) queued via BullMQ/Redis. |
| **SMS reminders** | 📋 Planned | Twilio SMS for confirmations/reminders; opt-in + per-event toggle. Config scaffolded. |
| **WhatsApp reminders** | 📋 Planned | Twilio WhatsApp templated reminders. |
| **Host notifications** | 📋 Planned | New booking / cancellation alerts to hosts; digest options. |
| **Reminder engine** | 📋 Planned | Durable, retryable job queue with dead-letter handling and per-tenant rate awareness. |

---

## 6. Teams & Organization

Multi-tenant administration and governance.

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **Organization management** | ✅ Built | Create orgs, unique slugs, org timezone/branding, soft-delete. Default schedule provisioned on creation. |
| **Teams** | 🟡 Partial | Members belong to orgs today; nested sub-teams / departments planned for round-robin pools and reporting scopes. |
| **Roles** | ✅ Built | `OWNER`, `ADMIN`, `MEMBER` roles per membership. |
| **Permissions** | 🟡 Partial | Role-based guards protect org-scoped routes; granular per-resource permission matrix planned. |
| **Member invitations** | ✅ Built | Token-based email invitations with role + expiry (delivery email pending notifications module). |
| **Audit logs** | 📋 Planned | Immutable, queryable record of who did what/when across the org (settings, bookings, members). |
| **Admin panel** | 🟡 Partial | Authenticated dashboard shell + overview + event-type management built; full admin surface planned. |

---

## 7. Developer Platform

APIs and extensibility for builders.

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **REST API** | ✅ Built | Versioned (`/api/v1`) NestJS API with a stable error contract and Zod-validated inputs. |
| **Typed SDK** | ✅ Built | `@invincible/sdk` client with typed resources and structured `SdkError`. |
| **GraphQL API** | 📋 Planned | GraphQL gateway over the same domain services for flexible client queries. |
| **OAuth** | 🟡 Partial | Better Auth email/password + sessions built; social/OAuth providers (Google/Microsoft/GitHub) and OAuth-app authorization for third parties planned. |
| **Webhook support** | 📋 Planned | Subscribe to events (`booking.created`, `booking.cancelled`, …) with signed payloads, retries, and delivery logs. |
| **API keys** | 📋 Planned | Per-org scoped API keys with granular permissions and rotation. |
| **Rate limiting** | 🟡 Partial | Redis available and lock primitives built; per-key/IP token-bucket limiting to be enforced at the edge. |

---

## 8. Integrations & Extensibility

Connect to the tools teams already use.

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **Marketplace** | 📋 Planned | Directory of installable integrations/apps with per-org install + config. |
| **Zapier** | 📋 Planned | Triggers (new booking, cancellation) and actions (create booking) via public REST + webhooks. |
| **Slack** | 📋 Planned | Booking notifications to channels/DMs; slash-command availability lookup. |
| **Discord** | 📋 Planned | Webhook/bot notifications to servers. |
| **CRM integrations** | 📋 Planned | Salesforce/HubSpot/Pipedrive: create/update contacts and log meetings as activities. |
| **Embeddable widgets** | 📋 Planned | Inline embed, popup button, and floating widget via a lightweight script + iframe; theme-able. |

---

## 9. Branding & Distribution

Make the platform feel like the customer's own, everywhere.

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **White label** | 📋 Planned | Remove platform branding; custom logo, colors (token-driven), and email sender identity per org. |
| **Custom domains** | 📋 Planned | Serve booking pages on the customer's domain with automated TLS. |
| **Embeddable widgets** | 📋 Planned | See Integrations — booking embeds for any website. |
| **Mobile responsive** | ✅ Built | Fully responsive across breakpoints. |
| **PWA** | 📋 Planned | Installable progressive web app with manifest + service worker. |
| **Native apps** | 📋 Planned | iOS/Android (React Native/Expo) sharing the SDK and design tokens. |
| **Offline support** | 📋 Planned | Cached read views + queued actions that sync on reconnect. |

---

## 10. AI Suite

Intelligence layered on top of the scheduling core.

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **AI scheduling assistant** | 📋 Planned | Natural-language booking ("find 30 min with Sam next week"); proposes and books slots. |
| **AI meeting summaries** | 📋 Planned | Post-meeting summaries + action items from transcripts (via conferencing providers). |
| **AI email generator** | 📋 Planned | Draft confirmations, follow-ups, and reschedule messages in the org's tone. |
| **AI availability suggestions** | 📋 Planned | Recommend optimal availability windows from historical booking patterns and no-show rates. |
| **AI spam detection** | 📋 Planned | Score inbound bookings for spam/abuse; auto-hold or reject suspicious requests. |

---

## 11. Analytics & Reporting

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **Analytics dashboards** | 📋 Planned | Bookings over time, conversion, no-show rate, popular event types, revenue. |
| **Per-member reporting** | 📋 Planned | Utilization and load across teams (feeds round-robin fairness). |
| **Exports** | 📋 Planned | CSV/scheduled exports and BI-friendly endpoints. |

---

## 12. Experience & Accessibility

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **Dark mode** | ✅ Built | System/light/dark via `next-themes` + CSS-variable tokens. |
| **Accessibility** | ✅ Built | Radix-based primitives, labeled fields, `aria-*` states, focus rings, keyboard nav. WCAG 2.1 AA target. |
| **Localization (i18n)** | 📋 Planned | Message catalogs + locale-aware date/number formatting. |
| **RTL support** | 📋 Planned | Logical CSS properties + `dir="rtl"` layouts for Arabic/Hebrew. |
| **Responsive design** | ✅ Built | Mobile-first layouts across the app. |

---

## 13. Security, Privacy & Compliance

| Feature | Status | Description & key capabilities |
| ------- | ------ | ------------------------------ |
| **Authentication & sessions** | ✅ Built | Better Auth with secure, HTTP-only session cookies. |
| **Rate limiting** | 🟡 Partial | Redis primitives in place; global + per-endpoint enforcement planned. |
| **Fraud detection** | 📋 Planned | Velocity checks, disposable-email detection, and payment risk signals. |
| **Security logs** | 📋 Planned | Auth events, permission changes, and admin actions recorded and alertable. |
| **Audit trail** | 📋 Planned | See Teams — immutable domain audit log. |
| **SOC 2-ready architecture** | 🟡 Partial | Structured logging, least-privilege access, env-validated config, and change-controlled CI form the foundation; controls + evidence collection to formalize. |
| **GDPR-ready architecture** | 🟡 Partial | Tenant data isolation, soft-delete, and a clear data model support data-subject requests; export/erasure workflows + DPA tooling planned. |
| **Encryption** | 📋 Planned | At-rest (DB/secrets) and in-transit (TLS) with tokenized third-party credentials. |
| **Security headers** | ✅ Built | Helmet on the API; CSP/nosniff/frame headers on web. |

---

## Feature count summary

| Domain | Built | Partial | Planned |
| ------ | ----- | ------- | ------- |
| Scheduling Core | 5 | 4 | 1 |
| Calendar & Conferencing | 0 | 0 | 6 |
| Booking Experience | 4 | 1 | 3 |
| Payments & Monetization | 0 | 0 | 5 |
| Notifications | 0 | 0 | 6 |
| Teams & Organization | 3 | 3 | 1 |
| Developer Platform | 2 | 2 | 3 |
| Integrations | 0 | 0 | 6 |
| Branding & Distribution | 1 | 0 | 6 |
| AI Suite | 0 | 0 | 5 |
| Analytics | 0 | 0 | 3 |
| Experience & Accessibility | 3 | 0 | 2 |
| Security & Compliance | 2 | 3 | 4 |

This catalog is the source of truth for scope. When we build a feature, we flip
its badge and link the PR.
