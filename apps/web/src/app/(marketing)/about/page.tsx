import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

import { Button } from '@invincible/ui';
import { Compass, Heart, ShieldCheck, Sparkles } from 'lucide-react';

import { PageHero } from '@/components/marketing/page-hero';
import { Prose } from '@/components/marketing/prose';
import { Section, SectionHeading } from '@/components/marketing/section';
import { Cta } from '@/components/marketing/sections/cta';

export const metadata: Metadata = {
  title: 'About',
  description:
    'INVINCIBLE PROS is on a mission to give every team back the time they lose to scheduling. Learn about our story, our values, and the people building it.',
  alternates: { canonical: '/about' },
};

const values = [
  { icon: Compass, title: 'Clarity over clever', body: 'We ship products people understand instantly. Simplicity is a feature we defend.' },
  { icon: ShieldCheck, title: 'Trust is earned', body: 'Reliability and security aren’t optional. We treat customer data like our own.' },
  { icon: Heart, title: 'Craft matters', body: 'From pixels to APIs, we sweat the details others skip. Quality compounds.' },
  { icon: Sparkles, title: 'Momentum wins', body: 'We move quickly, learn in public, and improve relentlessly for our customers.' },
];

const stats = [
  { stat: '4M+', label: 'meetings booked' },
  { stat: '120+', label: 'countries served' },
  { stat: '99.99%', label: 'uptime' },
  { stat: '2021', label: 'founded' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="We give teams back their time"
        description="INVINCIBLE PROS started with a simple frustration: scheduling a single meeting shouldn’t take a dozen emails. So we built a better way — original from the ground up."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            centered={false}
            eyebrow="Our story"
            title="Built for the teams behind the meetings"
          />
          <Prose>
            <p>
              Every valuable relationship — a sale, a diagnosis, an interview, a lesson — begins with a conversation.
              Yet the act of finding time for that conversation is still shockingly painful. We founded INVINCIBLE PROS
              to remove that friction entirely.
            </p>
            <p>
              Rather than clone what already existed, we designed our own architecture, brand, and experience from
              first principles: a conflict-free booking engine, true multi-tenancy, native payments, and an API
              developers love. The result is a platform that scales from a solo consultant to a global enterprise.
            </p>
            <p>
              Today, teams in over 120 countries rely on INVINCIBLE PROS to run their most important conversations. We’re
              just getting started.
            </p>
          </Prose>
        </div>
      </Section>

      <Section className="bg-muted/20">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                {s.stat}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Our values" title="What we believe" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card/50 p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <v.icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button size="lg" asChild>
            <Link href="/contact">Get in touch</Link>
          </Button>
        </div>
      </Section>

      <Cta />
    </>
  );
}
