import type { Sport } from "@/types";

/**
 * Image helpers. Avatars use DiceBear (deterministic, key-less, reliable).
 * Court/event covers use curated Unsplash photo IDs — every ID below was
 * fetched and checked to actually show the sport it is filed under.
 */

const UNSPLASH = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Curated court cover pools per sport. */
const COURT_IMAGES: Record<Sport, string[]> = {
  // clay serve / grass forehand / hard court
  tennis: ["1554068865-24cecd4e34b8", "1622279457486-62dcc4a431d6", "1595435934249-5df7ed86e1c0"],
  // paddles at the net / outdoor rally
  pickleball: ["1693142518820-78d7a05f1546", "1747027694225-cbf12dd20826"],
  // rackets on a blue court / racket and ball courtside
  padel: ["1658723826297-fe4d1b1e6600", "1657704358775-ed705c7388d2"],
  // racket and shuttle / indoor hall / outdoor courts
  badminton: ["1722003180803-577efd6d2ecc", "1723074832950-9fb031b0f4ec", "1743601587751-01dc32b707d2"],
  // glass-back court / red-lined court / rally in play
  squash: ["1740813402046-08ec3e0ce5d2", "1740813416116-a07511d2e188", "1694723844104-a1495e30c7b0"],
};

const EVENT_IMAGES = [
  "1554068865-24cecd4e34b8", // tennis — clay court serve
  "1747027694225-cbf12dd20826", // pickleball — outdoor rally
  "1723074832950-9fb031b0f4ec", // badminton — indoor hall
  "1595435742656-5272d0b3fa82", // tennis — coaching / clinic
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
