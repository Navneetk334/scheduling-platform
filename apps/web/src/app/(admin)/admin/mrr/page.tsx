'use client';

import { ArrowUpRight, DollarSign, TrendingUp } from 'lucide-react';
import * as React from 'react';

import { MetricPage } from '@/components/admin/metric-page';

export default function MrrPage() {
  return (
    <MetricPage
      title="MRR"
      description="Monthly recurring revenue and its movements."
      stats={[
        { label: 'MRR', value: '$98,240', icon: DollarSign, delta: 14.2, trend: [42, 48, 55, 61, 72, 84, 98] },
        { label: 'New MRR', value: '$12,400', icon: ArrowUpRight, delta: 8.1, trend: [8, 9, 10, 11, 11, 12, 12] },
        { label: 'Expansion MRR', value: '$4,100', icon: TrendingUp, delta: 5.5, trend: [2, 3, 3, 3, 4, 4, 4] },
        { label: 'Churned MRR', value: '-$2,050', icon: TrendingUp, delta: -1.2, trend: [3, 3, 2, 2, 2, 2, 2] },
      ]}
      chart={{
        title: 'MRR trend',
        description: 'Monthly recurring revenue ($K)',
        data: [
          { label: 'Jan', value: 42 }, { label: 'Feb', value: 48 }, { label: 'Mar', value: 55 },
          { label: 'Apr', value: 61 }, { label: 'May', value: 72 }, { label: 'Jun', value: 84 },
          { label: 'Jul', value: 98 },
        ],
      }}
    />
  );
}
