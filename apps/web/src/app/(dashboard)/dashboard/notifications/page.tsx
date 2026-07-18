'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Separator, Switch } from '@invincible/ui';
import * as React from 'react';

import { PageHeader } from '@/components/dashboard/page-header';

interface Pref {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const sections: { title: string; description: string; prefs: Pref[] }[] = [
  {
    title: 'Bookings',
    description: 'Stay informed as meetings are scheduled and changed.',
    prefs: [
      { id: 'b1', label: 'New booking', description: 'When someone books a meeting.', defaultOn: true },
      { id: 'b2', label: 'Cancellations', description: 'When a booking is cancelled.', defaultOn: true },
      { id: 'b3', label: 'Reschedules', description: 'When a booking is moved.', defaultOn: true },
    ],
  },
  {
    title: 'Reminders',
    description: 'Automatic reminders sent to invitees.',
    prefs: [
      { id: 'r1', label: 'Email reminders', description: '24 hours and 1 hour before.', defaultOn: true },
      { id: 'r2', label: 'SMS reminders', description: 'Text reminders (Pro).', defaultOn: false },
      { id: 'r3', label: 'WhatsApp reminders', description: 'WhatsApp reminders (Pro).', defaultOn: false },
    ],
  },
  {
    title: 'Product',
    description: 'News and account updates.',
    prefs: [
      { id: 'p1', label: 'Weekly summary', description: 'A digest of your scheduling activity.', defaultOn: true },
      { id: 'p2', label: 'Product updates', description: 'New features and improvements.', defaultOn: false },
    ],
  },
];

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" description="Choose what you want to be notified about." />

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {section.prefs.map((pref, i) => (
                <React.Fragment key={pref.id}>
                  {i > 0 ? <Separator /> : null}
                  <label className="flex items-center justify-between gap-4 py-3">
                    <span>
                      <span className="block text-sm font-medium">{pref.label}</span>
                      <span className="block text-xs text-muted-foreground">{pref.description}</span>
                    </span>
                    <Switch defaultChecked={pref.defaultOn} aria-label={pref.label} />
                  </label>
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
