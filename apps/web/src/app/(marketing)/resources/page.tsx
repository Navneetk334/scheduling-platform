import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

import { BookOpen, Code2, FileText, GraduationCap, LifeBuoy, Newspaper } from 'lucide-react';

import { PageHero } from '@/components/marketing/page-hero';
import { Section } from '@/components/marketing/section';
import { Cta } from '@/components/marketing/sections/cta';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Guides, templates, documentation, and product news to help you get the most out of INVINCIBLE PROS.',
  alternates: { canonical: '/resources' },
};

const resources = [
  { icon: Newspaper, title: 'Blog', body: 'Product news, engineering deep-dives, and scheduling insights.', href: '/blog' },
  { icon: BookOpen, title: 'Documentation', body: 'Step-by-step guides to set up and configure your workspace.', href: '/docs' },
  { icon: Code2, title: 'API Reference', body: 'Everything developers need to build on the REST and GraphQL APIs.', href: '/api' },
  { icon: GraduationCap, title: 'Guides & playbooks', body: 'Best practices for sales, support, healthcare, and more.', href: '/blog' },
  { icon: FileText, title: 'Templates', body: 'Ready-made meeting types and booking flows to copy in one click.', href: '/docs' },
  { icon: LifeBuoy, title: 'Help center', body: 'Answers to common questions and troubleshooting steps.', href: '/contact' },
];

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Everything you need to succeed"
        description="Learn, build, and grow with guides, docs, and hands-on resources from the INVINCIBLE PROS team."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <Link
              key={r.title}
              href={r.href}
              className="group rounded-2xl border border-border bg-card/50 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                <r.icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold group-hover:text-primary">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Cta />
    </>
  );
}
