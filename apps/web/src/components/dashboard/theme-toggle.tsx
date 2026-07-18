'use client';

import { Button } from '@invincible/ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

const order = ['light', 'dark', 'system'] as const;
type ThemeChoice = (typeof order)[number];

const icons: Record<ThemeChoice, React.ReactNode> = {
  light: <Sun className="size-4" aria-hidden />,
  dark: <Moon className="size-4" aria-hidden />,
  system: <Monitor className="size-4" aria-hidden />,
};

/** Cycles light → dark → system. Avoids hydration mismatch via mount guard. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = (mounted ? (theme as ThemeChoice) : 'system') ?? 'system';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Theme: ${current}. Click to change.`}
      onClick={() => {
        const next = order[(order.indexOf(current) + 1) % order.length]!;
        setTheme(next);
      }}
    >
      {mounted ? icons[current] : <Monitor className="size-4" aria-hidden />}
    </Button>
  );
}
