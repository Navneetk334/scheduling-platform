'use client';

import { Spinner } from '@invincible/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { useSession } from '@/lib/auth-client';

import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

/**
 * Super Admin shell: platform-wide navigation rail, glassy topbar, mobile
 * drawer and animated content. Requires an authenticated session (platform
 * role enforcement is applied server-side once the admin role is provisioned).
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isPending && !session) router.replace('/login');
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading admin console" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card md:block">
        <AdminSidebar />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-label="Admin navigation"
            >
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="md:pl-64">
        <AdminTopbar
          user={{ name: session.user.name, email: session.user.email }}
          onOpenSidebar={() => setMobileOpen(true)}
        />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
