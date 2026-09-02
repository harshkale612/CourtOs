"use client";

import { useMotionValue, type MotionValue } from "framer-motion";

/**
 * Resolves a scene-progress value that is safe to read in every tier.
 *
 * When the hero is pinned we scrub the real scroll progress. When it isn't
 * (mobile, reduced motion) we hand back a frozen value so the same
 * `useTransform` chains still resolve to a sensible, composed still frame —
 * no conditional hooks, no branching transform code in the components.
 */
export function useIdleProgress(p: MotionValue<number> | null, idle = 0): MotionValue<number> {
  const frozen = useMotionValue(idle);
  return p ?? frozen;
}
