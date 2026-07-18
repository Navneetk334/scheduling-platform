'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@invincible/ui';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

import { BarChart, type BarDatum } from '@/components/dashboard/bar-chart';
import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';

export interface MetricStat {
  label: string;
  value: string;
  icon?: LucideIcon;
  delta?: number;
  trend?: number[];
}

interface MetricPageProps {
  title: string;
  description: string;
  stats: MetricStat[];
  chart?: { title: string; description?: string; data: BarDatum[] };
  children?: React.ReactNode;
}

/** Reusable analytics layout: a stat-card row plus an optional bar chart. */
export function MetricPage({ title, description, stats, chart, children }: MetricPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <FadeItem key={s.label}>
            <StatCard label={s.label} value={s.value} icon={s.icon} delta={s.delta} trend={s.trend} />
          </FadeItem>
        ))}
      </Stagger>
      {chart ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{chart.title}</CardTitle>
            {chart.description ? <CardDescription>{chart.description}</CardDescription> : null}
          </CardHeader>
          <CardContent>
            <BarChart data={chart.data} height={240} />
          </CardContent>
        </Card>
      ) : null}
      {children}
    </div>
  );
}
