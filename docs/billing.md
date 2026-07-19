# Billing & Subscriptions

The billing system pairs a **framework-free billing core** (`@invincible/utils`,
fully unit-tested) with a **NestJS `BillingModule`** that persists via Prisma and
charges through a pluggable payment-gateway abstraction.

## Plans

| Tier | Price (mo / yr) | Model | Seats | Bookings/mo | Custom domain | White label | Priority support |
| ---- | --------------- | ----- | ----- | ----------- | ------------- | ----------- | ---------------- |
| **Free** | $0 | flat | 1 | 50 | — | — | — |
| **Starter** | $12 / $120 | flat | 3 | 1,000 | — | — | — |
| **Professional** | $29 / $290 **per seat** | seat-based | ∞ | 10,000 (+overage) | ✓ | — | ✓ |
| **Business** | $49 / $490 **per seat** | seat-based | ∞ | 100,000 (+overage) | ✓ | ✓ | ✓ |
| **Enterprise** | Custom | seat-based | ∞ | ∞ | ✓ | ✓ | ✓ (SLA) |

The catalog (`PLAN_CATALOG`) is the single source of truth for **limits**
(storage, calendars, meeting types, bookings, API, teams, organizations) and
**features**. Persisted `Plan` rows mirror pricing; plan keys equal the tiers.

## Pricing models

- **Monthly & yearly** billing (`interval`); yearly ≈ 10× monthly (2 months free).
- **Seat-based pricing** — Professional/Business/Enterprise charge per seat.
- **Usage-based pricing** — metered overage for bookings, storage (GB) and API
  requests beyond plan limits, billed in blocks.

## Entitlements & limits

`EntitlementsService` resolves an org's tier, gathers live usage (seats, meeting
types, teams, calendars, bookings this month), and returns limits + remaining +
violations. `assertCanConsume(org, key, delta)` guards actions (throws `FORBIDDEN`
with an upgrade prompt when a limit is hit).

## Lifecycle

`POST /api/v1/billing/subscribe` → creates the subscription (with a **free
trial** when the plan defines `trialDays`), issues an invoice, and charges
immediately (unless trialing).

- **Upgrade / downgrade / seat & interval change:** `POST /billing/change-plan`
  computes **proration** (credit for unused time + charge for the remainder) and
  issues a proration invoice.
- **Cancellation:** `POST /billing/cancel` (`atPeriodEnd` or immediate).
- **Resume:** `POST /billing/resume`.
- **Automatic renewal:** period dates advance each interval.
- **Grace period + failed-payment recovery (dunning):** a failed charge sets
  `PAST_DUE` within the plan's grace window; retries follow a schedule; lapsed
  subscriptions become `UNPAID`.

Status is derived deterministically by `deriveStatus()` from trial/period/grace
dates + payment state.

## Discounts

- **Coupon codes** (org-scoped, percent or fixed, with expiry + redemption caps).
- **Discount campaigns** (platform-wide codes).
- **Referral discounts** (`Referral` model; percentage reward).

`applyDiscounts()` compounds discounts on the reducing balance and floors at zero.

## Tax

`calculateTax()` supports **GST**, **VAT**, and **sales tax**, inclusive or
exclusive, resolved per billing country (`resolveTaxRate`). Invoices store
`taxType`, `taxRatePct`, and `taxCountry`.

## Invoices & payments

`buildInvoice()` rolls line items → subtotal → discounts → tax → total. The
service persists `Invoice` + `InvoiceLineItem` and a `Payment` per charge.
`GET /billing/invoices` returns payment history.

## Multiple payment gateways

`PaymentGatewayRegistry` resolves an adapter by provider — **Stripe**, **PayPal**,
**Razorpay**, or **Manual**. Each implements `charge()` / `refund()`. The Stripe
adapter is wired for the real SDK when `STRIPE_SECRET_KEY` is set (it simulates
success until then so the pipeline is exercisable).

## Analytics

`GET /billing/analytics` returns **MRR**, **ARR**, active/trialing/canceled
counts, and **churn rate**, computed from live subscriptions + the catalog.

## Public catalog

`GET /api/v1/public/plans` returns the pricing catalog for marketing/checkout.
