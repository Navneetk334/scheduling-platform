'use client';

import { Button, Input, Logo, cn } from '@invincible/ui';
import { Check } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { footerColumns } from './data';

/** Minimal, original social glyphs (no third-party brand assets). */
const socials: { label: string; href: string; path: string }[] = [
  { label: 'X', href: '#', path: 'M3 3l7.5 9L3.5 21H6l6-7 5.5 7H21l-8-9.6L20.5 3H18l-5.4 6.4L7.8 3H3z' },
  { label: 'LinkedIn', href: '#', path: 'M4 4h4v4H4zM4 10h4v10H4zM11 10h4v1.6c.7-1.1 2-1.9 3.5-1.9 2.5 0 3.5 1.6 3.5 4.4V20h-4v-5c0-1.3-.5-2-1.6-2s-1.9.9-1.9 2.2V20h-3.5z' },
  { label: 'GitHub', href: '#', path: 'M12 3a9 9 0 00-2.8 17.5c.4.1.6-.2.6-.4v-1.6c-2.5.5-3-1.2-3-1.2-.4-1-.9-1.3-.9-1.3-.8-.5 0-.5 0-.5.9.1 1.3.9 1.3.9.8 1.3 2 1 2.5.7.1-.6.3-1 .5-1.2-2-.2-4-1-4-4.4 0-1 .3-1.8.9-2.4-.1-.3-.4-1.2.1-2.4 0 0 .7-.2 2.4.9a8.3 8.3 0 014.4 0c1.7-1.1 2.4-.9 2.4-.9.5 1.2.2 2.1.1 2.4.6.6.9 1.4.9 2.4 0 3.4-2 4.2-4 4.4.3.3.6.9.6 1.8v2.6c0 .2.2.5.6.4A9 9 0 0012 3z' },
];

export function MarketingFooter() {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand + newsletter */}
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              The scheduling platform for teams that value their time. Built by INVINCIBLE PROS.
            </p>

            <form className="mt-6" onSubmit={onSubscribe} aria-label="Subscribe to the newsletter">
              <label htmlFor="footer-email" className="text-sm font-medium">
                Get product updates
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribed}
                  aria-describedby="footer-email-status"
                />
                <Button type="submit" disabled={subscribed}>
                  {subscribed ? <Check className="size-4" aria-hidden /> : 'Subscribe'}
                </Button>
              </div>
              <p
                id="footer-email-status"
                className={cn('mt-2 text-xs', subscribed ? 'text-primary' : 'text-muted-foreground')}
                role="status"
              >
                {subscribed ? 'Thanks — you are on the list!' : 'No spam. Unsubscribe anytime.'}
              </p>
            </form>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerColumns.map((col) => (
              <div key={col.heading}>
                <h3 className="text-sm font-semibold">{col.heading}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={`${col.heading}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} INVINCIBLE PROS. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
