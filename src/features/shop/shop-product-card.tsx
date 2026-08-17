"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { PRODUCT_CATEGORIES } from "@/lib/constants/pos";
import { formatCurrency } from "@/lib/utils/format";
import { isLowStock } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { ProductThumb } from "@/features/pos/product-thumb";
import { useShopCartStore } from "@/stores/shop-cart-store";

/**
 * Storefront product card. The card links to the detail page; the add button
 * sits on top so browsing and one-tap buying coexist. Quick-add deliberately
 * doesn't open the basket — the header cart carries the running total.
 */
export function ShopProductCard({ product, className }: { product: Product; className?: string }) {
  const addProduct = useShopCartStore((s) => s.addProduct);
  const inCart = useShopCartStore((s) =>
    s.items
      .filter((l) => l.kind === "product" && l.refId === product.id)
      .reduce((sum, l) => sum + l.quantity, 0),
  );

  const cat = PRODUCT_CATEGORIES[product.category];
  const out = product.trackInventory && product.stock <= 0;
  const low = isLowStock(product);
  const atStockLimit = product.trackInventory && inCart >= product.stock;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-raised shadow-sh-1 transition-all duration-300 hover:-translate-y-1 hover:border-(--border-strong) hover:shadow-sh-3",
        out && "opacity-70",
        className,
      )}
    >
      <Link href={`/app/shop/${product.id}`} className="block focus-visible:outline-none">
        <div className="relative">
          <ProductThumb
            category={product.category}
            emoji={product.emoji}
            imageUrl={product.imageUrl}
            name={product.name}
            className="aspect-[4/3] w-full"
            emojiClassName="text-5xl transition-transform duration-300 group-hover:scale-110"
          />
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold backdrop-blur"
            style={{
              color: cat.color,
              borderColor: `color-mix(in oklab, ${cat.color} 30%, transparent)`,
              background: `color-mix(in oklab, ${cat.color} 16%, var(--bg-raised))`,
            }}
          >
            <Icon name={cat.icon} className="size-3" /> {cat.short}
          </span>
          {out ? (
            <span className="absolute right-3 top-3 rounded-full bg-danger/90 px-2 py-0.5 text-[10px] font-semibold text-white">
              Sold out
            </span>
          ) : low ? (
            <span className="absolute right-3 top-3 rounded-full bg-orange/90 px-2 py-0.5 text-[10px] font-semibold text-white">
              Only {product.stock} left
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link href={`/app/shop/${product.id}`} className="focus-visible:outline-none">
          <h3 className="text-balance text-sm font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-brand">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-ink-tertiary">{product.description}</p>
        )}

        {/* Narrow cards (2-up on phones) can't fit price + labelled pill, so the
            button collapses to a round icon-only tap target below `sm`. */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="tnum min-w-0 truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
            {formatCurrency(product.price)}
          </span>
          <button
            type="button"
            disabled={out || atStockLimit}
            onClick={() => addProduct(product)}
            aria-label={
              inCart > 0 ? `${product.name} — ${inCart} in cart, add another` : `Add ${product.name} to cart`
            }
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200",
              "size-9 sm:h-9 sm:w-auto sm:gap-1.5 sm:px-3",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
              out || atStockLimit
                ? "cursor-not-allowed bg-fill-4 text-ink-tertiary"
                : "bg-grad-brand text-white shadow-glow-brand hover:brightness-110 active:scale-95",
            )}
          >
            {inCart > 0 ? (
              <>
                <span className="tnum text-sm sm:hidden">{inCart}</span>
                <Icon name="check" className="hidden size-3.5 sm:block" strokeWidth={3} />
                <span className="hidden sm:inline">{inCart} in cart</span>
              </>
            ) : (
              <>
                <Icon name="plus" className="size-4 sm:size-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
