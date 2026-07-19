import {
  Bell,
  Briefcase,
  CalendarClock,
  Code2,
  CreditCard,
  FormInput,
  Globe2,
  GraduationCap,
  HeartPulse,
  Scale,
  ShieldCheck,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/** Resolves the icon names used in {@link ./data} to lucide components. */
export const iconMap: Record<string, LucideIcon> = {
  Bell,
  Briefcase,
  CalendarClock,
  Code2,
  CreditCard,
  FormInput,
  Globe2,
  GraduationCap,
  HeartPulse,
  Scale,
  ShieldCheck,
  Users,
  Zap,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? CalendarClock;
}
