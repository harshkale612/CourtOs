"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { GlowBlob } from "@/components/brand/glow-blob";
import { useIdleProgress } from "../use-idle-progress";
import { EASE_OUT_FN as EASE_FN } from "./ease";

/** Fine grain — one static SVG turbulence tile, never re-rendered. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * The atmosphere: seven layers of depth behind the scene. Nothing here is
 * driven by scroll except opacity — animating a 120px blur on scroll is the
 * single most expensive thing this page could do, so the glows instead drift
 * on their own slow loop and respond only to the pointer.
 */
export function HeroBackground({
  p,
  mx,
  my,
}: {
  p: MotionValue<number> | null;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const drive = useIdleProgress(p, 0.25);

  // Layer 1–2: base mesh + glows, deepest parallax (~1.5%).
  const glowX = useTransform(mx, [-1, 1], [-18, 18]);
  const glowY = useTransform(my, [-1, 1], [-12, 12]);
  // Layer 6: grid, mid parallax (~3%).
  const gridX = useTransform(mx, [-1, 1], [-30, 30]);
  const gridY = useTransform(my, [-1, 1], [-20, 20]);

  // The canvas warms slightly as the product arrives, then hands off to the
  // next section instead of ending on a hard edge.
  const gridOpacity = useTransform(drive, [0, 0.2, 0.62, 1], [0, 0.55, 1, 0.7], { ease: EASE_FN });
  const vignette = useTransform(drive, [0, 0.6, 1], [0.25, 0.5, 0.7], { ease: EASE_FN });
  const trailOpacity = useTransform(drive, [0, 0.18, 0.5], [0.5, 1, 0], { ease: EASE_FN });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 1 — base mesh gradient (token-driven, re-themes automatically) */}
      <div className="mesh-bg absolute inset-0" />

      {/* 2 — blurred colour fields, slow independent drift */}
      <motion.div className="absolute inset-0" style={{ x: glowX, y: glowY }}>
        <div className="hero-drift absolute inset-0">
          <GlowBlob color="var(--accent-blue)" size={620} opacity={0.3} className="-left-40 -top-40" />
          <GlowBlob color="var(--accent-purple)" size={540} opacity={0.26} className="-right-32 top-0" />
          <GlowBlob
            color="var(--accent-cyan)"
            size={640}
            opacity={0.2}
            className="-bottom-56 left-1/3 hidden md:block"
          />
        </div>
      </motion.div>

      {/* 3 — radial stadium light from above */}
      <div
        className="absolute inset-x-0 top-0 h-[70%]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% -10%, color-mix(in oklab, var(--brand) 22%, transparent), transparent 70%)",
          opacity: "calc(0.9 * var(--atmo-strength, 1))",
        }}
      />

      {/* 4 — light trails: two trajectory arcs travelling across the frame */}
      <motion.svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: trailOpacity }}
      >
        <defs>
          <linearGradient id="hero-trail-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--accent-cyan)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-trail-b" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-emerald)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--accent-emerald)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="hero-trail"
          d="M-120 640 C 240 300, 720 200, 1320 420"
          pathLength={1}
          fill="none"
          stroke="url(#hero-trail-a)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="hero-trail hero-trail--slow"
          d="M-120 300 C 300 620, 800 640, 1320 240"
          pathLength={1}
          fill="none"
          stroke="url(#hero-trail-b)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* 5 — depth particles (six static dots, CSS drift only) */}
      <div className="absolute inset-0 hidden md:block">
        {[
          [12, 28, 0],
          [31, 71, 1.6],
          [48, 18, 3.2],
          [67, 62, 0.8],
          [83, 34, 2.4],
          [91, 76, 4],
        ].map(([left, top, delay]) => (
          <span
            key={`${left}-${top}`}
            className="hero-particle absolute size-1 rounded-full bg-foreground/40"
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      {/* 6 — surface geometry: a court-scale grid, masked to the centre */}
      <motion.div
        className="hero-grid absolute inset-0"
        style={{ opacity: gridOpacity, x: gridX, y: gridY }}
      />

      {/* 7 — grain + vignette to seat everything on one surface */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay dark:opacity-[0.05]"
        style={{ backgroundImage: GRAIN }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: vignette,
          background:
            "radial-gradient(120% 80% at 50% 50%, transparent 45%, var(--bg-canvas) 100%)",
        }}
      />
    </div>
  );
}
