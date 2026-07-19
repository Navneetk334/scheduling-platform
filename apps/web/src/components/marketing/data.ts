/**
 * Centralized, original marketing content for the INVINCIBLE PROS site. Kept in
 * one place so nav, footer, and page bodies stay in sync. No third-party copy.
 */

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export const primaryNav: NavLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Enterprise', href: '/enterprise' },
];

export const resourcesNav: NavLink[] = [
  { label: 'Resources', href: '/resources', description: 'Guides, templates, and playbooks' },
  { label: 'Blog', href: '/blog', description: 'Product news and scheduling insights' },
  { label: 'Documentation', href: '/docs', description: 'Set up and configure your workspace' },
  { label: 'API', href: '/api', description: 'REST & GraphQL reference for developers' },
];

export const footerColumns: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Enterprise', href: '/enterprise' },
    ],
  },
  {
    heading: 'Developers',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Status', href: '/docs' },
      { label: 'Changelog', href: '/blog' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Resources', href: '/resources' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

export interface FeatureItem {
  title: string;
  body: string;
  /** lucide-react icon name resolved by the consumer. */
  icon: string;
}

export const coreFeatures: FeatureItem[] = [
  {
    icon: 'CalendarClock',
    title: 'Timezone-perfect availability',
    body: 'A DST-aware engine computes bookable slots across any zone, with buffers, minimum notice, and rolling windows.',
  },
  {
    icon: 'Zap',
    title: 'Conflict-free by design',
    body: 'Distributed locking and transactional seat checks guarantee zero double-bookings, even under heavy concurrent load.',
  },
  {
    icon: 'Users',
    title: 'Round-robin & collective',
    body: 'Distribute meetings fairly across a team, or require several hosts to attend — pooled availability handled automatically.',
  },
  {
    icon: 'Globe2',
    title: 'Calendar & video native',
    body: 'Two-way sync with Google, Microsoft, and Apple. Meet, Zoom, and Teams links generated the moment a booking is made.',
  },
  {
    icon: 'FormInput',
    title: 'Custom forms & routing',
    body: 'Ask the right questions, qualify leads, and route bookings to the right host with conditional logic.',
  },
  {
    icon: 'CreditCard',
    title: 'Payments & invoicing',
    body: 'Collect payment at booking with Stripe, apply coupons, and issue tax-compliant invoices with GST/VAT support.',
  },
  {
    icon: 'Bell',
    title: 'Reminders everywhere',
    body: 'Automated email, SMS, and WhatsApp reminders reduce no-shows, with rescheduling and cancellation built in.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Enterprise-grade security',
    body: 'Multi-tenant isolation, RBAC, audit logs, SSO, and a SOC 2 / GDPR-ready architecture from day one.',
  },
];

export interface HowItWorksStep {
  step: string;
  title: string;
  body: string;
}

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: '01',
    title: 'Connect your calendars',
    body: 'Link Google, Microsoft, or Apple in seconds. We read your real availability so you are never double-booked.',
  },
  {
    step: '02',
    title: 'Design your meeting types',
    body: 'Set durations, buffers, limits, locations, and custom questions. Add payments, round-robin, or group booking.',
  },
  {
    step: '03',
    title: 'Share your booking link',
    body: 'Publish a beautiful page or embed a widget. Visitors pick a time in their own timezone — no back-and-forth.',
  },
  {
    step: '04',
    title: 'Let automation take over',
    body: 'Confirmations, reminders, video links, and follow-ups fire automatically. You just show up prepared.',
  },
];

export interface Benefit {
  stat: string;
  label: string;
  body: string;
}

export const benefits: Benefit[] = [
  { stat: '73%', label: 'fewer no-shows', body: 'Multi-channel reminders and easy rescheduling keep calendars full.' },
  { stat: '9hrs', label: 'saved weekly', body: 'Teams reclaim the hours lost to scheduling emails and coordination.' },
  { stat: '2.4x', label: 'faster booking', body: 'A frictionless flow means visitors book on the first visit, not the third.' },
  { stat: '99.99%', label: 'uptime SLA', body: 'A resilient, horizontally-scalable architecture your business can trust.' },
];

export interface Integration {
  name: string;
  category: string;
  initials: string;
}

export const integrations: Integration[] = [
  { name: 'Google Calendar', category: 'Calendar', initials: 'GC' },
  { name: 'Microsoft Outlook', category: 'Calendar', initials: 'MS' },
  { name: 'Apple Calendar', category: 'Calendar', initials: 'AC' },
  { name: 'Google Meet', category: 'Video', initials: 'GM' },
  { name: 'Zoom', category: 'Video', initials: 'ZM' },
  { name: 'Microsoft Teams', category: 'Video', initials: 'MT' },
  { name: 'Stripe', category: 'Payments', initials: 'ST' },
  { name: 'Slack', category: 'Messaging', initials: 'SL' },
  { name: 'Discord', category: 'Messaging', initials: 'DC' },
  { name: 'Zapier', category: 'Automation', initials: 'ZP' },
  { name: 'Salesforce', category: 'CRM', initials: 'SF' },
  { name: 'HubSpot', category: 'CRM', initials: 'HS' },
];

export interface Industry {
  name: string;
  body: string;
  icon: string;
}

export const industries: Industry[] = [
  { icon: 'Briefcase', name: 'Sales teams', body: 'Route inbound leads instantly and book demos while intent is high.' },
  { icon: 'HeartPulse', name: 'Healthcare', body: 'Patient-friendly booking with reminders, intake forms, and privacy.' },
  { icon: 'GraduationCap', name: 'Education', body: 'Office hours, tutoring, and admissions calls without the email chaos.' },
  { icon: 'Scale', name: 'Consulting', body: 'Sell time directly — collect payment and qualify clients up front.' },
  { icon: 'Users', name: 'Agencies', body: 'Coordinate client calls across teams with round-robin and pooling.' },
  { icon: 'Code2', name: 'Developers', body: 'Automate everything through a first-class REST and GraphQL API.' },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'We replaced three tools with INVINCIBLE PROS. Round-robin routing alone cut our time-to-meeting in half and our reps love it.',
    name: 'Priya Nair',
    role: 'VP Revenue Ops, Northwind',
    initials: 'PN',
  },
  {
    quote:
      'The booking pages feel like a part of our product, not a bolt-on. White-label and custom domains made that effortless.',
    name: 'Marcus Feld',
    role: 'Head of Product, Lumen Health',
    initials: 'MF',
  },
  {
    quote:
      'The API is genuinely excellent. We built our entire patient intake flow on it in a weekend, webhooks and all.',
    name: 'Dana Okafor',
    role: 'Staff Engineer, CareBridge',
    initials: 'DO',
  },
  {
    quote:
      'Timezones used to be a nightmare for our global team. Now bookings just work, and no-shows dropped dramatically.',
    name: 'Sven Larsson',
    role: 'COO, Atlas Consulting',
    initials: 'SL',
  },
];

export const trustedCompanies = ['Northwind', 'Lumen Health', 'CareBridge', 'Atlas', 'Vertex', 'Meridian'];

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: 'How is INVINCIBLE PROS different from other scheduling tools?',
    a: 'We built an original platform focused on reliability at scale — a conflict-free booking engine, first-class multi-tenancy, native payments with tax support, and a genuinely complete API. It is designed for teams and enterprises, not just individuals.',
  },
  {
    q: 'Do I need a credit card to start?',
    a: 'No. The Free plan is available forever with no card required. Paid plans include a 14-day trial so you can evaluate advanced features risk-free.',
  },
  {
    q: 'Can I connect multiple calendars?',
    a: 'Yes. Connect Google, Microsoft, and Apple calendars and we check all of them for conflicts. Higher plans allow more connected calendars per user.',
  },
  {
    q: 'Does it support payments and invoices?',
    a: 'Absolutely. Collect payment at the time of booking through Stripe, apply coupons, and automatically issue invoices with GST and VAT tax handling.',
  },
  {
    q: 'Is my data secure?',
    a: 'Security is foundational. We use strict tenant isolation, role-based access control, audit logging, and encryption in transit and at rest, on a SOC 2 and GDPR-ready architecture.',
  },
  {
    q: 'Can I white-label the experience?',
    a: 'Yes. Business and Enterprise plans support custom domains and white-label branding so booking pages feel like a native part of your product.',
  },
];

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  date: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'designing-a-conflict-free-booking-engine',
    title: 'Designing a conflict-free booking engine',
    excerpt: 'How we use distributed locks and transactional seat checks to guarantee zero double-bookings at scale.',
    category: 'Engineering',
    readMinutes: 8,
    date: '2026-07-02',
  },
  {
    slug: 'the-hidden-cost-of-scheduling-back-and-forth',
    title: 'The hidden cost of scheduling back-and-forth',
    excerpt: 'We measured how much time teams lose coordinating meetings — and how to win most of it back.',
    category: 'Productivity',
    readMinutes: 5,
    date: '2026-06-18',
  },
  {
    slug: 'round-robin-routing-that-actually-feels-fair',
    title: 'Round-robin routing that actually feels fair',
    excerpt: 'A look at the weighting and availability pooling behind fair, fast lead distribution.',
    category: 'Product',
    readMinutes: 6,
    date: '2026-05-29',
  },
];
