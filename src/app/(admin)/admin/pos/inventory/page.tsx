"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types";
import { PRODUCT_CATEGORIES, PRODUCT_STATUS, RETAIL_CATEGORY_LIST } from "@/lib/constants/pos";
import { formatCurrency } from "@/lib/utils/format";
import { inventoryValueAt, isLowStock } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";
import { AdminHeader } from "@/features/admin/admin-header";
import { useInventoryValue, useProducts } from "@/features/pos/hooks";
import { ProductThumb } from "@/features/pos/product-thumb";
import { StockAdjustDialog } from "@/features/pos/stock-adjust-dialog";
import { LowStockCard } from "@/features/pos/pos-lists";
import { CategoryPills, type CategoryFilter } from "@/features/pos/category-pills";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PosInventoryPage() {
  const { data, isLoading } = useProducts();
  const { data: invValue } = useInventoryValue();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategoryFilter>("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjusting, setAdjusting] = useState<Product | undefined>();

  const tracked = useMemo(
    () => (data ?? []).filter((p) => p.trackInventory && p.status !== "archived"),
    [data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tracked
      .filter(
        (p) =>
          (cat === "all" || p.category === cat) &&
          (!lowOnly || p.stock <= p.lowStockThreshold) &&
          (q === "" || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
      )
      .sort((a, b) => a.stock - b.stock);
  }, [tracked, cat, query, lowOnly]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tracked.length };
    for (const p of tracked) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [tracked]);

  const lowCount = tracked.filter((p) => p.stock <= p.lowStockThreshold).length;
  const unitsInStock = invValue?.unitsInStock ?? tracked.reduce((s, p) => s + p.stock, 0);

  function openAdjust(p: Product) {
    setAdjusting(p);
    setAdjustOpen(true);
  }
  function openAdjustById(id: string) {
    const p = tracked.find((x) => x.id === id);
    if (p) openAdjust(p);
  }

  return (
    <div className="space-y-5">
      <AdminHeader
        title="Inventory"
        subtitle="Stock levels, low-stock alerts & adjustments"
      />

      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Inventory value" value={invValue?.total ?? 0} icon="circle-dollar-sign" accent="var(--accent-emerald)" format={(n) => formatCurrency(Math.round(n))} />
        <StatCard label="Units in stock" value={unitsInStock} icon="boxes" accent="var(--accent-blue)" />
        <StatCard label="SKUs tracked" value={invValue?.skus ?? tracked.length} icon="package" accent="var(--accent-purple)" />
        <StatCard label="Low / out of stock" value={lowCount} icon="triangle-alert" accent="var(--accent-orange)" />
      </div>

      <LowStockCard onRestock={openAdjustById} />

      {/* filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="pl-9" />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-secondary">
          <Switch checked={lowOnly} onCheckedChange={setLowOnly} /> Low stock only
        </label>
      </div>

      <CategoryPills value={cat} onChange={setCat} counts={counts} categories={RETAIL_CATEGORY_LIST} />

      {/* table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState icon="boxes" title="Nothing here" description="No products match this filter." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Unit cost</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Value</TableHead>
                  <TableHead className="text-right">Adjust</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const catCfg = PRODUCT_CATEGORIES[p.category];
                  const status = PRODUCT_STATUS[p.status];
                  const out = p.stock <= 0;
                  const low = isLowStock(p);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ProductThumb category={p.category} emoji={p.emoji} name={p.name} className="size-9 shrink-0 rounded-lg" emojiClassName="text-lg" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{p.name}</p>
                            <p className="text-xs text-ink-tertiary">{p.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: catCfg.color }}>
                          <Icon name={catCfg.icon} className="size-3.5" /> {catCfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn("tnum font-semibold", out ? "text-danger" : low ? "text-orange" : "text-foreground")}>
                          {p.stock}
                        </span>
                        <span className="tnum ml-1 text-xs text-ink-tertiary">/ {p.lowStockThreshold}</span>
                      </TableCell>
                      <TableCell>
                        <Badge tone={out ? "danger" : low ? "warning" : status.tone}>
                          {out ? "Out" : low ? "Low" : status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell tnum text-right text-ink-secondary">
                        {p.cost != null ? formatCurrency(p.cost) : "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell tnum text-right font-medium text-foreground">
                        {formatCurrency(inventoryValueAt(p))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="secondary" size="sm" onClick={() => openAdjust(p)}>
                          <Icon name="boxes" className="size-4" /> Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <StockAdjustDialog open={adjustOpen} onOpenChange={setAdjustOpen} product={adjusting} />
    </div>
  );
}
