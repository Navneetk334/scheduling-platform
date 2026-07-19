import type { Metadata } from 'next';
import * as React from 'react';

import { Benefits } from '@/components/marketing/sections/benefits';
import { BlogPreview } from '@/components/marketing/sections/blog-preview';
import { Cta } from '@/components/marketing/sections/cta';
import { Faq } from '@/components/marketing/sections/faq';
import { Features } from '@/components/marketing/sections/features';
import { Hero } from '@/components/marketing/sections/hero';
import { HowItWorks } from '@/components/marketing/sections/how-it-works';
import { Industries } from '@/components/marketing/sections/industries';
import { Integrations } from '@/components/marketing/sections/integrations';
import { PricingPreview } from '@/components/marketing/sections/pricing-preview';
import { Screenshots } from '@/components/marketing/sections/screenshots';
import { Testimonials } from '@/components/marketing/sections/testimonials';
import { TrustedBy } from '@/components/marketing/sections/trusted-by';
import { faqs } from '@/components/marketing/data';

export const metadata: Metadata = {
  title: 'Modern scheduling for teams',
  description:
    'INVINCIBLE PROS is an enterprise-grade scheduling platform. Share your availability, eliminate back-and-forth, and let people book time with you instantly — across every timezone, calendar, and team.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'INVINCIBLE PROS — Modern scheduling for teams',
    description:
      'Beautiful, reliable scheduling with conflict-free booking, team routing, payments, and a first-class API.',
    type: 'website',
  },
};

/** Structured data for richer search results (Organization, Product, FAQ). */
function JsonLd() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'INVINCIBLE PROS',
        description: 'Enterprise-grade scheduling platform for modern teams.',
        url: 'https://invinciblepros.com',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'INVINCIBLE PROS',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Benefits />
      <Integrations />
      <Industries />
      <Screenshots />
      <Testimonials />
      <PricingPreview />
      <Faq />
      <BlogPreview />
      <Cta />
    </>
  );
}
