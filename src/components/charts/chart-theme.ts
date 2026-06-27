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

export const AXIS_PROPS = {
  stroke: "rgba(148,163,184,0.5)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

export const GRID_STROKE = "rgba(255,255,255,0.06)";
