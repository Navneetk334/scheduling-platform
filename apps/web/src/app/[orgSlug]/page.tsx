import { createApiClient } from '@invincible/sdk';
import { Badge, Card, CardContent, Logo } from '@invincible/ui';
import { ArrowRight, Clock, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as React from 'react';

import { env } from '@/lib/env';
import { formatMoney } from '@/lib/format';

export const dynamic = 'force-dynamic';

type PageParams = { params: Promise<{ orgSlug: string }> };

function loadOrg(orgSlug: string) {
  return createApiClient({ baseUrl: env.apiUrl }).public.getOrganization(orgSlug);
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { orgSlug } = await params;
  try {
    const { organization } = await loadOrg(orgSlug);
    const title = `Book with ${organization.name}`;
    return {
      title,
      description: `Schedule time with ${organization.name}. Pick a service and book instantly.`,
      openGraph: { title, type: 'website' },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: 'Book a meeting' };
  }
}

export default async function OrgBookingLandingPage({ params }: PageParams) {
  const { orgSlug } = await params;
  const data = await loadOrg(orgSlug).catch(() => null);
  if (!data) notFound();

  const { organization, services } = data;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.name,
    makesOffer: services.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.title, description: s.description ?? undefined },
      ...(s.price ? { price: (s.price.amount / 100).toFixed(2), priceCurrency: s.price.currency.toUpperCase() } : {}),
    })),
  };

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Logo />
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Book with {organization.name}</h1>
          <p className="mt-2 text-muted-foreground">Choose a service to see availability and reserve your time.</p>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              This organization has no bookable services yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/${organization.slug}/${service.slug}`}
                className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full" style={{ backgroundColor: service.color }} aria-hidden />
                        <h2 className="font-semibold">{service.title}</h2>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
                    </div>
                    {service.description ? (
                      <p className="flex-1 text-sm text-muted-foreground">{service.description}</p>
                    ) : (
                      <p className="flex-1" />
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="size-3" aria-hidden /> {service.durationMinutes} min
                      </Badge>
                      {service.staffCount > 1 ? (
                        <Badge variant="outline" className="gap-1">
                          <Users className="size-3" aria-hidden /> {service.staffCount} staff
                        </Badge>
                      ) : null}
                      {service.price ? (
                        <Badge className="ml-auto">{formatMoney(service.price.amount, service.price.currency)}</Badge>
                      ) : (
                        <Badge variant="success" className="ml-auto">Free</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
