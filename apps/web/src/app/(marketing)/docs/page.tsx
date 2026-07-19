import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

import { CalendarCog, CreditCard, KeyRound, PlugZap, Rocket, Users } from 'lucide-react';

import { PageHero } from '@/components/marketing/page-hero';
import { Prose } from '@/components/marketing/prose';
import { Section, SectionHeading } from '@/components/marketing/section';

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Set up and configure INVINCIBLE PROS: getting started, meeting types, availability, calendar sync, payments, teams, and integrations.',
  alternates: { canonical: '/docs' },
};

const categories = [
  { icon: Rocket, title: 'Getting started', body: 'Create your workspace, connect a calendar, and publish your first booking page.' },
  { icon: CalendarCog, title: 'Meeting types', body: 'Durations, buffers, limits, locations, custom questions, and routing rules.' },
  { icon: Users, title: 'Teams & routing', body: 'Round-robin, collective, and group booking across your team’s pooled availability.' },
  { icon: CreditCard, title: 'Payments & invoices', body: 'Collect payment at booking with Stripe, apply coupons, and handle GST/VAT.' },
  { icon: PlugZap, title: 'Integrations', body: 'Connect Google, Microsoft, Apple, Zoom, Slack, Zapier, and your CRM.' },
  { icon: KeyRound, title: 'Security & access', body: 'SSO, roles and permissions, audit logs, and data residency.' },
];

export default function DocsPage() {
  return (
    <>
      <PageHero
        eyebrow="Documentation"
        title="Docs to get you up and running"
        description="Clear, task-focused guides for every part of INVINCIBLE PROS — from your first booking page to enterprise rollout."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.title}
              href="/docs"
              className="group rounded-2xl border border-border bg-card/50 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <c.icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold group-hover:text-primary">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="bg-muted/20">
        <SectionHeading
          centered={false}
          eyebrow="Quickstart"
          title="From zero to first booking in 5 minutes"
        />
        <Prose className="mt-6 max-w-3xl">
          <ol>
            <li>
              <strong>Create your account.</strong> Sign up and name your organization. You’ll land in your workspace
              immediately.
            </li>
            <li>
              <strong>Connect a calendar.</strong> Link Google, Microsoft, or Apple so we can read your real
              availability and write new events.
            </li>
            <li>
              <strong>Create a meeting type.</strong> Choose a duration, set buffers and limits, and add any questions
              you want to ask.
            </li>
            <li>
              <strong>Share your link.</strong> Publish your booking page or embed the widget on your site — visitors
              book in their own timezone.
            </li>
          </ol>
          <p>
            Looking for programmatic access? Head over to the <Link href="/api">API reference</Link> for REST and
            GraphQL details.
          </p>
        </Prose>
      </Section>
    </>
  );
}
