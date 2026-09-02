"use client";

import { useRef } from "react";
import { useScroll, useSpring, type MotionValue } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface HeroScroll {
  /** Attach to the tall <section> that defines the scene's scroll range. */
  ref: React.RefObject<HTMLElement | null>;
  /**
   * Scene progress 0 → 1 while the stage is pinned, spring-smoothed. The
   * pinned, scroll-scrubbed scene runs at every viewport width — the story
   * (headline → court → dashboard) is the point, and a phone visitor should
   * get the same one, not a lesser one.
   *
   * `null` means "no scroll choreography" — only under prefers-reduced-motion.
   * Children then fall back to in-view fades, which keeps the same story
   * without scrubbing.
   *
   * Note: the global reduced-motion rule in globals.css only neutralises CSS
   * animation/transition. Framer writes inline transforms via rAF and is
   * unaffected, so reduced motion has to be handled here, in JS.
   */
  p: MotionValue<number> | null;
  /** Fine-pointer devices only — drives the (very subtle) parallax; never touch. */
  pointerEnabled: boolean;
}

export function useHeroScroll(): HeroScroll {
  const ref = useRef<HTMLElement>(null);
  // Framer's own useReducedMotion() resolves synchronously from
  // window.matchMedia on the client's first render, which disagrees with the
  // server (no window) and produces a real hydration mismatch for anyone
  // who actually has the OS preference on — React discards and re-renders
  // the whole tree. useMediaQuery is deliberately dumber: it returns `false`
  // on the server AND the client's first render alike (only useEffect, after
  // mount, can change it), so the two initial passes always agree.
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const finePointer = useMediaQuery("(pointer: fine)");

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const cinematic = !reduced;

  return { ref, p: cinematic ? p : null, pointerEnabled: cinematic && finePointer };
}
