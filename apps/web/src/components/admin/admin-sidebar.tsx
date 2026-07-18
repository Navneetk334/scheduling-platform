'use client';

import { Badge, Logo, cn } from '@invincible/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { adminNavGroups } from './admin-nav-config';

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        <Link href="/admin" aria-label="Super Admin home">
          <Logo showWordmark={false} />
        </Link>
        <Badge variant="default" className="gap-1">
          <span className="size-1.5 rounded-full bg-primary" /> Super Admin
        </Badge>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {adminNavGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                      )}
                    >
                      {active ? (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                      ) : null}
                      <item.icon className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
