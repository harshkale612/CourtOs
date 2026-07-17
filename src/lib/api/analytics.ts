import type { BookingScope, CourtType, Sport } from "@/types";
import { db } from "@/lib/mock/data";
import { ANCHOR_DATE, atTime } from "@/lib/mock/prng";
import { sectionStatusAt } from "@/lib/mock/availability";
import { SPORT_LIST } from "@/lib/constants/sports";
import { COURT_TYPE, BOOKING_SCOPE, sectionColor } from "@/lib/constants/courts";
import { ok } from "./client";

export interface Kpi {
  key: string;
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  delta: number; // % change vs previous period
  accent: string;
  icon: string;
}

export interface FacilitySummary {
  physicalCourts: number;
  wholeCourts: number;
  shareableCourts: number;
  totalSections: number;
  availableSections: number;
  occupiedSections: number;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  bookings: number;
}

export interface HeatCell {
  day: number; // 0–6
  hour: number; // 6–22
  value: number; // 0–1 utilization
}

export interface SportBreakdown {
  sport: Sport;
  label: string;
  color: string;
  bookings: number;
  revenue: number;
}

export interface TypeBreakdown {
  key: BookingScope;
  label: string;
  color: string;
  bookings: number;
  revenue: number;
}

export interface CourtRevenue {
  courtId: string;
  name: string;
  type: CourtType;
  color: string;
  bookings: number;
  revenue: number;
}

export interface SectionRevenue {
  sectionId: string;
  label: string; // "Court A · A"
  color: string;
  bookings: number;
  revenue: number;
}

export interface UtilPoint {
  id: string;
  label: string;
  color: string;
  utilization: number; // 0–100 (relative to busiest in the set)
}

/* -- window constants for the seeded data (-14 … +10 days, 06:00–23:00) -- */
const WINDOW_DAYS = 25;
const OPEN_HOURS = 17;
const PRIME_REF = atTime(ANCHOR_DATE, 18).toISOString(); // 6 PM snapshot for "now" status

const activeReservations = () => db.reservations.filter((r) => r.status !== "cancelled");
const onAnchorDay = (iso: string) => new Date(iso).toDateString() === ANCHOR_DATE.toDateString();

/** Distinct court-hours in use (a court is "busy" in an hour if any lane is booked). */
function courtBusyHours(courtId: string): number {
  const hours = new Set<string>();
  for (const r of activeReservations()) if (r.courtId === courtId) hours.add(r.start);
  return hours.size;
}

/** Distinct section-hours occupied (own booking OR a whole-court booking blocks it). */
function sectionBusyHours(courtId: string, sectionId: string): number {
  const hours = new Set<string>();
  for (const r of activeReservations()) {
    if (r.courtId !== courtId) continue;
    if (r.bookingType === "whole" || r.sectionId === sectionId) hours.add(r.start);
  }
  return hours.size;
}

/** Normalize a set of raw values to 0–100 relative to the busiest (heatmap convention). */
function relative(values: number[]): number[] {
  const max = Math.max(1, ...values);
  return values.map((v) => Math.round((v / max) * 100));
}

export const analyticsApi = {
  kpis: (): Promise<Kpi[]> => {
    const active = activeReservations();
    const revenuePeriod = active.reduce((sum, r) => sum + r.price, 0);
    const revenueToday = active
      .filter((r) => onAnchorDay(r.start))
      .reduce((sum, r) => sum + r.price, 0);
    const wholeBookings = active.filter((r) => r.bookingType === "whole").length;
    const sectionBookings = active.filter((r) => r.bookingType === "section").length;
    const activeMembers = db.memberships.filter((m) => m.status === "active").length;

    const courtCapacity = db.courts.length * WINDOW_DAYS * OPEN_HOURS;
    const courtBusy = db.courts.reduce((sum, c) => sum + courtBusyHours(c.id), 0);
    const courtUtil = Math.min(96, Math.round((courtBusy / courtCapacity) * 100) + 44);

    const sectionCapacity = db.sections.length * WINDOW_DAYS * OPEN_HOURS;
    const sectionBusy = db.sections.reduce((s, sec) => s + sectionBusyHours(sec.courtId, sec.id), 0);
    const sectionUtil = db.sections.length
      ? Math.min(94, Math.round((sectionBusy / sectionCapacity) * 100) + 38)
      : 0;

    return ok([
      { key: "revenueToday", label: "Revenue today", value: revenueToday, format: "currency", delta: 12.4, accent: "var(--accent-emerald)", icon: "wallet" },
      { key: "revenuePeriod", label: "Revenue (period)", value: revenuePeriod, format: "currency", delta: 9.8, accent: "var(--accent-blue)", icon: "trending-up" },
      { key: "bookings", label: "Total bookings", value: active.length, format: "number", delta: 8.1, accent: "var(--accent-purple)", icon: "calendar-check" },
      { key: "wholeBookings", label: "Whole-court bookings", value: wholeBookings, format: "number", delta: 5.2, accent: "var(--accent-blue)", icon: "maximize" },
      { key: "sectionBookings", label: "Section bookings", value: sectionBookings, format: "number", delta: 14.6, accent: "var(--accent-cyan)", icon: "grid-2x2" },
      { key: "members", label: "Active members", value: activeMembers, format: "number", delta: 4.7, accent: "var(--accent-pink)", icon: "users" },
      { key: "courtUtil", label: "Court utilization", value: courtUtil, format: "percent", delta: 3.2, accent: "var(--accent-orange)", icon: "activity" },
      { key: "sectionUtil", label: "Section utilization", value: sectionUtil, format: "percent", delta: 6.9, accent: "var(--accent-cyan)", icon: "gauge" },
    ]);
  },

  facilitySummary: (): Promise<FacilitySummary> => {
    const whole = db.courts.filter((c) => c.type === "whole").length;
    const shareable = db.courts.filter((c) => c.type === "shareable").length;
    let occupied = 0;
    for (const court of db.courts) {
      for (const section of court.sections ?? []) {
        if (sectionStatusAt(db.reservations, court, section, PRIME_REF) === "occupied") occupied++;
      }
    }
    return ok({
      physicalCourts: db.courts.length,
      wholeCourts: whole,
      shareableCourts: shareable,
      totalSections: db.sections.length,
      availableSections: db.sections.length - occupied,
      occupiedSections: occupied,
    });
  },

  /** 12-month revenue + bookings trend (synthetic, stable, CAD-scaled). */
  revenueSeries: (): Promise<RevenuePoint[]> => {
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return ok(
      months.map((label, i) => {
        const base = 38000 + i * 2400;
        const wave = Math.round(Math.sin(i / 1.7) * 6500);
        return { label, revenue: base + wave, bookings: 480 + i * 22 + Math.round(wave / 130) };
      }),
    );
  },

  /** Day × hour occupancy heatmap, derived from reservations. */
  utilizationHeatmap: (): Promise<HeatCell[]> => {
    const counts: Record<string, number> = {};
    let max = 1;
    for (const r of activeReservations()) {
      const d = new Date(r.start);
      const key = `${d.getDay()}-${d.getHours()}`;
      counts[key] = (counts[key] ?? 0) + 1;
      max = Math.max(max, counts[key]);
    }
    const cells: HeatCell[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 6; hour <= 22; hour++) {
        cells.push({ day, hour, value: (counts[`${day}-${hour}`] ?? 0) / max });
      }
    }
    return ok(cells);
  },

  sportBreakdown: (): Promise<SportBreakdown[]> =>
    ok(
      SPORT_LIST.map((s) => {
        const rows = activeReservations().filter((r) => r.sport === s.id);
        return {
          sport: s.id,
          label: s.label,
          color: s.color,
          bookings: rows.length,
          revenue: rows.reduce((sum, r) => sum + r.price, 0),
        };
      }),
    ),

  /** Whole-court vs. section split — bookings and revenue. */
  bookingTypeBreakdown: (): Promise<TypeBreakdown[]> => {
    const active = activeReservations();
    return ok(
      (["whole", "section"] as BookingScope[]).map((key) => {
        const rows = active.filter((r) => r.bookingType === key);
        return {
          key,
          label: BOOKING_SCOPE[key].label,
          color: BOOKING_SCOPE[key].color,
          bookings: rows.length,
          revenue: rows.reduce((sum, r) => sum + r.price, 0),
        };
      }),
    );
  },

  /** Revenue + bookings per physical court (busiest first). */
  revenueByCourt: (): Promise<CourtRevenue[]> => {
    const active = activeReservations();
    return ok(
      db.courts
        .map((c) => {
          const rows = active.filter((r) => r.courtId === c.id);
          return {
            courtId: c.id,
            name: c.name,
            type: c.type,
            color: COURT_TYPE[c.type].color,
            bookings: rows.length,
            revenue: rows.reduce((sum, r) => sum + r.price, 0),
          };
        })
        .sort((a, b) => b.revenue - a.revenue),
    );
  },

  /** Revenue + bookings per section (across all shareable courts). */
  revenueBySection: (): Promise<SectionRevenue[]> => {
    const active = activeReservations();
    const rows: SectionRevenue[] = [];
    let idx = 0;
    for (const court of db.courts) {
      for (const section of court.sections ?? []) {
        const sec = active.filter((r) => r.sectionId === section.id);
        rows.push({
          sectionId: section.id,
          label: `${court.name} · ${section.shortLabel}`,
          color: sectionColor(idx++),
          bookings: sec.length,
          revenue: sec.reduce((sum, r) => sum + r.price, 0),
        });
      }
    }
    return ok(rows.sort((a, b) => b.revenue - a.revenue));
  },

  /** Relative utilization per section (0–100 vs. busiest section). */
  sectionUtilization: (): Promise<UtilPoint[]> => {
    const flat = db.courts.flatMap((c) =>
      (c.sections ?? []).map((s) => ({ court: c, section: s })),
    );
    const raw = flat.map(({ court, section }) => sectionBusyHours(court.id, section.id));
    const rel = relative(raw);
    return ok(
      flat.map(({ court, section }, i) => ({
        id: section.id,
        label: `${court.name} · ${section.shortLabel}`,
        color: sectionColor(i),
        utilization: rel[i],
      })),
    );
  },

  /** Relative utilization per physical court (0–100 vs. busiest court). */
  courtUtilization: (): Promise<UtilPoint[]> => {
    const raw = db.courts.map((c) => courtBusyHours(c.id));
    const rel = relative(raw);
    return ok(
      db.courts.map((c, i) => ({
        id: c.id,
        label: c.name,
        color: COURT_TYPE[c.type].color,
        utilization: rel[i],
      })),
    );
  },

  anchorDate: () => ok(ANCHOR_DATE.toISOString()),
};
