import type { Sport } from "@/types";

export interface SportConfig {
  id: Sport;
  label: string;
  /** CSS var token name for the sport accent (see globals.css). */
  accentVar: string;
  /** Raw hex (for charts / inline styles / canvas). */
  color: string;
  /** Lucide icon key (resolved in components). */
  icon: string;
  emoji: string;
}

export const SPORTS: Record<Sport, SportConfig> = {
  tennis: {
    id: "tennis",
    label: "Tennis",
    accentVar: "var(--sport-tennis)",
    color: "#a3e635",
    icon: "circle-dot",
    emoji: "🎾",
  },
  pickleball: {
    id: "pickleball",
    label: "Pickleball",
    accentVar: "var(--sport-pickleball)",
    color: "#f59e0b",
    icon: "grip",
    emoji: "🏓",
  },
  padel: {
    id: "padel",
    label: "Padel",
    accentVar: "var(--sport-padel)",
    color: "#06b6d4",
    icon: "square-dashed",
    emoji: "🎾",
  },
  badminton: {
    id: "badminton",
    label: "Badminton",
    accentVar: "var(--sport-badminton)",
    color: "#8b5cf6",
    icon: "feather",
    emoji: "🏸",
  },
  squash: {
    id: "squash",
    label: "Squash",
    accentVar: "var(--sport-squash)",
    color: "#ec4899",
    icon: "scan",
    emoji: "🟦",
  },
};

export const SPORT_LIST: SportConfig[] = Object.values(SPORTS);

export function getSport(sport: Sport): SportConfig {
  return SPORTS[sport];
}
