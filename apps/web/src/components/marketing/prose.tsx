import { cn } from '@invincible/ui';
import * as React from 'react';

/**
 * Long-form content wrapper with tuned typographic rhythm. Avoids depending on
 * the Tailwind typography plugin by styling descendants directly.
 */
export function Prose({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'max-w-none text-[15px] leading-7 text-muted-foreground',
        '[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground',
        '[&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground',
        '[&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6',
        '[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6',
        '[&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline',
        '[&_strong]:font-semibold [&_strong]:text-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}
