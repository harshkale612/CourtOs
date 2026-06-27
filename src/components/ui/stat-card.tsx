"use client";

import { cn } from "@/lib/utils/cn";
import { Counter } from "@/components/motion/counter";
import { Icon } from "@/components/ui/icon";

export function StatCard({
  label,
  value,
  icon,
  accent = "var(--brand)",
  delta,
  format,
  className,
}: {
  label: string;
  value: number;
  icon: string;
  accent?: string;
  delta?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-raised p-5 transition-all duration-300 hover:border-[var(--border-strong)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between">
        <span
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in oklab, ${accent} 16%, transparent)`, color: accent }}
        >
          <Icon name={icon} className="size-5" />
        </span>
        {delta !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold",
              delta >= 0 ? "text-success" : "text-danger",
            )}
          >
            <Icon name="trending-up" className={cn("size-3", delta < 0 && "rotate-180")} />
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">
        <Counter value={value} format={format} />
      </p>
      <p className="mt-1 text-sm text-ink-secondary">{label}</p>
    </div>
  );
}
