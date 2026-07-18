'use client';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@invincible/ui';
import { Globe, Plus } from 'lucide-react';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';

interface Profile {
  id: string;
  name: string;
  timeZone: string;
  isDefault: boolean;
  hours: { day: string; range: string }[];
}

const profiles: Profile[] = [
  {
    id: '1',
    name: 'Working Hours',
    timeZone: 'America/New_York',
    isDefault: true,
    hours: [
      { day: 'Mon', range: '9:00 AM – 5:00 PM' },
      { day: 'Tue', range: '9:00 AM – 5:00 PM' },
      { day: 'Wed', range: '9:00 AM – 5:00 PM' },
      { day: 'Thu', range: '9:00 AM – 5:00 PM' },
      { day: 'Fri', range: '9:00 AM – 5:00 PM' },
      { day: 'Sat', range: 'Unavailable' },
      { day: 'Sun', range: 'Unavailable' },
    ],
  },
  {
    id: '2',
    name: 'Evenings & Weekends',
    timeZone: 'America/New_York',
    isDefault: false,
    hours: [
      { day: 'Mon', range: '6:00 PM – 9:00 PM' },
      { day: 'Sat', range: '10:00 AM – 2:00 PM' },
      { day: 'Sun', range: '10:00 AM – 2:00 PM' },
    ],
  },
];

export default function AvailabilityPage() {
  return (
    <div>
      <PageHeader
        title="Availability"
        description="Define the hours people can book with you."
        actions={
          <Button size="sm">
            <Plus className="size-4" /> New schedule
          </Button>
        }
      />

      <Stagger className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {profiles.map((p) => (
          <FadeItem key={p.id}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  {p.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Globe className="size-3.5" aria-hidden /> {p.timeZone}
                </span>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {p.hours.map((h) => (
                  <div key={h.day} className="flex items-center justify-between text-sm">
                    <span className="w-10 font-medium text-muted-foreground">{h.day}</span>
                    <span className={h.range === 'Unavailable' ? 'text-muted-foreground/60' : 'text-foreground'}>
                      {h.range}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </FadeItem>
        ))}
      </Stagger>
    </div>
  );
}
