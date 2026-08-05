"use client";

import Link from "next/link";
import { useState } from "react";
import { PRODUCT_CATEGORIES, TAX_LABEL } from "@/lib/constants/pos";
import { PICKUP_METHODS } from "@/lib/constants/commerce";
import { formatCurrency } from "@/lib/utils/format";
import { isLowStock } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";
import { useShopCartStore } from "@/stores/shop-cart-store";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductThumb } from "@/features/pos/product-thumb";
import { useRelatedProducts, useShopProduct } from "./hooks";
import { ShopProductCard } from "./shop-product-card";
import { QuantityStepper } from "./quantity-stepper";

/** Full product page: what it is, what it costs, how to get it. */
export function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading, isError } = useShopProduct(productId);
  const { data: related } = useRelatedProducts(productId);
  const addProduct = useShopCartStore((s) => s.addProduct);
  const setOpen = useShopCartStore((s) => s.setOpen);
  const inCart = useShopCartStore((s) =>
    s.items
      .filter((l) => l.kind === "product" && l.refId === productId)
      .reduce((sum, l) => sum + l.quantity, 0),
  );
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <EmptyState
        icon="package"
        title="Product not found"
        description="It may have sold out or been retired from the shop."
        action={
          <Button size="sm" asChild>
            <Link href="/app/shop">Back to the shop</Link>
          </Button>
        }
      />
    );
  }

  const cat = PRODUCT_CATEGORIES[product.category];
  const out = product.trackInventory && product.stock <= 0;
  const low = isLowStock(product);
  const remaining = product.trackInventory ? Math.max(0, product.stock - inCart) : undefined;
  const maxQty = remaining === undefined ? undefined : Math.max(1, remaining);
  const canAdd = !out && (remaining === undefined || remaining > 0);

  return (
    <div className="space-y-10">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/app/shop">
          <Icon name="chevron-left" className="size-4" /> All products
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* visual */}
        <div className="relative overflow-hidden rounded-3xl border border-(--border-subtle) shadow-sh-2">
          <ProductThumb
            category={product.category}
            emoji={product.emoji}
            imageUrl={product.imageUrl}
            name={product.name}
            className="aspect-[4/3] w-full"
            emojiClassName="text-[8rem]"
          />
          <span
            className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur"
            style={{
              color: cat.color,
              borderColor: `color-mix(in oklab, ${cat.color} 30%, transparent)`,
              background: `color-mix(in oklab, ${cat.color} 16%, var(--bg-raised))`,
            }}
          >
            <Icon name={cat.icon} className="size-3.5" /> {cat.label}
          </span>
        </div>

        {/* details */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>
          {product.description && (
            <p className="mt-2 text-ink-secondary">{product.description}</p>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="tnum text-3xl font-bold tracking-tight">
              {formatCurrency(product.price)}
            </span>
            <span className="text-sm text-ink-tertiary">
              {product.taxRate > 0 ? `+ ${TAX_LABEL}` : "Tax-free"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                "tnum rounded-full px-2.5 py-1 font-semibold",
                out
                  ? "bg-danger/12 text-danger"
                  : low
                    ? "bg-orange/12 text-orange"
                    : "bg-emerald/12 text-emerald",
              )}
            >
              {out
                ? "Sold out"
                : product.trackInventory
                  ? `${product.stock} in stock`
                  : "Always available"}
            </span>
            <span className="rounded-full bg-fill-5 px-2.5 py-1 font-medium text-ink-secondary">
              SKU {product.sku}
            </span>
            {product.sport && (
              <span className="rounded-full bg-fill-5 px-2.5 py-1 font-medium capitalize text-ink-secondary">
                {product.sport}
              </span>
            )}
          </div>

          {/* pickup promise */}
          <div className="mt-6 space-y-2 rounded-2xl border border-(--border-subtle) bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
              Collect it your way
            </p>
            {Object.values(PICKUP_METHODS).map((m) => (
              <div key={m.id} className="flex items-center gap-2.5 text-sm">
                <Icon name={m.icon} className="size-4" style={{ color: m.color }} />
                <span className="text-foreground">{m.label}</span>
                <span className="ml-auto text-xs text-ink-tertiary">{m.location}</span>
              </div>
            ))}
          </div>

          {/* buy */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <QuantityStepper
              value={qty}
              onChange={(next) => setQty(Math.max(1, next))}
              max={maxQty}
              label={product.name}
            />
            <Button
              size="lg"
              className="flex-1"
              disabled={!canAdd}
              onClick={() => {
                addProduct(product, qty);
                setQty(1);
                setOpen(true);
              }}
            >
              <Icon name="shopping-bag" className="size-4" />
              {out ? "Sold out" : `Add to cart · ${formatCurrency(product.price * qty)}`}
            </Button>
          </div>
          {inCart > 0 && (
            <p className="mt-2 text-xs text-ink-tertiary">
              {inCart} already in your cart ·{" "}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="font-medium text-brand hover:underline"
              >
                view cart
              </button>
            </p>
          )}
        </div>
      </div>

      {/* related */}
      {(related ?? []).length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">More {cat.label.toLowerCase()}</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {(related ?? []).map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
