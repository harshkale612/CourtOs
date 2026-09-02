"use client";

import { useRef } from "react";
import { useReducedMotion, useScroll, useSpring, type MotionValue } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface HeroScroll {
  /** Attach to the tall <section> that defines the scene's scroll range. */
  ref: React.RefObject<HTMLElement | null>;
  /**
   * Scene progress 0 → 1 while the stage is pinned, spring-smoothed.
   * `null` means "no scroll choreography" — mobile (no pin) or
   * prefers-reduced-motion. Children then fall back to in-view fades,
   * which keeps the same story without scrubbing.
   *
   * Note: the global reduced-motion rule in globals.css only neutralises CSS
   * animation/transition. Framer writes inline transforms via rAF and is
   * unaffected, so reduced motion has to be handled here, in JS.
   */
  p: MotionValue<number> | null;
  /** Fine-pointer desktop only — drives the (very subtle) parallax. */
  pointerEnabled: boolean;
}

export function useHeroScroll(): HeroScroll {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  // Both false until mounted, so SSR and the first client render agree.
  const pinned = useMediaQuery("(min-width: 768px)");
  const finePointer = useMediaQuery("(min-width: 1024px) and (pointer: fine)");

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const cinematic = pinned && !reduced;

  return { ref, p: cinematic ? p : null, pointerEnabled: cinematic && finePointer };
}
