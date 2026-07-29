"use client";

import type { ProductCategory } from "@/types";
import { CATEGORY_LIST, type ProductCategoryConfig } from "@/lib/constants/pos";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";

export type CategoryFilter = ProductCategory | "all";

/** Horizontal, scrollable category filter — matches the admin pill-filter idiom. */
export function CategoryPills({
  value,
  onChange,
  counts,
  categories = CATEGORY_LIST,
  className,
}: {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
  counts?: Record<string, number>;
  categories?: ProductCategoryConfig[];
  className?: string;
}) {
  const pill = (active: boolean) =>
    cn(
      "inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors duration-200",
      active
        ? "border-transparent bg-grad-brand text-white shadow-glow-brand"
        : "border-(--border-default) bg-surface text-ink-secondary hover:border-(--border-strong) hover:text-foreground",
    );

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1", className)}>
      <button type="button" className={pill(value === "all")} onClick={() => onChange("all")}>
        <Icon name="layout-grid" className="size-4" />
        All
        {counts?.all !== undefined && <span className="tnum opacity-70">{counts.all}</span>}
      </button>
      {categories.map((c) => (
        <button key={c.id} type="button" className={pill(value === c.id)} onClick={() => onChange(c.id)}>
          <Icon name={c.icon} className="size-4" style={value === c.id ? undefined : { color: c.color }} />
          {c.label}
          {counts?.[c.id] !== undefined && <span className="tnum opacity-70">{counts[c.id]}</span>}
        </button>
      ))}
    </div>
  );
}
