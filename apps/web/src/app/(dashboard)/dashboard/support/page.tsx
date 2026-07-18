'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Separator,
} from '@invincible/ui';
import { BookOpen, LifeBuoy, MessageCircle, Send } from 'lucide-react';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';

const channels = [
  { icon: MessageCircle, title: 'Live chat', description: 'Chat with our team in real time.', cta: 'Start chat' },
  { icon: BookOpen, title: 'Documentation', description: 'Guides, API reference, and tutorials.', cta: 'Open docs' },
  { icon: LifeBuoy, title: 'Help center', description: 'Browse answers to common questions.', cta: 'Visit help center' },
];

const faqs = [
  { q: 'How do calendar conflicts get detected?', a: 'We read free/busy from your connected calendars and block overlapping times.' },
  { q: 'Can I charge for meetings?', a: 'Yes — connect Stripe and set a price on any meeting type (Pro plan).' },
  { q: 'How do round-robin meetings assign hosts?', a: 'Bookings are distributed across a host pool using fair, weighted, or priority strategies.' },
];

export default function SupportPage() {
  return (
    <div>
      <PageHeader title="Support" description="We're here to help you get the most out of the platform." />

      <Stagger className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {channels.map((c) => (
          <FadeItem key={c.title}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-3 font-semibold">{c.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.description}</p>
                <Button variant="outline" className="mt-4 w-full">
                  {c.cta}
                </Button>
              </CardContent>
            </Card>
          </FadeItem>
        ))}
      </Stagger>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact us</CardTitle>
            <CardDescription>Send us a message and we&apos;ll reply within one business day.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field id="subject" label="Subject">
              <Input id="subject" placeholder="How can we help?" />
            </Field>
            <Field id="message" label="Message">
              <textarea
                id="message"
                rows={4}
                placeholder="Describe your question or issue…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
            <Button>
              <Send className="size-4" /> Send message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Frequently asked</CardTitle>
            <CardDescription>Quick answers to common questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {faqs.map((f, i) => (
              <React.Fragment key={f.q}>
                {i > 0 ? <Separator /> : null}
                <div className="py-3">
                  <p className="text-sm font-medium">{f.q}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
                </div>
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
