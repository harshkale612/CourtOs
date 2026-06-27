"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  y?: number;
  once?: boolean;
}

/** Fade + rise reveal on scroll-into-view. Signature decelerate easing. */
export function Reveal({ children, className, delay = 0, y = 16, once = true, ...props }: RevealProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.52, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
