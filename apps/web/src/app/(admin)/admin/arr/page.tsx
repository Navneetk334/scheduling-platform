'use client';

import { DollarSign, TrendingUp } from 'lucide-react';
import * as React from 'react';

import { MetricPage } from '@/components/admin/metric-page';

export default function ArrPage() {
  return (
    <MetricPage
      title="ARR"
      description="Annual recurring revenue and run-rate."
      stats={[
        { label: 'ARR', value: '$1.18M', icon: DollarSign, delta: 14.2, trend: [500, 580, 660, 730, 860, 1000, 1180] },
        { label: 'ARR run-rate', value: '$1.24M', icon: TrendingUp, delta: 15.1, trend: [520, 600, 690, 760, 900, 1050, 1240] },
        { label: 'Avg. ARR / org', value: '$918', icon: DollarSign, delta: 3.4, trend: [820, 840, 860, 880, 900, 910, 918] },
        { label: 'YoY growth', value: '+112%', icon: TrendingUp, delta: 12.0, trend: [60, 70, 80, 90, 100, 108, 112] },
      ]}
      chart={{
        title: 'ARR trend',
        description: 'Annual recurring revenue ($K)',
        data: [
          { label: 'Q1', value: 660 }, { label: 'Q2', value: 860 }, { label: 'Q3', value: 1050 },
          { label: 'Q4', value: 1180 },
        ],
      }}
    />
  );
}
