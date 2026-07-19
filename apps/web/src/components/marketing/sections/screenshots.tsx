'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@invincible/ui';
import * as React from 'react';

import { BookingMock, ConnectGraphic } from '../illustrations';
import { Section, SectionHeading } from '../section';

const tabs = [
  {
    value: 'booking',
    label: 'Booking pages',
    title: 'Booking pages your visitors love',
    body: 'A polished, accessible flow that adapts to each visitor’s timezone and gets them booked in a couple of taps.',
    render: () => <BookingMock />,
  },
  {
    value: 'calendars',
    label: 'Connected calendars',
    title: 'One source of truth',
    body: 'Two-way sync keeps every calendar aligned, so availability is always accurate and conflicts never happen.',
    render: () => <ConnectGraphic className="mx-auto max-w-md" />,
  },
  {
    value: 'dashboard',
    label: 'Team dashboard',
    title: 'Command your schedule',
    body: 'Manage meeting types, routing, payments, and analytics from a single premium workspace built for teams.',
    render: () => <BookingMock />,
  },
];

export function Screenshots() {
  return (
    <Section id="screenshots" className="bg-muted/20">
      <SectionHeading
        eyebrow="Product tour"
        title="A product that feels as good as it works"
        description="Every surface is crafted for clarity and speed — from the visitor’s first click to your team’s daily workflow."
      />

      <Tabs defaultValue="booking" className="mt-12">
        <TabsList className="mx-auto flex w-fit flex-wrap justify-center">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-8">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <h3 className="text-2xl font-semibold tracking-tight">{t.title}</h3>
                <p className="mt-3 text-muted-foreground">{t.body}</p>
              </div>
              <div className="order-1 rounded-3xl border border-border bg-card/50 p-6 lg:order-2">
                {t.render()}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Section>
  );
}
