import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

import { Badge, Button } from '@invincible/ui';
import { Webhook, Zap } from 'lucide-react';

import { PageHero } from '@/components/marketing/page-hero';
import { Section, SectionHeading } from '@/components/marketing/section';
import { Cta } from '@/components/marketing/sections/cta';

export const metadata: Metadata = {
  title: 'API',
  description:
    'Build on INVINCIBLE PROS with a first-class REST and GraphQL API: OAuth and API keys, webhooks with signature verification, idempotency, pagination, and generated SDKs.',
  alternates: { canonical: '/api' },
};

const restEndpoints = [
  { method: 'GET', path: '/v1/meeting-types', desc: 'List meeting types' },
  { method: 'POST', path: '/v1/bookings', desc: 'Create a booking' },
  { method: 'GET', path: '/v1/availability', desc: 'Query bookable slots' },
  { method: 'POST', path: '/v1/webhooks', desc: 'Register a webhook' },
  { method: 'DELETE', path: '/v1/bookings/:id', desc: 'Cancel a booking' },
];

const methodColor: Record<string, string> = {
  GET: 'text-emerald-600 dark:text-emerald-400',
  POST: 'text-primary',
  DELETE: 'text-destructive',
};

const codeSample = `curl https://api.invinciblepros.com/v1/bookings \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Idempotency-Key: 9f1c2b7e" \\
  -d meetingTypeId=mt_123 \\
  -d start="2026-08-01T15:00:00Z" \\
  -d "invitee[email]=jordan@example.com"`;

export default function ApiPage() {
  return (
    <>
      <PageHero
        eyebrow="Developers"
        title="A scheduling API you’ll actually enjoy"
        description="Everything in the product is available through a clean, well-documented API. Build custom booking flows, sync data, and automate your operations."
      >
        <Button size="lg" asChild>
          <Link href="/docs">Read the docs</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/signup">Get API keys</Link>
        </Button>
      </PageHero>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading
              centered={false}
              eyebrow="REST & GraphQL"
              title="Two APIs, one platform"
              description="Use REST for simple, predictable calls, or GraphQL when you want to fetch exactly what you need in a single request."
            />
            <div className="mt-8 space-y-3">
              {restEndpoints.map((e) => (
                <div
                  key={`${e.method}-${e.path}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card/50 px-4 py-3"
                >
                  <span className={`w-16 shrink-0 font-mono text-xs font-bold ${methodColor[e.method] ?? ''}`}>
                    {e.method}
                  </span>
                  <code className="flex-1 truncate font-mono text-sm">{e.path}</code>
                  <span className="hidden text-xs text-muted-foreground sm:block">{e.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl border border-border bg-[#0b1020] text-slate-100 shadow-lg">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="size-2.5 rounded-full bg-red-400/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-2 text-xs text-slate-400">Create a booking</span>
              </div>
              <pre className="overflow-x-auto p-4 text-xs leading-6">
                <code>{codeSample}</code>
              </pre>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Idempotency keys make every write safe to retry. Responses are consistent, paginated, and versioned.
            </p>
          </div>
        </div>
      </Section>

      <Section className="bg-muted/20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Zap, title: 'OAuth & API keys', body: 'Authenticate as a user via OAuth or server-to-server with scoped API keys.' },
            { icon: Webhook, title: 'Signed webhooks', body: 'Subscribe to events with HMAC signature verification and automatic retries.' },
            { icon: Zap, title: 'Generated SDKs', body: 'Type-safe SDKs generated from our OpenAPI spec keep your integration in sync.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card/50 p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <f.icon className="size-5" aria-hidden />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <h3 className="font-semibold">{f.title}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Badge variant="secondary">OpenAPI 3.1</Badge>
          <Badge variant="secondary">GraphQL</Badge>
          <Badge variant="secondary">Webhooks</Badge>
          <Badge variant="secondary">Rate limited</Badge>
          <Badge variant="secondary">Versioned</Badge>
        </div>
      </Section>

      <Cta />
    </>
  );
}
