import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from "date-fns";

/** Currency — defaults to USD. */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/** Compact numbers: 1.2k, 3.4M. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

/** "2:30 PM" */
export function formatTime(date: string | Date): string {
  return format(new Date(date), "h:mm a");
}

/** "Mon, Jun 24" */
export function formatDate(date: string | Date): string {
  return format(new Date(date), "EEE, MMM d");
}

/** "Jun 24, 2026" */
export function formatLongDate(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

/** Human, relative day label with time: "Today · 2:30 PM". */
export function formatRelativeDay(date: string | Date): string {
  const d = new Date(date);
  const time = formatTime(d);
  if (isToday(d)) return `Today · ${time}`;
  if (isTomorrow(d)) return `Tomorrow · ${time}`;
  if (isYesterday(d)) return `Yesterday · ${time}`;
  return `${formatDate(d)} · ${time}`;
}

/** "in 3 hours", "2 days ago". */
export function formatFromNow(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** "2:30 PM – 3:30 PM" */
export function formatTimeRange(start: string | Date, end: string | Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** Duration in minutes between two ISO datetimes. */
export function durationMinutes(start: string | Date, end: string | Date): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

/** Initials from a name: "Anna Lee" -> "AL". */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
