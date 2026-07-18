import { Card, CardContent } from '@invincible/ui';
import { type LucideIcon } from 'lucide-react';
import * as React from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          {description ? (
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="mt-1">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
