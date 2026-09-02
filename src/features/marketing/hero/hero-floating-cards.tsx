"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { PREVIEW_CARDS } from "../preview-data";
import { ProductCard } from "../product-card";
import { useIdleProgress } from "../use-idle-progress";
import { EASE_OUT_FN as EASE_FN } from "./ease";

/**
 * Resting places within the pinned scene — they frame the dashboard without
 * covering it. Percentages, not pixels from the edge, so the same three
 * positions hold up from a phone's 100svh frame up through desktop's; only
 * `lg:` nudges them a little further out once there's room to spare.
 */
const PLACEMENT = [
  "left-[2%] top-[28%] w-[210px] sm:w-[244px] lg:left-[5%]",
  "right-[2%] top-[20%] w-[210px] sm:w-[244px] lg:right-[4%]",
  "right-[5%] bottom-[14%] w-[210px] sm:w-[244px] lg:right-[9%]",
] as const;

const FROM_X = [-44, 44, 44];
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Three real interface objects, arriving last. They are decorative in the
 * layout sense only — the content is the live CourtOS domain model, so the
 * frame edges read as more product rather than as marketing garnish.
 *
 * `driven` (== the scene is cinematic, see hero.tsx) chooses the whole
 * layout mode, not just the animation: pinned, the cards are absolutely
 * positioned within the 100svh frame at every viewport width. Under
 * prefers-reduced-motion the pin never happens, so the same positioning
 * would collapse against a zero-height container (an absolutely-positioned
 * child can't give its parent a height) — the fallback stacks them in plain
 * flow instead, matching how the rest of the reduced-motion scene stacks.
 */
export function HeroFloatingCards({
  p,
  mx,
  my,
}: {
  p: MotionValue<number> | null;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const driven = p !== null;
  return (
    <div
      className={cn(
        "pointer-events-none",
        driven
          ? "relative h-full w-full"
          : "mx-auto flex w-full max-w-md flex-col gap-3",
      )}
    >
      {PREVIEW_CARDS.map((card, i) => (
        <FloatingCard key={card.id} index={i} p={p} mx={mx} my={my} />
      ))}
    </div>
  );
}

function FloatingCard({
  index,
  p,
  mx,
  my,
}: {
  index: number;
  p: MotionValue<number> | null;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const drive = useIdleProgress(p);
  const start = 0.76 + index * 0.03;
  const driven = p !== null;

  const opacity = useTransform(drive, [start, start + 0.09], [0, 1], { ease: EASE_FN });
  const x = useTransform(drive, [start, start + 0.09], [FROM_X[index], 0], { ease: EASE_FN });
  // Closest layer to the viewer, so it takes the most parallax — and "most"
  // here is still only a handful of pixels.
  const px = useTransform(mx, [-1, 1], [-16, 16]);
  const py = useTransform(my, [-1, 1], [-11, 11]);

  return (
    <motion.div
      className={cn(driven && "absolute", PLACEMENT[index])}
      initial={driven ? false : { opacity: 0, y: 18 }}
      whileInView={driven ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASE }}
      style={driven ? { opacity, x, willChange: "transform" } : undefined}
    >
      <motion.div style={driven ? { x: px, y: py } : undefined}>
        {/* Idle bob lives on its own element so it never fights an inline
            transform written by the scroll choreography. */}
        <div className="hero-float" style={{ animationDelay: `${index * 1.3}s` }}>
          <ProductCard card={PREVIEW_CARDS[index]} />
        </div>
      </motion.div>
    </motion.div>
  );
}
