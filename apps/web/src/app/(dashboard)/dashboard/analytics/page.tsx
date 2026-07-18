'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@invincible/ui';
import { CalendarCheck, Clock, Percent, UserPlus } from 'lucide-react';
import * as React from 'react';

import { BarChart } from '@/components/dashboard/bar-chart';
import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';

const monthly = [
  { label: 'Jan', value: 120 },
  { label: 'Feb', value: 150 },
  { label: 'Mar', value: 180 },
  { label: 'Apr', value: 160 },
  { label: 'May', value: 220 },
  { label: 'Jun', value: 280 },
  { label: 'Jul', value: 342 },
];

const topTypes = [
  { name: 'Intro Call', share: 46 },
  { name: 'Strategy Session', share: 28 },
  { name: 'Product Demo', share: 18 },
  { name: 'Office Hours', share: 8 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" description="Understand how your scheduling is performing." />

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FadeItem>
          <StatCard label="Total bookings" value="1,482" icon={CalendarCheck} delta={12.4} trend={[120, 150, 180, 160, 220, 280, 342]} />
        </FadeItem>
        <FadeItem>
          <StatCard label="Avg. booking time" value="27m" icon={Clock} delta={-4.2} trend={[32, 31, 30, 29, 28, 28, 27]} />
        </FadeItem>
        <FadeItem>
          <StatCard label="Conversion rate" value="64%" icon={Percent} delta={3.2} trend={[48, 52, 55, 58, 60, 62, 64]} />
        </FadeItem>
        <FadeItem>
          <StatCard label="New customers" value="216" icon={UserPlus} delta={9.7} trend={[20, 24, 28, 30, 33, 38, 42]} />
        </FadeItem>
      </Stagger>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bookings over time</CardTitle>
            <CardDescription>Monthly confirmed bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={monthly} height={240} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top meeting types</CardTitle>
            <CardDescription>Share of bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topTypes.map((t) => (
              <div key={t.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">{t.share}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${t.share}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
