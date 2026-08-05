"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types";
import { PRODUCT_CATEGORIES } from "@/lib/constants/pos";
import { BOOKING_ADDON_CATEGORIES } from "@/lib/constants/commerce";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductThumb } from "@/features/pos/product-thumb";
import { useShopProducts } from "@/features/shop/hooks";
import { QuantityStepper } from "@/features/shop/quantity-stepper";

/** productId → quantity. Empty means "court only". */
export type AddonSelection = Record<string, number>;

/**
 * Pro-shop add-ons offered inside the booking drawer, so a member can grab a
 * drink and a can of balls on the way to paying for the court — one basket,
 * one payment, waiting courtside.
 */
export function BookingAddons({
  selection,
  onChange,
  accent,
  className,
}: {
  selection: AddonSelection;
  onChange: (next: AddonSelection) => void;
  /** Sport accent so the section belongs to the booking it's part of. */
  accent: string;
  className?: string;
}) {
  const { data: products, isLoading } = useShopProducts();
  const [cat, setCat] = useState<string>(BOOKING_ADDON_CATEGORIES[0]);

  const byCategory = useMemo(() => {
    const rows = (products ?? []).filter(
      (p) => p.status !== "archived" && !(p.trackInventory && p.stock <= 0),
    );
    return BOOKING_ADDON_CATEGORIES.map((c) => ({
      config: PRODUCT_CATEGORIES[c],
      items: rows.filter((p) => p.category === c).slice(0, 6),
    })).filter((g) => g.items.length > 0);
  }, [products]);

  const active = byCategory.find((g) => g.config.id === cat) ?? byCategory[0];
  const count = Object.values(selection).reduce((s, q) => s + q, 0);

  const setQty = (product: Product, qty: number) => {
    const next = { ...selection };
    const max = product.trackInventory ? product.stock : 99;
    if (qty <= 0) delete next[product.id];
    else next[product.id] = Math.min(qty, max);
    onChange(next);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!active) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Icon name="shopping-bag" className="size-4" style={{ color: accent }} />
            Add from the Pro Shop
          </h3>
          <p className="mt-0.5 text-xs text-ink-tertiary">
            Ready courtside when your session ends.
          </p>
        </div>
        {count > 0 && (
          <span
            className="tnum shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              background: `color-mix(in oklab, ${accent} 16%, transparent)`,
              color: accent,
            }}
          >
            {count} added
          </span>
        )}
      </div>

      {/* category chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {byCategory.map((g) => {
          const on = g.config.id === active.config.id;
          return (
            <button
              key={g.config.id}
              type="button"
              onClick={() => setCat(g.config.id)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                on
                  ? "border-transparent bg-fill-5 text-foreground"
                  : "border-(--border-default) text-ink-secondary hover:border-(--border-strong)",
              )}
            >
              <Icon
                name={g.config.icon}
                className="size-3.5"
                style={{ color: g.config.color }}
              />
              {g.config.short}
            </button>
          );
        })}
      </div>

      {/* products */}
      <div className="grid grid-cols-2 gap-2">
        {active.items.map((p) => {
          const qty = selection[p.id] ?? 0;
          return (
            <div
              key={p.id}
              className={cn(
                "flex flex-col rounded-xl border p-2 transition-colors",
                qty > 0
                  ? "border-transparent bg-fill-3 ring-1 ring-brand/30"
                  : "border-(--border-subtle) bg-surface",
              )}
            >
              <div className="flex items-center gap-2">
                <ProductThumb
                  category={p.category}
                  emoji={p.emoji}
                  imageUrl={p.imageUrl}
                  name={p.name}
                  className="size-10 shrink-0 rounded-lg"
                  emojiClassName="text-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-medium leading-tight text-foreground">
                    {p.name}
                  </p>
                  <p className="tnum text-xs font-semibold text-ink-secondary">
                    {formatCurrency(p.price)}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                {qty > 0 ? (
                  <QuantityStepper
                    size="sm"
                    min={0}
                    value={qty}
                    max={p.trackInventory ? p.stock : undefined}
                    label={p.name}
                    onChange={(next) => setQty(p, next)}
                    className="justify-between"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setQty(p, 1)}
                    className="flex h-7 w-full items-center justify-center gap-1 rounded-lg border border-(--border-default) text-xs font-semibold text-ink-secondary transition-colors hover:border-(--border-strong) hover:text-foreground"
                  >
                    <Icon name="plus" className="size-3.5" /> Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
