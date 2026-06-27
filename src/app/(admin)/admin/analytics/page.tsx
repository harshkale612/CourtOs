"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { CHART_COLORS } from "@/components/charts/chart-theme";
import { AdminHeader } from "@/features/admin/admin-header";
import { KpiCards } from "@/features/analytics/kpi-cards";
import { useRevenueSeries, useSportBreakdown, useUtilizationHeatmap } from "@/features/analytics/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { Heatmap } from "@/components/charts/heatmap";

function hourLabel(h: number) {
  const period = h >= 12 ? "p" : "a";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${period}`;
}

export default function AnalyticsPage() {
  const { data: revenue } = useRevenueSeries();
  const { data: sports } = useSportBreakdown();
  const { data: heatmap } = useUtilizationHeatmap();

  const sportBars = (sports ?? []).map((s) => ({ name: s.label, bookings: s.bookings, color: s.color }));
  const revenueDonut = (sports ?? []).map((s) => ({ name: s.label, value: s.revenue, color: s.color }));
  const totalRevenue = (sports ?? []).reduce((sum, s) => sum + s.revenue, 0);

  const peakHours = useMemo(() => {
    const byHour = new Map<number, number>();
    for (const c of heatmap ?? []) byHour.set(c.hour, (byHour.get(c.hour) ?? 0) + c.value);
    return [...byHour.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([h, v]) => ({ name: hourLabel(h), demand: Math.round(v * 100) }));
  }, [heatmap]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Analytics"
        subtitle="Understand demand, revenue, and utilization"
        actions={
          <>
            <Button variant="secondary" size="sm"><Icon name="calendar" className="size-4" /> Last 12 months</Button>
            <Button size="sm"><Icon name="arrow-right" className="size-4" /> Export report</Button>
          </>
        }
      />

      <KpiCards />

      <Card>
        <CardHeader>
          <CardTitle>Revenue & bookings trend</CardTitle>
          <CardDescription>Monthly performance over the last year</CardDescription>
        </CardHeader>
        <CardContent>
          {revenue ? (
            <AreaChart
              data={revenue}
              xKey="label"
              height={320}
              series={[
                { key: "revenue", name: "Revenue", color: CHART_COLORS.blue },
                { key: "bookings", name: "Bookings", color: CHART_COLORS.emerald },
              ]}
              valueFormatter={(v, name) => (name === "Revenue" ? formatCurrency(v) : v.toLocaleString())}
            />
          ) : (
            <Skeleton className="h-80 w-full" />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Bookings by sport</CardTitle></CardHeader>
          <CardContent>
            {sports ? <BarChart data={sportBars} xKey="name" barKey="bookings" colorKey="color" /> : <Skeleton className="h-72 w-full" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue by sport</CardTitle></CardHeader>
          <CardContent>
            {sports ? (
              <DonutChart data={revenueDonut} centerValue={formatCurrency(totalRevenue)} centerLabel="total" valueFormatter={(v) => formatCurrency(v)} />
            ) : (
              <Skeleton className="h-72 w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Court utilization heatmap</CardTitle>
          <CardDescription>Demand intensity by day &amp; hour</CardDescription>
        </CardHeader>
        <CardContent>{heatmap ? <Heatmap cells={heatmap} /> : <Skeleton className="h-48 w-full" />}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Peak demand by hour</CardTitle>
          <CardDescription>When your courts are busiest</CardDescription>
        </CardHeader>
        <CardContent>
          {heatmap ? <BarChart data={peakHours} xKey="name" barKey="demand" name="Demand" /> : <Skeleton className="h-72 w-full" />}
        </CardContent>
      </Card>
    </div>
  );
}
