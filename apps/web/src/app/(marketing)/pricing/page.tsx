import type { Metadata } from 'next';
import * as React from 'react';

import { faqs } from '@/components/marketing/data';
import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { PageHero } from '@/components/marketing/page-hero';
import { PricingTable } from '@/components/marketing/pricing-table';
import { Cta } from '@/components/marketing/sections/cta';
import { Section, SectionHeading } from '@/components/marketing/section';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for teams of every size. Start free, upgrade when you grow. Monthly and yearly billing, seat-based and usage-based options.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Pricing that scales with you"
        description="Start on the free plan forever, or unlock advanced routing, payments, and white-label with a paid plan. Every paid plan includes a free trial."
      />

      <Section>
        <PricingTable />
        <p className="mt-8 text-center text-sm text-muted-foreground">
          All prices in USD. Yearly billing saves roughly two months. Taxes (GST/VAT) applied at checkout where
          applicable.
        </p>
      </Section>

      <Section className="bg-muted/20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            centered={false}
            eyebrow="FAQ"
            title="Pricing questions"
            description="Can’t find what you’re looking for? Reach out and we’ll help you choose the right plan."
          />
          <FaqAccordion items={faqs} />
        </div>
      </Section>

      <Cta />
    </>
  );
}
