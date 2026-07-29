"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PosKpis } from "./pos-kpis";
import { BestSellersCard, LowStockCard } from "./pos-lists";

/** Point-of-Sale block for the admin dashboard — KPIs + best sellers + low stock. */
export function PosDashboardSection() {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Icon name="shopping-cart" className="size-5 text-brand" /> Point of Sale
          </h2>
          <p className="mt-0.5 text-sm text-ink-secondary">Retail &amp; pro-shop performance</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/pos">
            <Icon name="shopping-cart" className="size-4" /> Open register
          </Link>
        </Button>
      </div>

      <PosKpis keys={["posRevenueToday", "productsSoldToday", "retailRevenue", "avgOrderValue"]} />

      <div className="grid gap-5 lg:grid-cols-2">
        <BestSellersCard limit={5} />
        <LowStockCard />
      </div>
    </section>
  );
}
