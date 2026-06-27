"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface CounterProps {
  value: number;
  /** Format the displayed value (e.g. currency). */
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

/** Counts up to `value` once it scrolls into view. */
export function Counter({ value, format, duration = 0.9, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        node.textContent = format ? format(latest) : Math.round(latest).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, format]);

  return (
    <span ref={ref} className={cn("tnum", className)}>
      {format ? format(0) : "0"}
    </span>
  );
}
