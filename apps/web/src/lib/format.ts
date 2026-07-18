/** Formatting helpers that render instants in a specific IANA timezone. */

export function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** YYYY-MM-DD for an instant, evaluated in the given zone. */
export function calendarDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDateHeading(dateKey: string): string {
  // dateKey is YYYY-MM-DD; render in UTC to avoid shifting the label.
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${dateKey}T00:00:00Z`));
}

/** Add N days to a YYYY-MM-DD string (UTC-safe). */
export function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function todayInZone(timeZone: string): string {
  return calendarDate(new Date().toISOString(), timeZone);
}

/** Format integer minor units (e.g. cents) as currency. */
export function formatMoney(amountMinor: number, currency = 'usd'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountMinor / 100);
  } catch {
    return `$${(amountMinor / 100).toFixed(2)}`;
  }
}

/** "Monday, July 21 · 2:30 PM" style label for a slot in a zone. */
export function formatSlotLong(iso: string, timeZone: string): string {
  return `${formatDateHeading(calendarDate(iso, timeZone))} · ${formatTime(iso, timeZone)}`;
}
