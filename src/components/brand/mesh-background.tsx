"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { GlowBlob } from "./glow-blob";

/**
 * Full-bleed animated atmosphere: the mesh gradient + slowly drifting glow
 * blobs. Drop behind hero/section content. Honors reduced-motion via CSS.
 */
export function MeshBackground({
  className,
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden mesh-bg", className)}>
      <motion.div
        className="absolute inset-0"
        animate={animated ? { opacity: [0.85, 1, 0.85] } : undefined}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <GlowBlob color="var(--accent-blue)" size={520} opacity={0.28} className="-left-40 -top-32" />
        <GlowBlob color="var(--accent-purple)" size={460} opacity={0.26} className="-right-32 top-10" />
        <GlowBlob color="var(--accent-cyan)" size={500} opacity={0.18} className="bottom-[-12rem] left-1/3" />
      </motion.div>
    </div>
  );
}
