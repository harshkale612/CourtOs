import type { BookingScope, CourtType } from "@/types";

export interface CourtTypeConfig {
  label: string;
  /** Short noun used in dense UI ("Whole" / "Shareable"). */
  short: string;
  description: string;
  icon: string; // lucide key
  color: string; // hex, for charts / accents
}

/** Whole vs. shareable — display metadata (kept out of components for reuse). */
export const COURT_TYPE: Record<CourtType, CourtTypeConfig> = {
  whole: {
    label: "Whole Court",
    short: "Whole",
    description: "Booked as a single unit — one reservation at a time.",
    icon: "square",
    color: "#3b82f6", // blue
  },
  shareable: {
    label: "Shareable Court",
    short: "Shareable",
    description: "Book the entire court, or independent sections in parallel.",
    icon: "layout-grid",
    color: "#8b5cf6", // purple
  },
};

export interface BookingScopeConfig {
  label: string; // "Entire Court" / "Section"
  short: string;
  icon: string;
  color: string;
}

/** Whole-court vs. section booking — display metadata + chart colors. */
export const BOOKING_SCOPE: Record<BookingScope, BookingScopeConfig> = {
  whole: {
    label: "Entire Court",
    short: "Entire",
    icon: "maximize",
    color: "#6366f1", // indigo
  },
  section: {
    label: "Section",
    short: "Section",
    icon: "grid-2x2",
    color: "#06b6d4", // cyan
  },
};

/** Section accent palette — cycled so Section A/B/C read distinctly in the grid. */
export const SECTION_COLORS = ["#06b6d4", "#f59e0b", "#ec4899", "#10b981", "#8b5cf6"];

export function sectionColor(index: number): string {
  return SECTION_COLORS[index % SECTION_COLORS.length];
}
