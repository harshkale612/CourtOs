"use client";

import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils/format";
import { isLowStock } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { ProductThumb } from "./product-thumb";

/** Large, touch-friendly register tile. Tap adds one unit to the cart. */
export function ProductTile({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const out = product.trackInventory && product.stock <= 0;
  const low = isLowStock(product);

  return (
    <button
      type="button"
      disabled={out}
      onClick={() => onAdd(product)}
      className={cn(
        "group relative flex flex-col rounded-2xl border border-(--border-subtle) bg-raised p-2.5 text-left shadow-sh-1 transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-(--border-strong) hover:shadow-sh-3 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        out && "cursor-not-allowed opacity-55",
      )}
    >
      <div className="relative mb-2.5">
        <ProductThumb
          category={product.category}
          emoji={product.emoji}
          imageUrl={product.imageUrl}
          name={product.name}
          className="aspect-square w-full rounded-xl"
          emojiClassName="text-4xl sm:text-5xl"
        />
        {/* Hover-reveal is invisible on touch, so the badge stays on for
            pointer-less devices and only fades in on hover for mice. */}
        {!out && (
          <span className="absolute bottom-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-grad-brand text-white shadow-glow-brand transition-opacity duration-200 sm:size-7 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
            <Icon name="plus" className="size-4" strokeWidth={2.5} />
          </span>
        )}
        {out ? (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-danger/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            Out
          </span>
        ) : low ? (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-orange/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            {product.stock} left
          </span>
        ) : null}
      </div>
      <p className="line-clamp-2 min-h-[2.5em] text-sm font-medium leading-tight text-foreground">
        {product.name}
      </p>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="tnum text-sm font-bold text-foreground">{formatCurrency(product.price)}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-tertiary">
          {product.sku}
        </span>
      </div>
    </button>
  );
}
