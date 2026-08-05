"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ORDER_CHANNELS } from "@/lib/constants/commerce";
import { formatCurrency } from "@/lib/utils/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart } from "@/components/charts/area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { CommerceKpis } from "./commerce-kpis";
import { BestSellersCard, LowStockCard } from "./pos-lists";
import { useChannelSeries, useCommerceSummary } from "./hooks";

/**
 * Commerce block for the admin dashboard: how much money the club takes across
 * both channels (member shop + register) and against court time, plus what's
 * selling and what's running out.
 */
export function CommerceDashboardSection() {
  const { data: summary } = useCommerceSummary();
  const { data: series } = useChannelSeries(14);

  const revenueMix = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Court time", value: summary.courtRevenue, color: "var(--accent-cyan)" },
      { name: "Retail", value: summary.retailRevenue, color: "var(--accent-pink)" },
      { name: "Services", value: summary.serviceRevenue, color: "var(--accent-emerald)" },
    ].filter((d) => d.value > 0);
  }, [summary]);

  const mixTotal = revenueMix.reduce((s, d) => s + d.value, 0);
  const onlineShare =
    summary && summary.totalCommerceRevenue > 0
      ? Math.round((summary.onlineRevenue / summary.totalCommerceRevenue) * 100)
      : 0;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Icon name="shopping-cart" className="size-5 text-brand" /> Commerce
          </h2>
          <p className="mt-0.5 text-sm text-ink-secondary">
            Member shop &amp; front-desk retail · last 30 days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/admin/pos/orders">
              <Icon name="receipt" className="size-4" /> Orders
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/pos">
              <Icon name="shopping-cart" className="size-4" /> Open register
            </Link>
          </Button>
        </div>
      </div>

      <CommerceKpis
        keys={[
          "onlineOrders",
          "posOrders",
          "commerceRevenue",
          "retailRevenue",
          "courtRevenue",
          "avgBasketSize",
        ]}
      />

      {/* channel trend + revenue mix */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Revenue by channel</CardTitle>
              <CardDescription>Online shop vs. point of sale, last 14 days</CardDescription>
            </div>
            {summary && (
              <Badge tone="info" dot>
                {onlineShare}% online
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {series ? (
              <>
                <AreaChart
                  data={series}
                  xKey="label"
                  height={280}
                  series={[
                    { key: "online", name: ORDER_CHANNELS.online.label, color: ORDER_CHANNELS.online.color },
                    { key: "pos", name: ORDER_CHANNELS.pos.label, color: ORDER_CHANNELS.pos.color },
                  ]}
                  valueFormatter={(v) => formatCurrency(v)}
                />
                {summary && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <ChannelTile
                      label="Online shop"
                      orders={summary.onlineOrders}
                      revenue={summary.onlineRevenue}
                      color={ORDER_CHANNELS.online.color}
                      icon={ORDER_CHANNELS.online.icon}
                    />
                    <ChannelTile
                      label="Point of sale"
                      orders={summary.posOrders}
                      revenue={summary.posRevenue}
                      color={ORDER_CHANNELS.pos.color}
                      icon={ORDER_CHANNELS.pos.icon}
                    />
                  </div>
                )}
              </>
            ) : (
              <Skeleton className="h-[280px] w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Where revenue comes from</CardTitle>
            <CardDescription>Court time vs. retail vs. services</CardDescription>
          </CardHeader>
          <CardContent>
            {summary ? (
              <>
                <DonutChart
                  data={revenueMix}
                  centerValue={formatCurrency(mixTotal)}
                  centerLabel="30 days"
                  valueFormatter={(v) => formatCurrency(v)}
                  height={220}
                />
                <div className="mt-4 space-y-2">
                  {revenueMix.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-ink-secondary">{d.name}</span>
                      <span className="tnum ml-auto font-medium text-foreground">
                        {formatCurrency(d.value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-(--border-subtle) pt-3 text-sm">
                    <span className="text-ink-secondary">Items per order</span>
                    <span className="tnum font-semibold text-foreground">
                      {summary.itemsPerOrder}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <Skeleton className="h-72 w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* best sellers + low stock */}
      <div className="grid gap-5 lg:grid-cols-2">
        <BestSellersCard limit={5} />
        <LowStockCard />
      </div>
    </section>
  );
}

function ChannelTile({
  label,
  orders,
  revenue,
  color,
  icon,
}: {
  label: string;
  orders: number;
  revenue: number;
  color: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--border-subtle) bg-surface p-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
      >
        <Icon name={icon} className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="tnum text-base font-bold tracking-tight text-foreground">
          {formatCurrency(revenue)}
        </p>
        <p className="truncate text-xs text-ink-secondary">
          {label} · {orders} order{orders === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
