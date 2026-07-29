"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RETAIL_CATEGORIES, RETAIL_CATEGORY_LIST } from "@/lib/constants/pos";
import { AdminHeader } from "@/features/admin/admin-header";
import { useProducts } from "@/features/pos/hooks";
import { ProductTile } from "@/features/pos/product-tile";
import { CartPanel } from "@/features/pos/cart-panel";
import { CategoryPills, type CategoryFilter } from "@/features/pos/category-pills";
import { usePosCartStore } from "@/stores/pos-cart-store";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function PosRegisterPage() {
  const { data: products, isLoading } = useProducts();
  const addProduct = usePosCartStore((s) => s.addProduct);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategoryFilter>("all");

  const retail = useMemo(
    () => (products ?? []).filter((p) => RETAIL_CATEGORIES.includes(p.category) && p.status !== "archived"),
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return retail.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode ?? "").includes(query.trim())),
    );
  }, [retail, cat, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: retail.length };
    for (const p of retail) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [retail]);

  // Scanner / keyboard: Enter adds an exact barcode/SKU match or a lone result.
  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const q = query.trim();
    if (!q) return;
    const target =
      retail.find((p) => p.barcode === q) ??
      retail.find((p) => p.sku.toLowerCase() === q.toLowerCase()) ??
      (filtered.length === 1 ? filtered[0] : undefined);
    if (target && !(target.trackInventory && target.stock <= 0)) {
      addProduct(target);
      setQuery("");
    }
  }

  return (
    <div className="space-y-5">
      <AdminHeader
        title="Register"
        subtitle="Ring up retail products & club services · Baseline Racquet Club"
        actions={
          <>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/admin/pos/catalog"><Icon name="package" className="size-4" /> Catalog</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/admin/pos/reports"><Icon name="bar-chart-3" className="size-4" /> Reports</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
        {/* catalog */}
        <div className="space-y-4">
          <div className="relative">
            <Icon name="barcode" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Scan a barcode or search products…"
              className="h-12 pl-10 text-base"
            />
          </div>

          <CategoryPills value={cat} onChange={setCat} counts={counts} categories={RETAIL_CATEGORY_LIST} />

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="search"
              title="No products found"
              description="Try a different search or category."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductTile key={p.id} product={p} onAdd={addProduct} />
              ))}
            </div>
          )}
        </div>

        {/* cart */}
        <CartPanel className="lg:sticky lg:top-6 lg:max-h-[calc(100dvh-7rem)] lg:min-h-[32rem]" />
      </div>
    </div>
  );
}
