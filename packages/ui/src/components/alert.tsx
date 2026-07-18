import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:size-4 [&>svg]:mr-2',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        info: 'border-primary/30 bg-primary/5 text-foreground',
        success: 'border-success/30 bg-success/10 text-foreground',
        warning: 'border-warning/40 bg-warning/10 text-foreground',
        destructive: 'border-destructive/40 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
}
