'use client';

import { Badge, Button } from '@invincible/ui';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarCheck2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { BookingMock } from '../illustrations';
import { Aurora, DotGrid, GradientText } from '../gradient';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Aurora />
      <DotGrid />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-16 lg:grid-cols-2 lg:pb-24 lg:pt-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="size-3.5" aria-hidden />
              Scheduling, reimagined for teams
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
            className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Booking time should feel <GradientText>effortless</GradientText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
            className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground"
          >
            INVINCIBLE PROS gives your organization a beautiful, reliable scheduling platform. Publish your
            availability, share a link, and let people book you in seconds — across every timezone, calendar, and team.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button size="lg" asChild>
              <Link href="/signup">
                Start for free
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/invincible-pros/intro-call">See a live booking page</Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <CalendarCheck2 className="size-4 text-primary" aria-hidden />
            No credit card required · Free forever plan
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          className="relative"
        >
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-primary/20 to-accent/20 blur-2xl" />
          <BookingMock className="drop-shadow-xl" />
        </motion.div>
      </div>
    </section>
  );
}
