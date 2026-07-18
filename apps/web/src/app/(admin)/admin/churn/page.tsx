'use client';

import { LogOut, TrendingDown, Users } from 'lucide-react';
import * as React from 'react';

import { MetricPage } from '@/components/admin/metric-page';

export default function ChurnPage() {
  return (
    <MetricPage
      title="Churn Rate"
      description="Customer and revenue churn over time."
      stats={[
        { label: 'Customer churn', value: '2.1%', icon: TrendingDown, delta: -0.4, trend: [3.1, 2.9, 2.7, 2.5, 2.3, 2.2, 2.1] },
        { label: 'Revenue churn', value: '1.4%', icon: TrendingDown, delta: -0.2, trend: [2.2, 2.0, 1.8, 1.6, 1.5, 1.4, 1.4] },
        { label: 'Churned orgs (30d)', value: '27', icon: LogOut, delta: -1.1, trend: [40, 38, 35, 32, 30, 28, 27] },
        { label: 'Net retention', value: '112%', icon: Users, delta: 1.8, trend: [104, 106, 108, 109, 110, 111, 112] },
      ]}
      chart={{
        title: 'Monthly churn %',
        data: [
          { label: 'Jan', value: 31 }, { label: 'Feb', value: 29 }, { label: 'Mar', value: 27 },
          { label: 'Apr', value: 25 }, { label: 'May', value: 23 }, { label: 'Jun', value: 22 },
          { label: 'Jul', value: 21 },
        ],
      }}
    />
  );
}
