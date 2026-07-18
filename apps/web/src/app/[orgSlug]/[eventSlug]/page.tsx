import { createApiClient } from '@invincible/sdk';
import { Logo } from '@invincible/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as React from 'react';

import { BookingWizard } from '@/components/booking/booking-wizard';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

type PageParams = { params: Promise<{ orgSlug: string; eventSlug: string }> };

function loadPage(orgSlug: string, eventSlug: string) {
  return createApiClient({ baseUrl: env.apiUrl }).public.getBookingPage(orgSlug, eventSlug);
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { orgSlug, eventSlug } = await params;
  try {
    const page = await loadPage(orgSlug, eventSlug);
    const title = `${page.meetingType.title} · ${page.organization.name}`;
    const description = page.meetingType.description ?? `Book ${page.meetingType.title} with ${page.organization.name}`;
    return {
      title,
      description,
      openGraph: { title, description, type: 'website' },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: 'Booking' };
  }
}

export default async function BookingPage({ params }: PageParams) {
  const { orgSlug, eventSlug } = await params;

  const page = await loadPage(orgSlug, eventSlug).catch(() => null);
  if (!page) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.meetingType.title,
    description: page.meetingType.description ?? undefined,
    provider: { '@type': 'Organization', name: page.organization.name },
    ...(page.meetingType.price
      ? {
          offers: {
            '@type': 'Offer',
            price: (page.meetingType.price.amount / 100).toFixed(2),
            priceCurrency: page.meetingType.price.currency.toUpperCase(),
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href={`/${orgSlug}`} aria-label={`${page.organization.name} services`}>
          <Logo />
        </Link>
      </header>
      <main className="px-6 pb-16">
        <BookingWizard page={page} orgSlug={orgSlug} />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
