'use client';

import { Button } from '@invincible/ui';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

export function Cta() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-accent px-8 py-16 text-center text-primary-foreground sm:px-16">
        {/* decorative glows */}
        <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -right-16 size-64 rounded-full bg-white/10 blur-3xl" aria-hidden />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to make scheduling effortless?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/90">
            Join the teams who booked back their time with INVINCIBLE PROS. Get started free — no credit card required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">
                Start for free
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="border border-white/40 bg-transparent text-primary-foreground hover:bg-white/10"
            >
              <Link href="/contact">Talk to sales</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
