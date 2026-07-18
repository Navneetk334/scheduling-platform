import type { Metadata, Viewport } from 'next';
import * as React from 'react';

import { env } from '@/lib/env';

import { Providers } from './providers';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${env.appName} — Modern Scheduling`,
    template: `%s · ${env.appName}`,
  },
  description:
    'Enterprise-grade scheduling for teams. Share your availability, eliminate back-and-forth, and let people book time with you instantly.',
  applicationName: env.appName,
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1e' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
