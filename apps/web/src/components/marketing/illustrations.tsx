import { cn } from '@invincible/ui';
import * as React from 'react';

/**
 * Original, hand-authored SVG illustrations for the marketing site. All shapes
 * are drawn from scratch — no third-party or copied assets. Gradients reference
 * the brand tokens via CSS custom properties.
 */

function GradientDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--accent))" />
      </linearGradient>
    </defs>
  );
}

/** Stylized product mock: a booking page with a mini calendar + time slots. */
export function BookingMock({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 360"
      className={cn('h-auto w-full', className)}
      role="img"
      aria-label="Illustration of an INVINCIBLE PROS booking page"
    >
      <GradientDefs id="bookingGrad" />
      <rect x="8" y="8" width="504" height="344" rx="20" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
      {/* window chrome */}
      <circle cx="36" cy="36" r="5" fill="hsl(var(--muted-foreground)/0.4)" />
      <circle cx="54" cy="36" r="5" fill="hsl(var(--muted-foreground)/0.25)" />
      <circle cx="72" cy="36" r="5" fill="hsl(var(--muted-foreground)/0.15)" />
      {/* left: host card */}
      <rect x="28" y="70" width="200" height="258" rx="14" fill="hsl(var(--muted)/0.5)" />
      <circle cx="60" cy="108" r="20" fill="url(#bookingGrad)" />
      <rect x="92" y="98" width="96" height="10" rx="5" fill="hsl(var(--foreground)/0.7)" />
      <rect x="92" y="116" width="64" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.5)" />
      <rect x="48" y="150" width="160" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.35)" />
      <rect x="48" y="168" width="140" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.25)" />
      <rect x="48" y="200" width="120" height="10" rx="5" fill="url(#bookingGrad)" />
      <rect x="48" y="230" width="160" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.3)" />
      <rect x="48" y="248" width="110" height="8" rx="4" fill="hsl(var(--muted-foreground)/0.22)" />
      {/* right: calendar grid */}
      <rect x="248" y="70" width="240" height="180" rx="14" fill="hsl(var(--muted)/0.4)" />
      {Array.from({ length: 28 }).map((_, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const selected = i === 16;
        return (
          <rect
            key={i}
            x={266 + col * 30}
            y={92 + row * 34}
            width="22"
            height="22"
            rx="6"
            fill={selected ? 'url(#bookingGrad)' : 'hsl(var(--foreground)/0.06)'}
          />
        );
      })}
      {/* time slots */}
      <rect x="248" y="266" width="112" height="30" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
      <rect x="268" y="278" width="72" height="6" rx="3" fill="hsl(var(--muted-foreground)/0.5)" />
      <rect x="376" y="266" width="112" height="30" rx="8" fill="url(#bookingGrad)" />
      <rect x="396" y="278" width="72" height="6" rx="3" fill="hsl(var(--primary-foreground)/0.9)" />
      <rect x="248" y="304" width="240" height="30" rx="8" fill="url(#bookingGrad)" />
      <rect x="336" y="316" width="64" height="6" rx="3" fill="hsl(var(--primary-foreground)/0.9)" />
    </svg>
  );
}

/** Abstract "connected calendars" node graph. */
export function ConnectGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={cn('h-auto w-full', className)} role="img" aria-label="Connected calendars illustration">
      <GradientDefs id="connGrad" />
      <line x1="200" y1="150" x2="80" y2="70" stroke="hsl(var(--border))" strokeWidth="2" />
      <line x1="200" y1="150" x2="330" y2="80" stroke="hsl(var(--border))" strokeWidth="2" />
      <line x1="200" y1="150" x2="90" y2="240" stroke="hsl(var(--border))" strokeWidth="2" />
      <line x1="200" y1="150" x2="320" y2="230" stroke="hsl(var(--border))" strokeWidth="2" />
      <circle cx="200" cy="150" r="42" fill="url(#connGrad)" />
      <rect x="184" y="134" width="32" height="32" rx="7" fill="hsl(var(--primary-foreground)/0.9)" />
      {[
        [80, 70],
        [330, 80],
        [90, 240],
        [320, 230],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="24" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
      ))}
    </svg>
  );
}

/** Decorative wave divider. */
export function WaveDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 120" className={cn('h-auto w-full', className)} preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 64 C 240 8, 480 8, 720 48 C 960 88, 1200 112, 1440 72 L 1440 120 L 0 120 Z"
        fill="hsl(var(--muted)/0.5)"
      />
    </svg>
  );
}
