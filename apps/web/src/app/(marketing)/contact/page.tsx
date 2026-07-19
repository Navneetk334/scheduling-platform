import type { Metadata } from 'next';
import * as React from 'react';

import { Building2, LifeBuoy, Mail } from 'lucide-react';

import { ContactForm } from '@/components/marketing/contact-form';
import { PageHero } from '@/components/marketing/page-hero';
import { Section } from '@/components/marketing/section';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with the INVINCIBLE PROS team. Talk to sales, get support, or ask about enterprise deployments.',
  alternates: { canonical: '/contact' },
};

const channels = [
  { icon: Mail, title: 'General & sales', body: 'Questions about plans, demos, or partnerships.', detail: 'hello@invinciblepros.com' },
  { icon: LifeBuoy, title: 'Support', body: 'Already a customer and need a hand?', detail: 'support@invinciblepros.com' },
  { icon: Building2, title: 'Enterprise', body: 'Security reviews, procurement, and custom SLAs.', detail: 'enterprise@invinciblepros.com' },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let’s talk"
        description="Whether you’re evaluating INVINCIBLE PROS for your team or need a hand with your account, we’d love to hear from you."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <ContactForm />

          <div className="space-y-4">
            {channels.map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-card/50 p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                  <c.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                <p className="mt-2 text-sm font-medium text-primary">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
