"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types";
import { PRODUCT_CATEGORIES } from "@/lib/constants/pos";
import { AdminHeader } from "@/features/admin/admin-header";
import { useProducts } from "@/features/pos/hooks";
import { ProductCard } from "@/features/pos/product-card";
import { ProductFormDialog } from "@/features/pos/product-form-dialog";
import { StockAdjustDialog } from "@/features/pos/stock-adjust-dialog";
import { CategoryPills, type CategoryFilter } from "@/features/pos/category-pills";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function PosCatalogPage() {
  const { data, isLoading } = useProducts();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategoryFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjusting, setAdjusting] = useState<Product | undefined>();

  const products = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode ?? "").includes(query.trim()) ||
          PRODUCT_CATEGORIES[p.category].label.toLowerCase().includes(q)),
    );
  }, [products, cat, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    for (const p of products) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [products]);

  const activeCount = products.filter((p) => p.status === "active").length;

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setFormOpen(true);
  }
  function openAdjust(p: Product) {
    setAdjusting(p);
    setAdjustOpen(true);
  }

  return (
    <div className="space-y-5">
      <AdminHeader
        title="Product catalog"
        subtitle={`${products.length} products · ${activeCount} active`}
        actions={
          <Button size="sm" onClick={openNew}>
            <Icon name="plus" className="size-4" /> Add product
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Icon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, SKU or barcode…"
          className="pl-9"
        />
      </div>

      <CategoryPills value={cat} onChange={setCat} counts={counts} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="package"
          title="No products found"
          description="Try a different search, or add a new product to the catalog."
          action={
            <Button size="sm" onClick={openNew}>
              <Icon name="plus" className="size-4" /> Add product
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onEdit={openEdit} onAdjust={openAdjust} />
          ))}
        </div>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />
      <StockAdjustDialog open={adjustOpen} onOpenChange={setAdjustOpen} product={adjusting} />
    </div>
  );
}
