import * as React from 'react';

import { PricingTable } from '../pricing-table';
import { Section, SectionHeading } from '../section';

export function PricingPreview() {
  return (
    <Section id="pricing" className="bg-muted/20">
      <SectionHeading
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        description="Start free, upgrade when you grow. Every paid plan includes a free trial — no credit card required to begin."
      />
      <PricingTable className="mt-12" />
    </Section>
  );
}
