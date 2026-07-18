'use client';

import { CreditCard, DollarSign, Receipt, RefreshCcw } from 'lucide-react';
import * as React from 'react';

import { MetricPage } from '@/components/admin/metric-page';

export default function RevenueAnalyticsPage() {
  return (
    <MetricPage
      title="Revenue Analytics"
      description="Gross revenue, refunds, and net across the platform."
      stats={[
        { label: 'Gross revenue (30d)', value: '$142,800', icon: DollarSign, delta: 12.4, trend: [90, 100, 110, 120, 130, 138, 142] },
        { label: 'Net revenue (30d)', value: '$137,120', icon: CreditCard, delta: 11.8, trend: [88, 96, 106, 116, 126, 132, 137] },
        { label: 'Refunds (30d)', value: '$5,680', icon: RefreshCcw, delta: -3.1, trend: [8, 7, 7, 6, 6, 6, 5] },
        { label: 'Avg. invoice', value: '$486', icon: Receipt, delta: 2.2, trend: [450, 460, 468, 474, 480, 484, 486] },
      ]}
      chart={{
        title: 'Revenue by month',
        description: 'Net revenue ($K)',
        data: [
          { label: 'Jan', value: 88 }, { label: 'Feb', value: 96 }, { label: 'Mar', value: 106 },
          { label: 'Apr', value: 116 }, { label: 'May', value: 126 }, { label: 'Jun', value: 132 },
          { label: 'Jul', value: 137 },
        ],
      }}
    />
  );
}
