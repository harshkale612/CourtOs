"use client";

import { motion } from "framer-motion";
import { SPORTS } from "@/lib/constants/sports";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";

const TIMES = ["3", "4", "5", "6", "7", "8"];
const COURTS = [
  { name: "Tennis 1", sport: "tennis" as const, row: [1, 0, 0, 2, 0, 1] },
  { name: "Padel 1", sport: "padel" as const, row: [0, 1, 0, 0, 1, 0] },
  { name: "Pickle 2", sport: "pickleball" as const, row: [1, 0, 1, 0, 0, 1] },
  { name: "Squash 1", sport: "squash" as const, row: [0, 0, 1, 0, 1, 0] },
];

/**
 * Faux booking console — the hero visual anchor. Built from real tokens so it
 * reads as the actual product, with gently floating accent cards.
 */
export function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* glow behind the window */}
      <div className="absolute inset-0 -z-10 scale-90 rounded-[2rem] bg-grad-brand opacity-30 blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="glow-border overflow-hidden rounded-3xl bg-raised/90 shadow-[var(--sh-4)] backdrop-blur-xl"
      >
        {/* window chrome */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-danger/70" />
            <span className="size-3 rounded-full bg-warning/70" />
            <span className="size-3 rounded-full bg-success/70" />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
            <Icon name="calendar-check" className="size-3.5 text-brand" />
            Today · Court Grid
          </div>
          <span className="text-xs text-ink-tertiary">Live</span>
        </div>

        {/* grid */}
        <div className="p-5">
          <div className="mb-2 grid grid-cols-[64px_repeat(6,1fr)] gap-1.5 text-center text-[10px] text-ink-tertiary">
            <span />
            {TIMES.map((t) => (
              <span key={t}>{t}pm</span>
            ))}
          </div>
          {COURTS.map((court) => {
            const accent = SPORTS[court.sport].color;
            return (
              <div
                key={court.name}
                className="mb-1.5 grid grid-cols-[64px_repeat(6,1fr)] items-center gap-1.5"
              >
                <span className="truncate text-[11px] font-medium text-ink-secondary">
                  {court.name}
                </span>
                {court.row.map((state, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-7 rounded-md border transition-colors",
                      state === 0 && "border-[var(--border-subtle)] bg-white/[0.02]",
                      state === 2 && "border-transparent ring-2 ring-brand",
                    )}
                    style={
                      state === 1
                        ? {
                            background: `color-mix(in oklab, ${accent} 22%, transparent)`,
                            borderColor: `color-mix(in oklab, ${accent} 40%, transparent)`,
                          }
                        : state === 2
                          ? { background: "var(--grad-brand)" }
                          : undefined
                    }
                  />
                ))}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* floating: booking confirmed */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{ opacity: { delay: 0.7 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        className="glass absolute -left-4 bottom-10 hidden items-center gap-3 rounded-2xl p-3 shadow-[var(--sh-3)] sm:flex"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-success/15 text-success">
          <Icon name="check" className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold text-foreground">Booking confirmed</p>
          <p className="text-[11px] text-ink-tertiary">Tennis 1 · 6:00 PM</p>
        </div>
      </motion.div>

      {/* floating: revenue */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 0.9 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
        className="glass absolute -right-4 -top-4 hidden rounded-2xl p-3.5 shadow-[var(--sh-3)] sm:block"
      >
        <p className="text-[11px] text-ink-tertiary">Today&apos;s revenue</p>
        <p className="tnum mt-0.5 text-xl font-bold text-foreground">$3,248</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-success">
          <Icon name="trending-up" className="size-3" /> +12.4%
        </p>
      </motion.div>
    </div>
  );
}
