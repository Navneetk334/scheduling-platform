import type { Metadata } from 'next';
import * as React from 'react';

import { PageHero } from '@/components/marketing/page-hero';
import { Prose } from '@/components/marketing/prose';
import { Section } from '@/components/marketing/section';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How INVINCIBLE PROS collects, uses, and protects your personal data.',
  alternates: { canonical: '/privacy' },
};

const LAST_UPDATED = 'July 1, 2026';

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" description={`Last updated ${LAST_UPDATED}`} />
      <Section>
        <Prose className="mx-auto max-w-3xl">
          <p>
            This Privacy Policy explains how INVINCIBLE PROS (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, and
            safeguards information when you use our scheduling platform and websites (the &ldquo;Services&rdquo;). We are
            committed to protecting your privacy and handling your data transparently.
          </p>

          <h2>Information we collect</h2>
          <p>We collect information in the following ways:</p>
          <ul>
            <li>
              <strong>Account information</strong> you provide, such as your name, email address, organization, and
              billing details.
            </li>
            <li>
              <strong>Scheduling data</strong>, including meeting types, availability, bookings, and invitee details
              submitted through booking pages.
            </li>
            <li>
              <strong>Connected services data</strong> from calendars and integrations you authorize, used solely to
              provide the Services.
            </li>
            <li>
              <strong>Usage and device data</strong>, such as log data, IP address, and browser type, collected
              automatically to secure and improve the Services.
            </li>
          </ul>

          <h2>How we use information</h2>
          <p>
            We use personal data to provide and maintain the Services, process bookings and payments, send
            transactional messages and reminders, prevent fraud and abuse, comply with legal obligations, and improve
            our product. We do not sell your personal data.
          </p>

          <h2>Legal bases</h2>
          <p>
            Where applicable, we process personal data on the basis of contract performance, our legitimate interests,
            your consent, and compliance with legal obligations.
          </p>

          <h2>Data sharing</h2>
          <p>
            We share data with service providers (such as payment, email, and hosting providers) who process it on our
            behalf under contractual safeguards, and with the calendar and integration services you connect. We may
            disclose information when required by law.
          </p>

          <h2>Data retention</h2>
          <p>
            We retain personal data for as long as your account is active or as needed to provide the Services, and
            thereafter as required to comply with our legal obligations, resolve disputes, and enforce agreements.
          </p>

          <h2>Your rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct, delete, or export your personal data,
            and to object to or restrict certain processing. To exercise these rights, contact us at the address below.
          </p>

          <h2>Security</h2>
          <p>
            We use encryption in transit and at rest, strict tenant isolation, access controls, and audit logging on a
            SOC 2 and GDPR-ready architecture. No method of transmission is perfectly secure, but we work hard to
            protect your data.
          </p>

          <h2>International transfers</h2>
          <p>
            Your data may be processed in countries other than your own. Where we transfer data internationally, we
            rely on appropriate safeguards such as standard contractual clauses.
          </p>

          <h2>Contact us</h2>
          <p>
            Questions about this policy? Email <a href="mailto:privacy@invinciblepros.com">privacy@invinciblepros.com</a>.
          </p>
        </Prose>
      </Section>
    </>
  );
}
