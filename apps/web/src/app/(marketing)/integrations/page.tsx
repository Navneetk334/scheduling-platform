import type { Metadata } from 'next';
import * as React from 'react';

import { Cta } from '@/components/marketing/sections/cta';
import { Integrations } from '@/components/marketing/sections/integrations';
import { PageHero } from '@/components/marketing/page-hero';

export const metadata: Metadata = {
  title: 'Integrations',
  description:
    'Connect INVINCIBLE PROS with Google, Microsoft, and Apple calendars, Zoom, Meet, and Teams video, Stripe payments, Slack, Zapier, and leading CRMs.',
  alternates: { canonical: '/integrations' },
};

export default function IntegrationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Integrations"
        title="Connect your entire workflow"
        description="INVINCIBLE PROS sits at the center of your stack — syncing calendars, launching video calls, collecting payments, and pushing data to the tools your team lives in."
      />
      <Integrations showCta={false} />
      <Cta />
    </>
  );
}
