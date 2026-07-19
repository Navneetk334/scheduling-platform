import * as React from 'react';

import { faqs } from '../data';
import { FaqAccordion } from '../faq-accordion';
import { Section, SectionHeading } from '../section';

export function Faq() {
  return (
    <Section id="faq">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading
          centered={false}
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything you need to know before getting started. Still curious? Our team is one message away."
        />
        <FaqAccordion items={faqs} />
      </div>
    </Section>
  );
}
