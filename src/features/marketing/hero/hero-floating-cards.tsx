"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { PREVIEW_CARDS } from "../preview-data";
import { ProductCard } from "../product-card";
import { useIdleProgress } from "../use-idle-progress";
import { EASE_OUT_FN as EASE_FN } from "./ease";

/** Desktop resting places — they frame the dashboard without covering it. */
const PLACEMENT = [
  "md:absolute md:left-[2%] md:top-[28%] md:w-[244px] lg:left-[5%]",
  "md:absolute md:right-[2%] md:top-[20%] md:w-[244px] lg:right-[4%]",
  "md:absolute md:right-[7%] md:bottom-[14%] md:w-[244px] lg:right-[9%]",
] as const;

const FROM_X = [-44, 44, 44];
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Three real interface objects, arriving last. They are decorative in the
 * layout sense only — the content is the live CourtOS domain model, so the
 * frame edges read as more product rather than as marketing garnish.
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
  return (
    <div className="pointer-events-none mx-auto flex w-full max-w-md flex-col gap-3 md:block md:h-full md:max-w-none">
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
      className={PLACEMENT[index]}
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
