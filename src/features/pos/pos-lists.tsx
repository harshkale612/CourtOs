"use client";

import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/lib/constants/pos";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useBestSellers, useLowStock } from "./hooks";

/** Top-selling products by units sold. */
export function BestSellersCard({ limit = 6, className }: { limit?: number; className?: string }) {
  const { data, isLoading } = useBestSellers(limit);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="trending-up" className="size-5 text-brand" /> Best sellers
        </CardTitle>
        <CardDescription>Top products by units sold</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="space-y-2">
            {Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((p, i) => {
              const cat = PRODUCT_CATEGORIES[p.category];
              return (
                <div key={p.productId} className="flex items-center gap-3 rounded-lg px-1.5 py-2">
                  <span className="tnum w-5 text-center text-sm font-semibold text-ink-tertiary">{i + 1}</span>
                  <span
                    className="flex size-9 items-center justify-center rounded-lg text-lg"
                    style={{ background: `color-mix(in oklab, ${cat.color} 16%, transparent)` }}
                    aria-hidden
                  >
                    {p.emoji ?? cat.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-ink-tertiary">{cat.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="tnum text-sm font-semibold text-foreground">{p.quantity} sold</p>
                    <p className="tnum text-xs text-ink-tertiary">{formatCurrency(p.revenue)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Products at or below their low-stock threshold. */
export function LowStockCard({
  className,
  onRestock,
}: {
  className?: string;
  onRestock?: (productId: string) => void;
}) {
  const { data, isLoading } = useLowStock();

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Icon name="triangle-alert" className="size-5 text-orange" /> Low stock
          </CardTitle>
          <CardDescription>Reorder before you run out</CardDescription>
        </div>
        {!onRestock && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/pos/inventory">
              Manage <Icon name="arrow-right" className="size-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState icon="check-circle" title="All stocked up" description="No products are low right now." className="border-0 py-10" />
        ) : (
          <div className="space-y-1">
            {data.map((p) => {
              const out = p.stock <= 0;
              const pct = Math.min(100, Math.round((p.stock / Math.max(1, p.lowStockThreshold)) * 100));
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-lg px-1.5 py-2">
                  <span className="text-lg" aria-hidden>{p.emoji ?? "📦"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-fill-4">
                      <div
                        className={cn("h-full rounded-full", out ? "bg-danger" : "bg-orange")}
                        style={{ width: `${out ? 100 : Math.max(8, pct)}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={cn(
                      "tnum shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                      out ? "bg-danger/12 text-danger" : "bg-orange/12 text-orange",
                    )}
                  >
                    {out ? "Out" : `${p.stock} left`}
                  </span>
                  {onRestock && (
                    <Button variant="secondary" size="sm" onClick={() => onRestock(p.id)}>
                      Restock
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
