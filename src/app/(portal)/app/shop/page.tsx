"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SHOP_CATEGORY_LIST, SHOP_SORTS, type ShopSort } from "@/lib/constants/commerce";
import { formatCurrency } from "@/lib/utils/format";
import { useSessionUser } from "@/features/auth/use-session-user";
import { CategoryPills, type CategoryFilter } from "@/features/pos/category-pills";
import { useActivePickups, useShopProducts } from "@/features/shop/hooks";
import { ShopProductCard } from "@/features/shop/shop-product-card";
import { CartButton } from "@/features/shop/cart-button";
import { PickupBadge } from "@/features/shop/pickup-status";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ShopPage() {
  const user = useSessionUser();
  const { data: products, isLoading } = useShopProducts();
  const { data: pickups } = useActivePickups(user.id);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<ShopSort>("featured");

  const available = useMemo(
    () => (products ?? []).filter((p) => p.status !== "archived"),
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = available.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)),
    );
    const sorted = [...rows];
    if (sort === "price_asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else {
      // Featured: in-stock first, then the club's staples (cheap, fast movers).
      sorted.sort((a, b) => {
        const aOut = a.trackInventory && a.stock <= 0 ? 1 : 0;
        const bOut = b.trackInventory && b.stock <= 0 ? 1 : 0;
        return aOut - bOut || a.category.localeCompare(b.category) || a.price - b.price;
      });
    }
    return sorted;
  }, [available, cat, query, sort]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: available.length };
    for (const p of available) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [available]);

  const waiting = pickups ?? [];

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pro Shop</h1>
          <p className="mt-1 text-ink-secondary">
            Drinks, gear and club kit — order ahead and collect at the club.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/app/shop/orders">
              <Icon name="receipt" className="size-4" /> My orders
            </Link>
          </Button>
          <CartButton />
        </div>
      </div>

      {/* waiting for pickup */}
      {waiting.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-(--border-subtle) bg-grad-brand-soft p-4 sm:flex-row sm:items-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-raised text-brand">
            <Icon name="package-check" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {waiting.length} order{waiting.length === 1 ? "" : "s"} waiting for you
            </p>
            <p className="truncate text-xs text-ink-secondary">
              {waiting
                .slice(0, 2)
                .map((o) => `${o.number} · ${o.fulfillment?.location ?? "at the club"}`)
                .join("  ·  ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PickupBadge fulfillment={waiting[0].fulfillment} />
            <Button size="sm" variant="secondary" asChild>
              <Link href="/app/shop/orders">
                Track <Icon name="arrow-right" className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drinks, grips, apparel…"
            className="h-11 pl-10"
            aria-label="Search products"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-foreground"
            >
              <Icon name="x" className="size-4" />
            </button>
          )}
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as ShopSort)}>
          <SelectTrigger className="h-11 sm:w-56" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHOP_SORTS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CategoryPills
        value={cat}
        onChange={setCat}
        counts={counts}
        categories={SHOP_CATEGORY_LIST}
      />

      {/* grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="Nothing matches that"
          description="Try a different search term or browse another category."
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setQuery("");
                setCat("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-ink-tertiary">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
            {cat !== "all" ? " in this category" : ""} · from{" "}
            {formatCurrency(Math.min(...filtered.map((p) => p.price)))}
          </p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
