"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { CHART_COLORS } from "@/components/charts/chart-theme";
import { AdminHeader } from "@/features/admin/admin-header";
import { KpiCards } from "@/features/analytics/kpi-cards";
import {
  useBookingTypeBreakdown,
  useCourtUtilization,
  useRevenueByCourt,
  useRevenueBySection,
  useRevenueSeries,
  useSectionUtilization,
  useSportBreakdown,
  useUtilizationHeatmap,
} from "@/features/analytics/hooks";
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
  const { data: byType } = useBookingTypeBreakdown();
  const { data: byCourt } = useRevenueByCourt();
  const { data: bySection } = useRevenueBySection();
  const { data: sectionUtil } = useSectionUtilization();
  const { data: courtUtil } = useCourtUtilization();
  const { data: sports } = useSportBreakdown();
  const { data: heatmap } = useUtilizationHeatmap();

  const revenueByType = (byType ?? []).map((t) => ({ name: t.label, value: t.revenue, color: t.color }));
  const totalTypeRevenue = (byType ?? []).reduce((s, t) => s + t.revenue, 0);
  const bookingsByType = (byType ?? []).map((t) => ({ name: t.label, bookings: t.bookings, color: t.color }));

  const courtBars = (byCourt ?? []).map((c) => ({ name: c.name, revenue: c.revenue, color: c.color }));
  const sectionBars = (bySection ?? []).map((s) => ({ name: s.label, revenue: s.revenue, color: s.color }));
  const sectionUtilBars = (sectionUtil ?? []).map((s) => ({ name: s.label, utilization: s.utilization, color: s.color }));
  const courtUtilBars = (courtUtil ?? []).map((c) => ({ name: c.label, utilization: c.utilization, color: c.color }));
  const revenueDonut = (sports ?? []).map((s) => ({ name: s.label, value: s.revenue, color: s.color }));
  const totalSportRevenue = (sports ?? []).reduce((s, x) => s + x.revenue, 0);

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
        subtitle="Revenue, utilization & demand — by court, section, and booking type"
        actions={
          <>
            <Button variant="secondary" size="sm"><Icon name="calendar" className="size-4" /> Last 12 months</Button>
            <Button size="sm"><Icon name="arrow-right" className="size-4" /> Export report</Button>
          </>
        }
      />

      <KpiCards keys={["revenuePeriod", "bookings", "courtUtil", "sectionUtil"]} />

      <Card>
        <CardHeader>
          <CardTitle>Revenue &amp; bookings trend</CardTitle>
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

      {/* whole vs section — revenue + bookings */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Whole-court vs. section revenue</CardTitle>
            <CardDescription>Where revenue comes from</CardDescription>
          </CardHeader>
          <CardContent>
            {byType ? (
              <>
                <DonutChart data={revenueByType} centerValue={formatCurrency(totalTypeRevenue)} centerLabel="total" valueFormatter={(v) => formatCurrency(v)} />
                <div className="mt-4 space-y-2">
                  {byType.map((t) => (
                    <div key={t.key} className="flex items-center gap-2 text-sm">
                      <span className="size-2.5 rounded-full" style={{ background: t.color }} />
                      <span className="text-ink-secondary">{t.label} revenue</span>
                      <span className="tnum ml-auto font-medium text-foreground">{formatCurrency(t.revenue)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Skeleton className="h-72 w-full" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Bookings by type</CardTitle><CardDescription>Entire court vs. individual sections</CardDescription></CardHeader>
          <CardContent>
            {byType ? <BarChart data={bookingsByType} xKey="name" barKey="bookings" name="Bookings" colorKey="color" /> : <Skeleton className="h-72 w-full" />}
          </CardContent>
        </Card>
      </div>

      {/* revenue by court + by section */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Revenue by court</CardTitle><CardDescription>All physical courts</CardDescription></CardHeader>
          <CardContent>
            {byCourt ? <BarChart data={courtBars} xKey="name" barKey="revenue" name="Revenue" colorKey="color" valueFormatter={(v) => formatCurrency(v)} /> : <Skeleton className="h-72 w-full" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue by section</CardTitle><CardDescription>Across shareable courts</CardDescription></CardHeader>
          <CardContent>
            {bySection ? <BarChart data={sectionBars} xKey="name" barKey="revenue" name="Revenue" colorKey="color" valueFormatter={(v) => formatCurrency(v)} /> : <Skeleton className="h-72 w-full" />}
          </CardContent>
        </Card>
      </div>

      {/* occupancy: court + section */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Court occupancy</CardTitle><CardDescription>Relative utilization by court</CardDescription></CardHeader>
          <CardContent>
            {courtUtil ? <BarChart data={courtUtilBars} xKey="name" barKey="utilization" name="Utilization" colorKey="color" valueFormatter={(v) => `${v}%`} /> : <Skeleton className="h-72 w-full" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Section occupancy</CardTitle><CardDescription>Relative utilization by section</CardDescription></CardHeader>
          <CardContent>
            {sectionUtil ? <BarChart data={sectionUtilBars} xKey="name" barKey="utilization" name="Utilization" colorKey="color" valueFormatter={(v) => `${v}%`} /> : <Skeleton className="h-72 w-full" />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Occupancy heatmap</CardTitle>
          <CardDescription>Demand intensity by day &amp; hour</CardDescription>
        </CardHeader>
        <CardContent>{heatmap ? <Heatmap cells={heatmap} /> : <Skeleton className="h-48 w-full" />}</CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Peak demand by hour</CardTitle>
            <CardDescription>When your courts are busiest</CardDescription>
          </CardHeader>
          <CardContent>
            {heatmap ? <BarChart data={peakHours} xKey="name" barKey="demand" name="Demand" valueFormatter={(v) => `${v}%`} /> : <Skeleton className="h-72 w-full" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue by sport</CardTitle><CardDescription>This period</CardDescription></CardHeader>
          <CardContent>
            {sports ? (
              <DonutChart data={revenueDonut} centerValue={formatCurrency(totalSportRevenue)} centerLabel="total" valueFormatter={(v) => formatCurrency(v)} />
            ) : (
              <Skeleton className="h-72 w-full" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
