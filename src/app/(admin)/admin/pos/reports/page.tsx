"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { CHART_COLORS } from "@/components/charts/chart-theme";
import { AdminHeader } from "@/features/admin/admin-header";
import { PosKpis } from "@/features/pos/pos-kpis";
import { BestSellersCard } from "@/features/pos/pos-lists";
import {
  useInventoryValue,
  useRevenueByCategory,
  useSalesSeries,
} from "@/features/pos/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";

export default function PosReportsPage() {
  const { data: daily } = useSalesSeries(14);
  const { data: weekly } = useSalesSeries(7);
  const { data: byCategory } = useRevenueByCategory();
  const { data: inventory } = useInventoryValue();

  const categoryDonut = (byCategory ?? []).map((c) => ({ name: c.label, value: c.revenue, color: c.color }));
  const totalCategoryRevenue = (byCategory ?? []).reduce((s, c) => s + c.revenue, 0);
  const maxInvValue = useMemo(
    () => Math.max(1, ...(inventory?.byCategory ?? []).map((c) => c.value)),
    [inventory],
  );

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Sales &amp; inventory reports"
        subtitle="Retail performance — daily, weekly, by product & category"
        actions={
          <>
            <Button variant="secondary" size="sm"><Icon name="calendar" className="size-4" /> Last 30 days</Button>
            <Button size="sm"><Icon name="arrow-right" className="size-4" /> Export</Button>
          </>
        }
      />

      <PosKpis keys={["posRevenueToday", "retailRevenue", "avgOrderValue", "lowStock"]} />

      {/* daily trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily sales</CardTitle>
          <CardDescription>POS revenue over the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          {daily ? (
            <AreaChart
              data={daily}
              xKey="label"
              height={300}
              series={[{ key: "revenue", name: "Revenue", color: CHART_COLORS.emerald }]}
              valueFormatter={(v) => formatCurrency(v)}
            />
          ) : (
            <Skeleton className="h-[300px] w-full" />
          )}
        </CardContent>
      </Card>

      {/* weekly + category */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>This week by day</CardTitle>
            <CardDescription>Revenue &amp; order volume, last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {weekly ? (
              <BarChart
                data={weekly}
                xKey="label"
                barKey="revenue"
                name="Revenue"
                valueFormatter={(v) => formatCurrency(v)}
              />
            ) : (
              <Skeleton className="h-72 w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by category</CardTitle>
            <CardDescription>Where retail sales come from</CardDescription>
          </CardHeader>
          <CardContent>
            {byCategory ? (
              <>
                <DonutChart
                  data={categoryDonut}
                  centerValue={formatCurrency(totalCategoryRevenue)}
                  centerLabel="retail"
                  valueFormatter={(v) => formatCurrency(v)}
                  height={220}
                />
                <div className="mt-4 space-y-2">
                  {(byCategory ?? []).map((c) => (
                    <div key={c.category} className="flex items-center gap-2 text-sm">
                      <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                      <span className="text-ink-secondary">{c.label}</span>
                      <span className="tnum ml-auto font-medium text-foreground">{formatCurrency(c.revenue)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Skeleton className="h-72 w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* best sellers + inventory value */}
      <div className="grid gap-5 lg:grid-cols-2">
        <BestSellersCard limit={8} />

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Inventory value</CardTitle>
              <CardDescription>Stock on hand, valued at cost</CardDescription>
            </div>
            {inventory && (
              <span className="tnum text-xl font-bold text-foreground">{formatCurrency(inventory.total)}</span>
            )}
          </CardHeader>
          <CardContent>
            {inventory ? (
              <div className="space-y-3">
                {inventory.byCategory.map((c) => (
                  <div key={c.category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-ink-secondary">{c.label}</span>
                      <span className="tnum font-medium text-foreground">{formatCurrency(c.value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-fill-4">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(c.value / maxInvValue) * 100}%`, background: c.color }}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-(--border-subtle) pt-3 text-sm">
                  <span className="text-ink-secondary">{inventory.unitsInStock} units · {inventory.skus} SKUs</span>
                  <span className="tnum font-semibold text-foreground">{formatCurrency(inventory.total)}</span>
                </div>
              </div>
            ) : (
              <Skeleton className="h-72 w-full" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
