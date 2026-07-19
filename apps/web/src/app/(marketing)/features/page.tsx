import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

import { Button } from '@invincible/ui';

import { Benefits } from '@/components/marketing/sections/benefits';
import { Cta } from '@/components/marketing/sections/cta';
import { Features } from '@/components/marketing/sections/features';
import { HowItWorks } from '@/components/marketing/sections/how-it-works';
import { PageHero } from '@/components/marketing/page-hero';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Explore the features that make INVINCIBLE PROS the most capable scheduling platform: conflict-free booking, team routing, payments, reminders, custom forms, and a first-class API.',
  alternates: { canonical: '/features' },
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="One platform for every kind of scheduling"
        description="From solo booking links to enterprise-wide routing, INVINCIBLE PROS handles it — reliably, beautifully, and at scale."
      >
        <Button size="lg" asChild>
          <Link href="/signup">Start for free</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/contact">Talk to sales</Link>
        </Button>
      </PageHero>

      <Features heading={false} />
      <HowItWorks />
      <Benefits />
      <Cta />
    </>
  );
}
