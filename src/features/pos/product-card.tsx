"use client";

import type { Product } from "@/types";
import { PRODUCT_CATEGORIES, PRODUCT_STATUS, TAX_LABEL } from "@/lib/constants/pos";
import { formatCurrency } from "@/lib/utils/format";
import { isLowStock } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ProductThumb } from "./product-thumb";

/** Catalog management card — product at a glance with edit / stock actions. */
export function ProductCard({
  product,
  onEdit,
  onAdjust,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onAdjust: (p: Product) => void;
}) {
  const cat = PRODUCT_CATEGORIES[product.category];
  const status = PRODUCT_STATUS[product.status];
  const out = product.trackInventory && product.stock <= 0;
  const low = isLowStock(product);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-raised shadow-sh-2 transition-all duration-300 hover:-translate-y-1 hover:border-(--border-strong) hover:shadow-sh-3">
      <div className="relative">
        <ProductThumb
          category={product.category}
          emoji={product.emoji}
          imageUrl={product.imageUrl}
          name={product.name}
          className="aspect-[4/3] w-full"
          emojiClassName="text-5xl"
        />
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold backdrop-blur"
          style={{
            color: cat.color,
            borderColor: `color-mix(in oklab, ${cat.color} 30%, transparent)`,
            background: `color-mix(in oklab, ${cat.color} 16%, var(--bg-raised))`,
          }}
        >
          <Icon name={cat.icon} className="size-3" /> {cat.label}
        </span>
        <div className="absolute right-3 top-3">
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-balance font-semibold leading-snug tracking-tight">{product.name}</h3>
          <span className="tnum shrink-0 font-bold text-foreground">{formatCurrency(product.price)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-tertiary">
          SKU {product.sku}
          {product.barcode ? ` · ${product.barcode}` : ""}
        </p>
        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-ink-secondary">{product.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          {product.trackInventory ? (
            <span
              className={cn(
                "tnum rounded-full px-2 py-0.5 font-semibold",
                out
                  ? "bg-danger/12 text-danger"
                  : low
                    ? "bg-orange/12 text-orange"
                    : "bg-emerald/12 text-emerald",
              )}
            >
              {out ? "Out of stock" : `${product.stock} in stock`}
            </span>
          ) : (
            <span className="rounded-full bg-fill-5 px-2 py-0.5 font-medium text-ink-secondary">Service</span>
          )}
          <span className="rounded-full bg-fill-5 px-2 py-0.5 font-medium text-ink-secondary">
            {product.taxRate > 0 ? `${TAX_LABEL} ${Math.round(product.taxRate * 100)}%` : "Tax-free"}
          </span>
        </div>

        <div className="mt-4 flex gap-2 pt-1">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => onEdit(product)}>
            <Icon name="pencil" className="size-4" /> Edit
          </Button>
          {product.trackInventory && (
            <Button variant="secondary" size="sm" onClick={() => onAdjust(product)}>
              <Icon name="boxes" className="size-4" /> Stock
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
