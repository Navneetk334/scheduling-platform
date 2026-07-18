import { Card, CardContent, cn } from '@invincible/ui';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import * as React from 'react';

import { Sparkline } from './sparkline';

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Percentage change; positive = up (good), negative = down. */
  delta?: number;
  deltaSuffix?: string;
  trend?: number[];
}

export function StatCard({ label, value, icon: Icon, delta, deltaSuffix = 'vs last month', trend }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          </div>
          {Icon ? (
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden />
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          {delta !== undefined ? (
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium',
                  positive ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive',
                )}
              >
                {positive ? (
                  <ArrowUpRight className="size-3" aria-hidden />
                ) : (
                  <ArrowDownRight className="size-3" aria-hidden />
                )}
                {Math.abs(delta)}%
              </span>
              <span className="text-muted-foreground">{deltaSuffix}</span>
            </div>
          ) : (
            <span />
          )}
          {trend && trend.length > 1 ? (
            <Sparkline
              data={trend}
              className={positive ? 'text-success' : 'text-destructive'}
              width={96}
              height={32}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
