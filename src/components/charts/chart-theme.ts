/** Shared chart palette (hex — Recharts renders these into SVG). */
export const CHART_COLORS = {
  blue: "#3B82F6",
  indigo: "#6366F1",
  purple: "#8B5CF6",
  emerald: "#10B981",
  cyan: "#06B6D4",
  orange: "#F59E0B",
  pink: "#EC4899",
} as const;

export const CHART_SERIES = [
  CHART_COLORS.blue,
  CHART_COLORS.emerald,
  CHART_COLORS.purple,
  CHART_COLORS.orange,
  CHART_COLORS.pink,
  CHART_COLORS.cyan,
];

/* Theme-aware via CSS vars — Recharts renders these straight into SVG,
   so charts re-theme automatically on light/dark switch. */
export const AXIS_PROPS = {
  stroke: "var(--chart-axis)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

export const GRID_STROKE = "var(--chart-grid)";
