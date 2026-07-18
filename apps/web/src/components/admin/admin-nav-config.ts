import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarClock,
  Database,
  DollarSign,
  FileText,
  Flag,
  Gauge,
  Globe2,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Megaphone,
  MessageSquare,
  Percent,
  Plug,
  Receipt,
  RefreshCcw,
  Repeat,
  Server,
  Settings as SettingsIcon,
  Shield,
  ShieldCheck,
  Signal,
  Tag,
  TerminalSquare,
  TrendingDown,
  TrendingUp,
  Users,
  UsersRound,
  Wallet,
  Webhook,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Revenue Analytics', href: '/admin/revenue', icon: BarChart3 },
      { label: 'Growth Analytics', href: '/admin/growth', icon: TrendingUp },
    ],
  },
  {
    title: 'Financials',
    items: [
      { label: 'MRR', href: '/admin/mrr', icon: DollarSign },
      { label: 'ARR', href: '/admin/arr', icon: TrendingUp },
      { label: 'Churn Rate', href: '/admin/churn', icon: TrendingDown },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: Repeat },
      { label: 'Plans', href: '/admin/plans', icon: Boxes },
      { label: 'Coupons', href: '/admin/coupons', icon: Tag },
      { label: 'Payments', href: '/admin/payments', icon: Wallet },
      { label: 'Refunds', href: '/admin/refunds', icon: RefreshCcw },
      { label: 'Invoices', href: '/admin/invoices', icon: Receipt },
      { label: 'Tax Settings', href: '/admin/tax', icon: Percent },
      { label: 'Currencies', href: '/admin/currencies', icon: DollarSign },
    ],
  },
  {
    title: 'Customers',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
      { label: 'Teams', href: '/admin/teams', icon: UsersRound },
      { label: 'White Label', href: '/admin/white-label', icon: Globe2 },
      { label: 'Custom Domains', href: '/admin/domains', icon: Globe2 },
    ],
  },
  {
    title: 'Usage',
    items: [
      { label: 'Storage Usage', href: '/admin/storage', icon: HardDrive },
      { label: 'Bandwidth Usage', href: '/admin/bandwidth', icon: Signal },
      { label: 'API Usage', href: '/admin/api-usage', icon: Gauge },
    ],
  },
  {
    title: 'Logs',
    items: [
      { label: 'Webhook Logs', href: '/admin/webhook-logs', icon: Webhook },
      { label: 'System Logs', href: '/admin/system-logs', icon: TerminalSquare },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: Activity },
      { label: 'Email Logs', href: '/admin/email-logs', icon: Mail },
      { label: 'Notification Logs', href: '/admin/notification-logs', icon: Bell },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Servers', href: '/admin/servers', icon: Server },
      { label: 'Queue Monitoring', href: '/admin/queues', icon: CalendarClock },
      { label: 'Background Jobs', href: '/admin/jobs', icon: Boxes },
      { label: 'Database Status', href: '/admin/database', icon: Database },
      { label: 'Backup Management', href: '/admin/backups', icon: HardDrive },
      { label: 'Maintenance Mode', href: '/admin/maintenance', icon: Wrench },
      { label: 'Integrations', href: '/admin/integrations', icon: Plug },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Support Tickets', href: '/admin/tickets', icon: LifeBuoy },
      { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      { label: 'Knowledge Base', href: '/admin/knowledge-base', icon: FileText },
      { label: 'Email Templates', href: '/admin/email-templates', icon: Mail },
      { label: 'SMS Templates', href: '/admin/sms-templates', icon: MessageSquare },
    ],
  },
  {
    title: 'Access & Security',
    items: [
      { label: 'Roles', href: '/admin/roles', icon: ShieldCheck },
      { label: 'Permissions', href: '/admin/permissions', icon: KeyRound },
      { label: 'Security', href: '/admin/security', icon: Shield },
      { label: 'Feature Flags', href: '/admin/feature-flags', icon: Flag },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'System Settings', href: '/admin/settings', icon: SettingsIcon },
      { label: 'Countries', href: '/admin/countries', icon: Globe2 },
      { label: 'Languages', href: '/admin/languages', icon: Globe2 },
    ],
  },
];

export const adminItemsByHref: Record<string, AdminNavItem> = Object.fromEntries(
  adminNavGroups.flatMap((g) => g.items).map((i) => [i.href, i]),
);
