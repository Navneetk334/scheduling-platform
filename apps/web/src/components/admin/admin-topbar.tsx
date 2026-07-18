'use client';

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from '@invincible/ui';
import { ArrowLeft, LogOut, Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { signOut } from '@/lib/auth-client';

import { adminItemsByHref } from './admin-nav-config';

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export function AdminTopbar({ user, onOpenSidebar }: { user: { name: string; email: string }; onOpenSidebar: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const title = adminItemsByHref[pathname]?.label ?? 'Super Admin';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation" onClick={onOpenSidebar}>
        <Menu className="size-5" aria-hidden />
      </Button>
      <h1 className="text-base font-semibold tracking-tight">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input type="search" placeholder="Global search…" aria-label="Global search" className="h-9 w-64 pl-9" />
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="size-4" aria-hidden /> Exit admin
          </Link>
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center rounded-full outline-none ring-ring focus-visible:ring-2" aria-label="Account menu">
              <Avatar className="size-9">
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
              <span className="block truncate">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void signOut().then(() => router.replace('/login'))}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
