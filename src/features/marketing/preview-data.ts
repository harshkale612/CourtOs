import { SPORTS } from "@/lib/constants/sports";
import { formatCurrency } from "@/lib/utils/format";

/**
 * The single product snapshot the marketing hero tells its story with.
 *
 * The court visualisation, the dashboard frame and the floating cards all read
 * from here, so the schedule the court turns into is literally the schedule
 * that ends up inside the browser frame — the reveal is one continuous object,
 * not two drawings that happen to look alike.
 */

/** Whole dollars — KPI tiles read cleaner without cents. */
const wholeCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);

export const PREVIEW_HOURS = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM"] as const;

export const PREVIEW_COURTS = [
  { name: "Court 01", sport: SPORTS.tennis },
  { name: "Court 02", sport: SPORTS.padel },
  { name: "Court 03", sport: SPORTS.pickleball },
  { name: "Court 04", sport: SPORTS.squash },
] as const;

export interface PreviewBooking {
  /** Court column index into PREVIEW_COURTS. */
  col: number;
  /** Row offsets in hours from the first slot. */
  from: number;
  to: number;
  color: string;
  title: string;
  sub: string;
}

export const PREVIEW_BOOKINGS: PreviewBooking[] = [
  { col: 0, from: 0, to: 1, color: SPORTS.tennis.color, title: "Singles · 1 hr", sub: "S. Jenkins" },
  { col: 1, from: 1, to: 2.5, color: SPORTS.padel.color, title: "Doubles", sub: "M. Okafor +3" },
  {
    col: 2,
    from: 0.5,
    to: 2,
    color: SPORTS.pickleball.color,
    title: "Shared court",
    sub: "3 / 4 players",
  },
  { col: 3, from: 2, to: 3.5, color: SPORTS.squash.color, title: "Ladder league", sub: "Division A" },
  { col: 0, from: 3, to: 4, color: SPORTS.tennis.color, title: "Private lesson", sub: "Coach Ana" },
  { col: 2, from: 3, to: 4.5, color: SPORTS.pickleball.color, title: "Open play", sub: "Section B" },
];

export interface PreviewKpi {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export const PREVIEW_KPIS: PreviewKpi[] = [
  { label: "Today's revenue", value: wholeCurrency(4820), change: "+12.4%", trend: "up" },
  { label: "Bookings", value: "128", change: "+8.1%", trend: "up" },
  { label: "Court utilization", value: "78%", change: "+2.4%", trend: "up" },
  { label: "POS revenue", value: wholeCurrency(1240), change: "-4.2%", trend: "down" },
];

export interface PreviewCard {
  id: string;
  eyebrow: string;
  icon: string;
  accent: string;
  title: string;
  sub: string;
  meta: string;
}

/** Real interface objects, not decorative marketing chrome. */
export const PREVIEW_CARDS: PreviewCard[] = [
  {
    id: "booking",
    eyebrow: "New booking",
    icon: "calendar-check",
    accent: "var(--accent-blue)",
    title: "Court 02 · Padel",
    sub: "6:00 PM – 7:00 PM",
    meta: formatCurrency(45),
  },
  {
    id: "shared",
    eyebrow: "Court 03",
    icon: "layout-grid",
    accent: "var(--sport-pickleball)",
    title: "Shared court",
    sub: "3 / 4 players",
    meta: `${formatCurrency(15)} / player`,
  },
  {
    id: "pos",
    eyebrow: "POS sale",
    icon: "shopping-cart",
    accent: "var(--accent-cyan)",
    title: "Pro Shop",
    sub: "2 × Sports Drink",
    meta: formatCurrency(10),
  },
];
