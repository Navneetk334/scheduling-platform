import { createApiClient } from '@invincible/sdk';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as React from 'react';

import { BookingExperience } from '@/components/booking/booking-experience';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

type PageParams = { params: Promise<{ orgSlug: string; eventSlug: string }> };

async function loadPage(orgSlug: string, eventSlug: string) {
  const client = createApiClient({ baseUrl: env.apiUrl });
  return client.public.getBookingPage(orgSlug, eventSlug);
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { orgSlug, eventSlug } = await params;
  try {
    const page = await loadPage(orgSlug, eventSlug);
    return {
      title: `${page.meetingType.title} · ${page.organization.name}`,
      description: page.meetingType.description ?? `Book ${page.meetingType.title}`,
    };
  } catch {
    return { title: 'Booking' };
  }
}

export default async function BookingPage({ params }: PageParams) {
  const { orgSlug, eventSlug } = await params;

  const page = await loadPage(orgSlug, eventSlug).catch(() => null);
  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <BookingExperience page={page} />
    </div>
  );
}
