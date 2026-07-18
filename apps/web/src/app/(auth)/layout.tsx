import { Logo } from '@invincible/ui';
import Link from 'next/link';
import * as React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
