"use client";

import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";

/** − / qty / + control shared by the basket, product detail and booking add-ons. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  size = "md",
  className,
  label = "quantity",
}: {
  value: number;
  onChange: (next: number) => void;
  /** Below `min`, the − button hands back `min - 1` so callers can remove the line. */
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}) {
  const atMax = max !== undefined && value >= max;
  const btn = cn(
    "flex items-center justify-center rounded-lg border border-(--border-default) text-ink-secondary transition-colors hover:border-(--border-strong) hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
    size === "sm" ? "size-7" : "size-9",
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= min - 1}
        aria-label={`Decrease ${label}`}
      >
        <Icon name="minus" className={size === "sm" ? "size-3.5" : "size-4"} />
      </button>
      <span
        className={cn(
          "tnum text-center font-semibold tabular-nums text-foreground",
          size === "sm" ? "w-6 text-sm" : "w-8",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={atMax}
        aria-label={`Increase ${label}`}
      >
        <Icon name="plus" className={size === "sm" ? "size-3.5" : "size-4"} />
      </button>
    </div>
  );
}
