import type { Metadata } from 'next';
import * as React from 'react';

import { PageHero } from '@/components/marketing/page-hero';
import { Prose } from '@/components/marketing/prose';
import { Section } from '@/components/marketing/section';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms and conditions that govern your use of the INVINCIBLE PROS platform.',
  alternates: { canonical: '/terms' },
};

const LAST_UPDATED = 'July 1, 2026';

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" description={`Last updated ${LAST_UPDATED}`} />
      <Section>
        <Prose className="mx-auto max-w-3xl">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the INVINCIBLE PROS platform,
            websites, and APIs (the &ldquo;Services&rdquo;). By using the Services, you agree to these Terms.
          </p>

          <h2>Your account</h2>
          <p>
            You are responsible for maintaining the security of your account and for all activity that occurs under it.
            You must provide accurate information and promptly update it as needed. You must be at least the age of
            majority in your jurisdiction to use the Services.
          </p>

          <h2>Acceptable use</h2>
          <p>You agree not to misuse the Services. In particular, you will not:</p>
          <ul>
            <li>Violate any law or the rights of others, including intellectual property rights.</li>
            <li>Send spam or unsolicited messages, or engage in fraudulent or deceptive activity.</li>
            <li>Attempt to disrupt, reverse engineer, or gain unauthorized access to the Services.</li>
            <li>Use the Services to store or transmit malicious code or harmful content.</li>
          </ul>

          <h2>Subscriptions and billing</h2>
          <p>
            Paid plans are billed in advance on a recurring basis. Fees are non-refundable except as required by law or
            expressly stated. You may upgrade, downgrade, or cancel at any time; changes take effect according to your
            billing cycle, with proration where applicable.
          </p>

          <h2>Free trials</h2>
          <p>
            We may offer free trials. Unless you cancel before the trial ends, your plan will convert to a paid
            subscription at the then-current rate.
          </p>

          <h2>Intellectual property</h2>
          <p>
            The Services, including all original software, design, and branding, are owned by INVINCIBLE PROS and
            protected by law. You retain ownership of the content and data you submit, and grant us the limited rights
            needed to operate the Services.
          </p>

          <h2>Termination</h2>
          <p>
            You may stop using the Services at any time. We may suspend or terminate access if you violate these Terms
            or to protect the Services. Upon termination, your right to use the Services ends immediately.
          </p>

          <h2>Disclaimers and liability</h2>
          <p>
            The Services are provided &ldquo;as is&rdquo; without warranties of any kind to the extent permitted by law.
            To the maximum extent permitted, INVINCIBLE PROS will not be liable for indirect, incidental, or
            consequential damages.
          </p>

          <h2>Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. If we make material changes, we will provide notice. Continued
            use of the Services after changes take effect constitutes acceptance.
          </p>

          <h2>Contact us</h2>
          <p>
            Questions about these Terms? Email <a href="mailto:legal@invinciblepros.com">legal@invinciblepros.com</a>.
          </p>
        </Prose>
      </Section>
    </>
  );
}
