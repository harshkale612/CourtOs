"use client";

import { useCallback } from "react";
import { useMotionValue } from "framer-motion";
import { useHeroScroll } from "./use-hero-scroll";
import { HeroBackground } from "./hero-background";
import { HeroHeadline, HeroCaption } from "./hero-headline";
import { HeroCourtScene } from "./hero-court-scene";
import { HeroProductReveal } from "./hero-product-reveal";
import { HeroFloatingCards } from "./hero-floating-cards";

/**
 * The cinematic hero.
 *
 * One tall section (`ref`) defines the scroll range; a `sticky` child pins
 * the actual scene to the viewport while `p` sweeps 0 → 1. Every layer below
 * is a pure function of that single spring value — nothing here re-renders
 * on scroll, it all rides framer's rAF-driven MotionValues.
 *
 * While pinned, the three acts (headline / court+product / floating cards)
 * share one CSS Grid cell — they overlap and cross-fade in place rather than
 * stacking in flow, which is what keeps a tall, mostly-transparent act (the
 * court SVG, the dashboard frame) from pushing an earlier one out of the
 * viewport. Paint order is explicit z-index, matching the brief's depth
 * order: court geometry behind, headline above it, floating cards in front
 * of everything.
 *
 * All of the pin/grid/overlap classes below are gated on the `motion-safe:`
 * variant, not just a breakpoint — `useHeroScroll` already turns `p` to
 * `null` for prefers-reduced-motion, but that only stops values from being
 * *driven*; each layer's `whileInView` fallback still settles to fully
 * visible and stays there. Without the same `motion-safe:` gate here, a
 * reduced-motion visit on a wide viewport would keep the overlapping-grid
 * structure while every act sat at opacity 1 at once — headline, court and
 * dashboard on top of each other. Gating the structure itself means
 * reduced-motion collapses to the exact same plain flow mobile uses (see the
 * base, un-prefixed classes): one act at a time, in document order.
 */
export function Hero() {
  const { ref, p, pointerEnabled } = useHeroScroll();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pointerEnabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [pointerEnabled, mx, my],
  );

  const onPointerLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <section ref={ref} className="relative md:motion-safe:h-[220vh] lg:motion-safe:h-[260vh]">
      <div
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="sticky top-0 overflow-hidden px-6 py-28 md:motion-safe:h-[100svh] md:motion-safe:px-8 md:motion-safe:py-0"
      >
        <HeroBackground p={p} mx={mx} my={my} />

        <div className="relative mx-auto flex w-full max-w-[1240px] flex-col items-center gap-14 md:motion-safe:grid md:motion-safe:h-full md:motion-safe:gap-0">
          {/* Act 2 — court becomes schedule, schedule becomes dashboard. */}
          <div className="relative z-10 w-full md:motion-safe:col-start-1 md:motion-safe:row-start-1 md:motion-safe:flex md:motion-safe:h-full md:motion-safe:w-full md:motion-safe:flex-col md:motion-safe:items-center md:motion-safe:justify-center">
            <HeroCaption p={p} />
            <div className="relative mt-4 w-full md:motion-safe:mt-6">
              <HeroCourtScene p={p} mx={mx} my={my} />
              <div className="mt-8 flex justify-center md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:mt-0 md:motion-safe:items-center">
                <HeroProductReveal p={p} mx={mx} my={my} />
              </div>
            </div>
          </div>

          {/* Act 1 — the statement. Painted above the court so it stays legible while both are visible. */}
          <div className="relative z-20 order-first w-full md:motion-safe:order-none md:motion-safe:col-start-1 md:motion-safe:row-start-1 md:motion-safe:flex md:motion-safe:h-full md:motion-safe:w-full md:motion-safe:items-center md:motion-safe:justify-center">
            <HeroHeadline p={p} />
          </div>

          {/* Act 3 — the interface objects, closest to the viewer. This
              wrapper spans the full scene at the top z-index but has no
              content of its own outside the cards (HeroFloatingCards makes
              those non-interactive too) — without pointer-events-none here,
              its own empty box would sit above the headline's CTAs in every
              hit-test and swallow every click in the pinned scene. */}
          <div className="pointer-events-none relative z-30 order-last w-full md:motion-safe:order-none md:motion-safe:col-start-1 md:motion-safe:row-start-1 md:motion-safe:h-full md:motion-safe:w-full">
            <HeroFloatingCards p={p} mx={mx} my={my} />
          </div>
        </div>
      </div>
    </section>
  );
}
