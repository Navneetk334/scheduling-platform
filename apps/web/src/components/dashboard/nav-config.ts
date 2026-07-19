import {
  Activity,
  BarChart3,
  Bell,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Clock,
  CreditCard,
  FileText,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Palette,
  Plug,
  Receipt,
  ShieldCheck,
  Ticket,
  Users,
  UsersRound,
  Wallet,
  Webhook,
  Settings as SettingsIcon,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Grouped navigation powering the sidebar. Order defines display order. */
export const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { label: 'Activity Logs', href: '/dashboard/activity-logs', icon: Activity },
    ],
  },
  {
    title: 'Scheduling',
    items: [
      { label: 'Bookings', href: '/dashboard/bookings', icon: CalendarDays },
      { label: 'Upcoming', href: '/dashboard/upcoming', icon: CalendarClock },
      { label: 'Calendar', href: '/dashboard/calendar', icon: CalendarRange },
      { label: 'Availability', href: '/dashboard/availability', icon: Clock },
      { label: 'Meeting Types', href: '/dashboard/meeting-types', icon: Ticket },
      { label: 'Forms', href: '/dashboard/forms', icon: FileText },
    ],
  },
  {
    title: 'Revenue',
    items: [
      { label: 'Payments', href: '/dashboard/payments', icon: Wallet },
      { label: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    ],
  },
  {
    title: 'Growth',
    items: [
      { label: 'Customers', href: '/dashboard/customers', icon: Users },
      { label: 'Integrations', href: '/dashboard/integrations', icon: Plug },
    ],
  },
  {
    title: 'Developers',
    items: [
      { label: 'API Keys', href: '/dashboard/api-keys', icon: KeyRound },
      { label: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Team', href: '/dashboard/team', icon: UsersRound },
      { label: 'Roles', href: '/dashboard/roles', icon: ShieldCheck },
      { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { label: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
      { label: 'Security', href: '/dashboard/security', icon: ShieldCheck },
      { label: 'Appearance', href: '/dashboard/appearance', icon: Palette },
      { label: 'White Label', href: '/dashboard/white-label', icon: Sparkles },
    ],
  },
  {
    title: 'Help',
    items: [{ label: 'Support', href: '/dashboard/support', icon: LifeBuoy }],
  },
];

/** Flat lookup for resolving the active page title from a pathname. */
export const navItemsByHref: Record<string, NavItem> = Object.fromEntries(
  navGroups.flatMap((group) => group.items).map((item) => [item.href, item]),
);
