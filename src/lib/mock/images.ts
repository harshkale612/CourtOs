import type { Sport } from "@/types";

/**
 * Image helpers. Avatars use DiceBear (deterministic, key-less, reliable).
 * Court/event covers use curated Unsplash photo IDs.
 * NOTE: Unsplash IDs are validated live in Phase 5 when first rendered.
 */

const UNSPLASH = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Curated court cover pools per sport. */
const COURT_IMAGES: Record<Sport, string[]> = {
  tennis: ["1554068865-24cecd4e34b8", "1622279457486-62dcc4a431d6", "1595435934249-5df7ed86e1c0"],
  pickleball: ["1626224583764-f87db24ac4ea", "1612872087720-bb876e2e67d1"],
  padel: ["1599058917212-d750089bc07e", "1626224583764-f87db24ac4ea"],
  badminton: ["1521587760476-6c12a4b040da", "1626224583764-f87db24ac4ea"],
  squash: ["1599058917212-d750089bc07e", "1574680096145-d05b474e2155"],
};

const EVENT_IMAGES = [
  "1517649763962-0c623066013b",
  "1530549387789-4c1017266635",
  "1551958219-acbc608c6377",
  "1526232761682-d26e03ac148e",
];

export function courtImage(sport: Sport, index = 0): string {
  const pool = COURT_IMAGES[sport];
  return UNSPLASH(pool[index % pool.length]);
}

export function eventImage(index = 0): string {
  return UNSPLASH(EVENT_IMAGES[index % EVENT_IMAGES.length], 900);
}

/** Deterministic avatar from a seed string. */
export function avatar(seed: string): string {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}`;
}

export function avatarPortrait(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6366f1,8b5cf6,3b82f6`;
}
