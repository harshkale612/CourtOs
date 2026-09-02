"use client";

import Link from "next/link";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useIdleProgress } from "../use-idle-progress";
import { EASE_OUT as EASE, EASE_OUT_FN as EASE_FN } from "./ease";

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE, delay },
});

/**
 * Stage 1. A real, server-rendered <h1> — the headline is never drawn to a
 * canvas, so it stays the LCP element and stays readable to crawlers and
 * screen readers regardless of where the scroll sits.
 *
 * On scroll the two lines split: the promise rises out of frame, the problem
 * sinks away beneath it, clearing the stage for the product.
 */
export function HeroHeadline({ p }: { p: MotionValue<number> | null }) {
  const drive = useIdleProgress(p);

  const scale = useTransform(drive, [0, 0.15, 0.42], [1, 0.96, 0.88], { ease: EASE_FN });
  const line1Y = useTransform(drive, [0, 0.3, 0.45], [0, -120, -260], { ease: EASE_FN });
  const line2Y = useTransform(drive, [0, 0.3, 0.45], [0, 80, 190], { ease: EASE_FN });
  const line1Opacity = useTransform(drive, [0.22, 0.42], [1, 0], { ease: EASE_FN });
  const line2Opacity = useTransform(drive, [0.18, 0.38], [1, 0], { ease: EASE_FN });
  const supportOpacity = useTransform(drive, [0.05, 0.24], [1, 0], { ease: EASE_FN });
  const supportY = useTransform(drive, [0, 0.24], [0, -60], { ease: EASE_FN });
  const pointerEvents = useTransform(drive, (v) => (v > 0.28 ? "none" : "auto"));

  const driven = p !== null;
  const scrollStyle = driven ? { scale, willChange: "transform" } : undefined;

  return (
    <motion.div
      className="mx-auto w-full max-w-[1100px] text-center"
      style={driven ? { pointerEvents } : undefined}
    >
      <motion.div style={scrollStyle}>
        {/* Eyebrow */}
        <motion.div {...enter(0)}>
          <motion.div style={driven ? { opacity: supportOpacity, y: supportY } : undefined}>
            <span className="inline-flex items-center gap-2 rounded-full border border-(--border-default) bg-fill-2 py-1 pl-1.5 pr-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-secondary backdrop-blur sm:text-[11px]">
              <span className="flex size-5 items-center justify-center rounded-full bg-grad-brand-soft">
                <span className="size-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--brand)]" />
              </span>
              The operating system for sports clubs
            </span>
          </motion.div>
        </motion.div>

        {/* Headline */}
        <h1 className="mt-6 text-balance font-[800] leading-[0.92] tracking-[-0.035em] text-[2.6rem] sm:text-[3.25rem] md:text-[4.5rem] lg:text-[5.5rem] xl:text-[6.5rem]">
          <motion.span className="block" {...enter(0.08)}>
            <motion.span
              className="block"
              style={driven ? { y: line1Y, opacity: line1Opacity, willChange: "transform" } : undefined}
            >
              Run your club.
            </motion.span>
          </motion.span>
          <motion.span className="block" {...enter(0.16)}>
            <motion.span
              className="block text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(112deg, var(--brand-from) 0%, var(--accent-cyan) 48%, var(--accent-emerald) 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                ...(driven ? { y: line2Y, opacity: line2Opacity, willChange: "transform" } : {}),
              }}
            >
              Not your spreadsheet.
            </motion.span>
          </motion.span>
        </h1>

        {/* Supporting copy + conversion — held on screen for the whole first stage */}
        <motion.div style={driven ? { opacity: supportOpacity, y: supportY } : undefined}>
          <motion.p
            {...enter(0.24)}
            className="mx-auto mt-6 max-w-[46ch] text-pretty text-base leading-relaxed text-ink-secondary sm:text-lg"
          >
            Courts, bookings, members, memberships, events, payments and POS —
            connected in one platform.
          </motion.p>

          <motion.div
            {...enter(0.32)}
            className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
          >
            <Button
              size="lg"
              className="h-12 w-full rounded-xl px-8 text-base shadow-glow-brand transition-shadow hover:shadow-[0_12px_40px_-8px_var(--brand)] sm:h-[52px] sm:w-auto"
              asChild
            >
              <Link href="/login">
                Get Started
                <Icon name="arrow-right" className="ml-1 size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 w-full rounded-xl border border-(--border-default) bg-glass px-8 text-base backdrop-blur-xl hover:bg-fill-3 sm:h-[52px] sm:w-auto"
              asChild
            >
              <Link href="/demo">Book a Demo</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * The beat between the statement and the product: it lands as the court
 * finishes becoming a schedule. Pinned scenes only — without scrubbing there
 * is no transition for it to caption.
 */
export function HeroCaption({ p }: { p: MotionValue<number> | null }) {
  const drive = useIdleProgress(p);
  const opacity = useTransform(drive, [0.44, 0.54, 0.68, 0.76], [0, 1, 1, 0], { ease: EASE_FN });
  const y = useTransform(drive, [0.44, 0.76], [26, -26], { ease: EASE_FN });

  if (!p) return null;

  return (
    <motion.p
      aria-hidden
      style={{ opacity, y, willChange: "transform" }}
      className="text-center text-[11px] font-semibold uppercase tracking-[0.42em] text-ink-secondary sm:text-xs"
    >
      Everything connected
    </motion.p>
  );
}
