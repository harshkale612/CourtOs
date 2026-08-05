"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { formatCurrency } from "@/lib/utils/format";
import { computeTotals, lineNet } from "@/lib/utils/pos";
import { useShopCartStore } from "@/stores/shop-cart-store";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductThumb } from "@/features/pos/product-thumb";
import { useShopProducts } from "./hooks";
import { QuantityStepper } from "./quantity-stepper";
import { OrderSummary } from "./order-summary";

/**
 * Slide-over basket. Mounted once in the portal shell so "Add" works from
 * anywhere — browse grid, product page, or a reorder in the order history.
 */
export function CartSheet() {
  const pathname = usePathname();
  const open = useShopCartStore((s) => s.open);
  const setOpen = useShopCartStore((s) => s.setOpen);
  const items = useShopCartStore((s) => s.items);
  const setQuantity = useShopCartStore((s) => s.setQuantity);
  const removeItem = useShopCartStore((s) => s.removeItem);
  const clear = useShopCartStore((s) => s.clear);
  const { data: products } = useShopProducts();

  // Stock ceilings so a member can't over-order from the basket.
  const stockById = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products ?? []) if (p.trackInventory) map.set(p.id, p.stock);
    return map;
  }, [products]);

  const totals = computeTotals(items);
  const empty = items.length === 0;
  const onCheckout = pathname === "/app/shop/checkout";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-(--border-subtle)">
          <SheetTitle className="flex items-center gap-2">
            <Icon name="shopping-bag" className="size-5 text-brand" />
            Your cart
            {!empty && (
              <span className="tnum rounded-full bg-fill-4 px-2 py-0.5 text-xs font-semibold">
                {totals.itemCount}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Collect at the club — pick your spot at checkout.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {empty ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon="shopping-bag"
                title="Your cart is empty"
                description="Browse the pro shop and add a few essentials for your next session."
                className="border-0"
                action={
                  <Button size="sm" asChild onClick={() => setOpen(false)}>
                    <Link href="/app/shop">Browse the shop</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((line) => {
                const max = line.refId ? stockById.get(line.refId) : undefined;
                return (
                  <li
                    key={line.id}
                    className="flex gap-3 rounded-xl border border-(--border-subtle) bg-surface p-3"
                  >
                    <ProductThumb
                      category={line.category ?? "merch"}
                      emoji={line.emoji}
                      imageUrl={line.imageUrl}
                      name={line.name}
                      className="size-14 shrink-0 rounded-lg"
                      emojiClassName="text-2xl"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                          {line.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(line.id)}
                          aria-label={`Remove ${line.name}`}
                          className="shrink-0 text-ink-tertiary transition-colors hover:text-danger"
                        >
                          <Icon name="x" className="size-4" />
                        </button>
                      </div>
                      <p className="tnum mt-0.5 text-xs text-ink-tertiary">
                        {formatCurrency(line.unitPrice)} each
                        {max !== undefined && line.quantity >= max ? " · max stock" : ""}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <QuantityStepper
                          size="sm"
                          value={line.quantity}
                          max={max}
                          label={line.name}
                          onChange={(next) => setQuantity(line.id, next)}
                        />
                        <span className="tnum text-sm font-semibold text-foreground">
                          {formatCurrency(lineNet(line))}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!empty && (
          <div className="space-y-3 border-t border-(--border-subtle) p-4">
            <OrderSummary items={items} />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clear}>
                <Icon name="trash-2" className="size-4" /> Clear
              </Button>
              {onCheckout ? (
                // Already on checkout — the basket just gets out of the way.
                <Button className="flex-1" size="lg" onClick={() => setOpen(false)}>
                  <Icon name="check" className="size-4" /> Done · {formatCurrency(totals.total)}
                </Button>
              ) : (
                <Button className="flex-1" size="lg" asChild onClick={() => setOpen(false)}>
                  <Link href="/app/shop/checkout">
                    <Icon name="credit-card" className="size-4" /> Checkout ·{" "}
                    {formatCurrency(totals.total)}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
