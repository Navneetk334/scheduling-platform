import { Badge, Button, Card, CardContent, Logo } from '@invincible/ui';
import { CalendarClock, Globe2, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

const features = [
  {
    icon: CalendarClock,
    title: 'Timezone-perfect availability',
    body: 'A DST-aware scheduling engine computes bookable slots across any timezone, with buffers, minimum notice and rolling windows.',
  },
  {
    icon: Zap,
    title: 'Instant, conflict-free booking',
    body: 'Distributed locking and transactional seat checks guarantee no double-bookings, even under heavy concurrent load.',
  },
  {
    icon: Globe2,
    title: 'Calendar & video ready',
    body: 'Designed to sync with Google, Microsoft and Apple calendars and generate Meet, Zoom or Teams links automatically.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-grade by default',
    body: 'Multi-tenant organizations, role-based access, validated inputs and structured error handling throughout.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
          <Badge variant="secondary" className="mb-6">
            Scheduling, reimagined for teams
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Booking time should feel{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              effortless
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            INVINCIBLE PROS gives your organization a beautiful, reliable scheduling platform.
            Publish your availability, share a link, and let people book you in seconds.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">Create your account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/invincible-pros/intro-call">See a live booking page</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="transition-shadow hover:shadow-md">
              <CardContent className="flex gap-4 p-6">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <Logo showWordmark={false} />
          <p>© {new Date().getFullYear()} INVINCIBLE PROS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
