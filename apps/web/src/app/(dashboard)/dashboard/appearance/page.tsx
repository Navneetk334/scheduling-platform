'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, cn } from '@invincible/ui';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { PageHeader } from '@/components/dashboard/page-header';

const themes = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'System', icon: Monitor },
] as const;

const brandColors = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [brand, setBrand] = React.useState('#4F46E5');
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Appearance" description="Personalize how your workspace and booking pages look." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>Choose a light, dark, or system-matched interface.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          {themes.map((t) => {
            const active = mounted && theme === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors',
                  active ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-secondary',
                )}
                aria-pressed={active}
              >
                <t.icon className="size-5" aria-hidden />
                {t.label}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brand color</CardTitle>
          <CardDescription>Used for buttons and accents on your booking pages.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {brandColors.map((color) => (
            <button
              key={color}
              onClick={() => setBrand(color)}
              className="flex size-10 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              aria-label={`Select ${color}`}
            >
              {brand === color ? <Check className="size-4 text-white" aria-hidden /> : null}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking page logo</CardTitle>
          <CardDescription>Upload a logo to display on your public pages.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
            Logo
          </div>
          <Button variant="outline">Upload</Button>
        </CardContent>
      </Card>
    </div>
  );
}
