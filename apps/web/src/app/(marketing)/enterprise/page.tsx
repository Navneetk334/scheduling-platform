import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

import { Button } from '@invincible/ui';
import { BarChart3, Building2, Fingerprint, Globe, KeyRound, Lock, ScrollText, Users } from 'lucide-react';

import { PageHero } from '@/components/marketing/page-hero';
import { Section, SectionHeading } from '@/components/marketing/section';
import { Cta } from '@/components/marketing/sections/cta';

export const metadata: Metadata = {
  title: 'Enterprise',
  description:
    'INVINCIBLE PROS for enterprise: SSO/SAML, granular RBAC, audit logs, custom domains, white-label, unlimited scale, and a SOC 2 / GDPR-ready architecture with priority SLAs.',
  alternates: { canonical: '/enterprise' },
};

const capabilities = [
  { icon: KeyRound, title: 'SSO & SAML', body: 'Enforce single sign-on with your identity provider and provision users with SCIM.' },
  { icon: Lock, title: 'Granular RBAC', body: 'Roles and permissions down to the resource, so people see and do exactly what they should.' },
  { icon: ScrollText, title: 'Audit logs', body: 'Every meaningful action recorded and exportable for compliance and incident review.' },
  { icon: Globe, title: 'Custom domains', body: 'Serve booking pages on your own domain with automatic TLS and white-label branding.' },
  { icon: Building2, title: 'Multi-org management', body: 'Model complex organizations, business units, and teams with strict data isolation.' },
  { icon: Fingerprint, title: 'Security by design', body: 'Encryption in transit and at rest, tenant isolation, and a SOC 2 / GDPR-ready architecture.' },
  { icon: Users, title: 'Unlimited scale', body: 'Horizontally scalable services handle millions of bookings without breaking a sweat.' },
  { icon: BarChart3, title: 'Advanced analytics', body: 'Org-wide reporting on conversion, utilization, and revenue, exportable to your warehouse.' },
];

export default function EnterprisePage() {
  return (
    <>
      <PageHero
        eyebrow="Enterprise"
        title="Scheduling infrastructure for the enterprise"
        description="Security, control, and reliability for organizations that can’t compromise. Deploy INVINCIBLE PROS across thousands of users with confidence."
      >
        <Button size="lg" asChild>
          <Link href="/contact">Contact sales</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/docs">Read the docs</Link>
        </Button>
      </PageHero>

      <Section>
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything IT and security teams require"
          description="Enterprise controls are built into the platform — not bolted on as an afterthought."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card/50 p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <c.icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-muted/20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card/50 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold tracking-tight">A partnership, not just a plan</h2>
          <p className="mt-3 text-muted-foreground">
            Enterprise customers get a dedicated account team, onboarding assistance, custom SLAs, and a direct line to
            our engineers. Let’s design the right rollout for your organization.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/contact">Talk to our team</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Cta />
    </>
  );
}
