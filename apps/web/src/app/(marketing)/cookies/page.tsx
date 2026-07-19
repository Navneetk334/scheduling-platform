import type { Metadata } from 'next';
import * as React from 'react';

import { PageHero } from '@/components/marketing/page-hero';
import { Prose } from '@/components/marketing/prose';
import { Section } from '@/components/marketing/section';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How INVINCIBLE PROS uses cookies and similar technologies, and how you can manage your preferences.',
  alternates: { canonical: '/cookies' },
};

const LAST_UPDATED = 'July 1, 2026';

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Cookie Policy" description={`Last updated ${LAST_UPDATED}`} />
      <Section>
        <Prose className="mx-auto max-w-3xl">
          <p>
            This Cookie Policy explains how INVINCIBLE PROS uses cookies and similar technologies to recognize you when
            you visit our websites and use our Services, and describes the choices available to you.
          </p>

          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help the site function,
            remember your preferences, and understand how it is used.
          </p>

          <h2>Types of cookies we use</h2>
          <ul>
            <li>
              <strong>Strictly necessary</strong> cookies enable core functionality such as authentication and
              security. The Services cannot work properly without them.
            </li>
            <li>
              <strong>Preference</strong> cookies remember choices you make, such as language or theme, to personalize
              your experience.
            </li>
            <li>
              <strong>Analytics</strong> cookies help us understand how visitors use our sites so we can improve them.
              These are aggregated and do not identify you individually.
            </li>
          </ul>

          <h2>Managing cookies</h2>
          <p>
            You can control and delete cookies through your browser settings. Most browsers let you refuse or remove
            cookies, though doing so may affect the functionality of our Services. Where required, we ask for your
            consent before setting non-essential cookies.
          </p>

          <h2>Third-party cookies</h2>
          <p>
            Some cookies may be set by third-party services we use, such as analytics and payment providers. Their use
            of cookies is governed by their own policies.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in technology or the law. Please
            revisit this page periodically to stay informed.
          </p>

          <h2>Contact us</h2>
          <p>
            Questions about our use of cookies? Email <a href="mailto:privacy@invinciblepros.com">privacy@invinciblepros.com</a>.
          </p>
        </Prose>
      </Section>
    </>
  );
}
