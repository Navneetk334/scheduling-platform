'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@invincible/ui';
import { Building2, DollarSign, TrendingDown, Users } from 'lucide-react';
import * as React from 'react';

import { BarChart } from '@/components/dashboard/bar-chart';
import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBadge } from '@/components/dashboard/status-badge';

const mrrByMonth = [
  { label: 'Jan', value: 42 },
  { label: 'Feb', value: 48 },
  { label: 'Mar', value: 55 },
  { label: 'Apr', value: 61 },
  { label: 'May', value: 72 },
  { label: 'Jun', value: 84 },
  { label: 'Jul', value: 98 },
];

const recentOrgs = [
  { name: 'Acme Inc', plan: 'Team', mrr: '$490', status: 'ACTIVE' },
  { name: 'Globex', plan: 'Pro', mrr: '$150', status: 'ACTIVE' },
  { name: 'Initech', plan: 'Enterprise', mrr: '$2,400', status: 'ACTIVE' },
  { name: 'Umbrella', plan: 'Free', mrr: '$0', status: 'INACTIVE' },
];

const systemStatus = [
  { label: 'API', status: 'ACTIVE' },
  { label: 'Database', status: 'ACTIVE' },
  { label: 'Redis', status: 'ACTIVE' },
  { label: 'Queue workers', status: 'ACTIVE' },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader title="Platform Overview" description="Health and growth across the entire platform." />

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FadeItem>
          <StatCard label="MRR" value="$98,240" icon={DollarSign} delta={14.2} trend={[42, 48, 55, 61, 72, 84, 98]} />
        </FadeItem>
        <FadeItem>
          <StatCard label="Active organizations" value="1,284" icon={Building2} delta={6.4} trend={[900, 980, 1040, 1100, 1180, 1240, 1284]} />
        </FadeItem>
        <FadeItem>
          <StatCard label="Total users" value="18,902" icon={Users} delta={9.1} trend={[12, 13, 14, 15, 16, 17, 18]} />
        </FadeItem>
        <FadeItem>
          <StatCard label="Churn rate" value="2.1%" icon={TrendingDown} delta={-0.4} trend={[3.1, 2.9, 2.7, 2.5, 2.3, 2.2, 2.1]} />
        </FadeItem>
      </Stagger>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>MRR growth</CardTitle>
            <CardDescription>Monthly recurring revenue ($K)</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={mrrByMonth} height={240} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System status</CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemStatus.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm">{s.label}</span>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent organizations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentOrgs.map((o) => (
            <div key={o.name} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{o.name}</p>
                <p className="text-xs text-muted-foreground">{o.plan} · {o.mrr} MRR</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
