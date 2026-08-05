"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BOOKING_ADDON_CATEGORIES } from "@/lib/constants/commerce";
import { formatCurrency } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductThumb } from "@/features/pos/product-thumb";
import { useShopProducts } from "./hooks";
import { useShopCartStore } from "@/stores/shop-cart-store";

/** Dashboard shortcut into the Pro Shop — a few staples, one tap to add. */
export function ShopTeaser({ limit = 4 }: { limit?: number }) {
  const { data: products, isLoading } = useShopProducts();
  const addProduct = useShopCartStore((s) => s.addProduct);
  const setOpen = useShopCartStore((s) => s.setOpen);

  const picks = useMemo(() => {
    const rows = (products ?? []).filter(
      (p) => p.status === "active" && !(p.trackInventory && p.stock <= 0),
    );
    // One from each add-on category first, then fill by price.
    const seen = new Set<string>();
    const out = [];
    for (const cat of BOOKING_ADDON_CATEGORIES) {
      const hit = rows.find((p) => p.category === cat && !seen.has(p.id));
      if (hit) {
        seen.add(hit.id);
        out.push(hit);
      }
    }
    for (const p of rows) {
      if (out.length >= limit) break;
      if (!seen.has(p.id)) {
        seen.add(p.id);
        out.push(p);
      }
    }
    return out.slice(0, limit);
  }, [products, limit]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Icon name="store" className="size-5 text-brand" /> From the Pro Shop
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/shop">
            Shop all <Icon name="arrow-right" className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {picks.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col rounded-xl border border-(--border-subtle) bg-surface p-2 transition-colors hover:border-(--border-strong)"
              >
                <Link href={`/app/shop/${p.id}`} className="focus-visible:outline-none">
                  <ProductThumb
                    category={p.category}
                    emoji={p.emoji}
                    imageUrl={p.imageUrl}
                    name={p.name}
                    className="aspect-square w-full rounded-lg"
                    emojiClassName="text-3xl transition-transform duration-300 group-hover:scale-110"
                  />
                  <p className="mt-2 line-clamp-2 text-xs font-medium leading-tight text-foreground">
                    {p.name}
                  </p>
                </Link>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="tnum text-xs font-bold text-foreground">
                    {formatCurrency(p.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addProduct(p);
                      setOpen(true);
                    }}
                    aria-label={`Add ${p.name} to cart`}
                    className="flex size-7 items-center justify-center rounded-full bg-grad-brand text-white shadow-glow-brand transition-transform hover:brightness-110 active:scale-95"
                  >
                    <Icon name="plus" className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
