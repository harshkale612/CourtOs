import type { Sport } from "@/types";
import { db } from "@/lib/mock/data";
import { ANCHOR_DATE } from "@/lib/mock/prng";
import { SPORT_LIST } from "@/lib/constants/sports";
import { ok } from "./client";

export interface Kpi {
  key: string;
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  delta: number; // % change vs previous period
  accent: string;
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

export const analyticsApi = {
  kpis: (): Promise<Kpi[]> => {
    const active = db.reservations.filter((r) => r.status !== "cancelled");
    const revenue = active.reduce((sum, r) => sum + r.price, 0);
    const activeMembers = db.memberships.filter((m) => m.status === "active").length;
    const utilization = Math.round((active.length / (db.courts.length * 17 * 24)) * 100);
    return ok([
      { key: "revenue", label: "Revenue", value: revenue + 18420, format: "currency", delta: 12.4, accent: "var(--accent-emerald)" },
      { key: "bookings", label: "Bookings", value: active.length, format: "number", delta: 8.1, accent: "var(--accent-blue)" },
      { key: "members", label: "Active members", value: activeMembers, format: "number", delta: 4.7, accent: "var(--accent-purple)" },
      { key: "utilization", label: "Court utilization", value: Math.min(98, utilization + 46), format: "percent", delta: 3.2, accent: "var(--accent-orange)" },
    ]);
  },

  /** 12-month revenue + bookings trend (synthetic, stable). */
  revenueSeries: (): Promise<RevenuePoint[]> => {
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return ok(
      months.map((label, i) => {
        const base = 22000 + i * 1400;
        const wave = Math.round(Math.sin(i / 1.7) * 4200);
        return { label, revenue: base + wave, bookings: 480 + i * 22 + Math.round(wave / 40) };
      }),
    );
  },

  /** Day × hour utilization heatmap, derived from reservations. */
  utilizationHeatmap: (): Promise<HeatCell[]> => {
    const counts: Record<string, number> = {};
    let max = 1;
    for (const r of db.reservations) {
      if (r.status === "cancelled") continue;
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
        const rows = db.reservations.filter((r) => r.sport === s.id && r.status !== "cancelled");
        return {
          sport: s.id,
          label: s.label,
          color: s.color,
          bookings: rows.length,
          revenue: rows.reduce((sum, r) => sum + r.price, 0),
        };
      }),
    ),

  anchorDate: () => ok(ANCHOR_DATE.toISOString()),
};
