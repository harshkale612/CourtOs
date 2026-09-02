"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { ProductFrame } from "../product-frame";
import { useIdleProgress } from "../use-idle-progress";
import { EASE_OUT as EASE, EASE_OUT_FN as EASE_FN } from "./ease";

/**
 * Stage 3. The frame grows out of the plane the court left behind — same
 * tilt, same centre, same schedule — then flattens and settles.
 *
 * The reveal window ([0.62, 0.72]) picks up almost exactly where the court
 * scene's own dissolve ends ([0.54, 0.66], see hero-court-scene.tsx) — a
 * short, eased, blurred crossfade rather than two crisp, misaligned grids
 * sitting on top of each other for a long stretch of scroll.
 */
export function HeroProductReveal({
  p,
  mx,
  my,
}: {
  p: MotionValue<number> | null;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const drive = useIdleProgress(p, 1);
  const driven = p !== null;

  const opacity = useTransform(drive, [0.62, 0.72], [0, 1], { ease: EASE_FN });
  const scale = useTransform(drive, [0.62, 0.92], [0.9, 1], { ease: EASE_FN });
  const rotateX = useTransform(drive, [0.62, 0.92], [16, 2], { ease: EASE_FN });
  const y = useTransform(drive, [0.62, 0.92], [40, 0], { ease: EASE_FN });
  const blur = useTransform(drive, [0.62, 0.74], [4, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  // The deepest interactive layer, so it takes the least parallax (~1%).
  const px = useTransform(mx, [-1, 1], [-8, 8]);
  const py = useTransform(my, [-1, 1], [-5, 5]);

  return (
    <div className="w-full [perspective:1600px]">
      <motion.div
        initial={driven ? false : { opacity: 0, y: 36 }}
        whileInView={driven ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: EASE }}
        style={
          driven
            ? { opacity, scale, rotateX, y, filter, transformStyle: "preserve-3d", willChange: "transform" }
            : undefined
        }
        className="mx-auto w-full max-w-[1180px]"
      >
        <motion.div style={driven ? { x: px, y: py } : undefined}>
          <ProductFrame p={p} />
        </motion.div>
      </motion.div>
    </div>
  );
}
