/**
 * Deterministic PRNG + helpers.
 *
 * Mock data MUST be identical on server and client to avoid hydration
 * mismatches, so everything is seeded — no Math.random(), no Date.now().
 * All date math anchors to ANCHOR_DATE.
 */

/** The app's "today". All seed data is generated relative to this. */
export const ANCHOR_DATE = new Date("2026-06-26T08:00:00.000Z");

/** mulberry32 — tiny, fast, deterministic PRNG. */
export function createRng(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = ReturnType<typeof createRng>;

export const rngHelpers = (rng: Rng) => ({
  /** integer in [min, max] inclusive */
  int: (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min,
  /** float in [min, max) */
  float: (min: number, max: number) => rng() * (max - min) + min,
  /** pick one element */
  pick: <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)],
  /** pick n unique elements */
  sample: <T>(arr: readonly T[], n: number): T[] => {
    const copy = [...arr];
    const out: T[] = [];
    for (let i = 0; i < n && copy.length; i++) {
      out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
    }
    return out;
  },
  /** true with probability p */
  chance: (p: number) => rng() < p,
});

/** Add days to a date (returns new Date). */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Set a date to a given hour:minute (returns new Date). */
export function atTime(date: Date, hour: number, minute = 0): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}
