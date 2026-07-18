import { Logo } from '@invincible/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

import { ManageBooking } from '@/components/booking/manage-booking';

export const metadata: Metadata = {
  title: 'Manage booking',
  robots: { index: false, follow: false },
};

type PageParams = { params: Promise<{ reference: string }> };

export default async function ManageBookingPage({ params }: PageParams) {
  const { reference } = await params;

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-lg items-center justify-between px-6 py-6">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto max-w-lg px-6 pb-16">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Manage your booking</h1>
        <ManageBooking reference={reference} />
      </main>
    </div>
  );
}
