"use client";

import Link from "next/link";
import { ANCHOR_DATE } from "@/lib/mock/prng";
import { courtName, memberName } from "@/lib/mock/lookup";
import { SPORTS } from "@/lib/constants/sports";
import { BOOKING_STATUS } from "@/lib/constants/statuses";
import { formatCurrency, formatTime } from "@/lib/utils/format";
import { CHART_COLORS } from "@/components/charts/chart-theme";
import { AdminHeader } from "@/features/admin/admin-header";
import { KpiCards } from "@/features/analytics/kpi-cards";
import { useRevenueSeries, useSportBreakdown, useUtilizationHeatmap } from "@/features/analytics/hooks";
import { useReservationsByDate } from "@/features/admin/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart } from "@/components/charts/area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { Heatmap } from "@/components/charts/heatmap";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminDashboardPage() {
  const { data: revenue } = useRevenueSeries();
  const { data: sports } = useSportBreakdown();
  const { data: heatmap } = useUtilizationHeatmap();
  const { data: today } = useReservationsByDate(ANCHOR_DATE.toISOString());

  const donutData = (sports ?? []).map((s) => ({ name: s.label, value: s.bookings, color: s.color }));
  const totalBookings = (sports ?? []).reduce((sum, s) => sum + s.bookings, 0);
  const recent = (today ?? [])
    .filter((r) => r.status !== "cancelled")
    .sort((a, b) => +new Date(b.start) - +new Date(a.start))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Dashboard"
        subtitle="Riverside Racquet Club · today at a glance"
        actions={
          <>
            <Button variant="secondary" size="sm"><Icon name="calendar" className="size-4" /> This month</Button>
            <Button size="sm"><Icon name="arrow-right" className="size-4" /> Export</Button>
          </>
        }
      />

      <KpiCards />

      {/* charts row */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue & bookings</CardTitle>
              <CardDescription>Last 12 months</CardDescription>
            </div>
            <Badge tone="success" dot>+12.4%</Badge>
          </CardHeader>
          <CardContent>
            {revenue ? (
              <AreaChart
                data={revenue}
                xKey="label"
                height={300}
                series={[{ key: "revenue", name: "Revenue", color: CHART_COLORS.blue }]}
                valueFormatter={(v) => formatCurrency(v)}
              />
            ) : (
              <Skeleton className="h-[300px] w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings by sport</CardTitle>
            <CardDescription>This period</CardDescription>
          </CardHeader>
          <CardContent>
            {sports ? (
              <>
                <DonutChart data={donutData} centerValue={totalBookings.toLocaleString()} centerLabel="bookings" height={220} />
                <div className="mt-4 space-y-2">
                  {sports.map((s) => (
                    <div key={s.sport} className="flex items-center gap-2 text-sm">
                      <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-ink-secondary">{s.label}</span>
                      <span className="tnum ml-auto font-medium text-foreground">{s.bookings}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Skeleton className="h-[300px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Court utilization</CardTitle>
          <CardDescription>Demand by day &amp; hour — spot your peaks and dead zones</CardDescription>
        </CardHeader>
        <CardContent>{heatmap ? <Heatmap cells={heatmap} /> : <Skeleton className="h-48 w-full" />}</CardContent>
      </Card>

      {/* today's bookings */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Today&apos;s reservations</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/reservations">View all <Icon name="arrow-right" className="size-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Court</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">{memberName(r.userId)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span>{SPORTS[r.sport].emoji}</span> {courtName(r.courtId)}
                    </span>
                  </TableCell>
                  <TableCell className="tnum">{formatTime(r.start)}</TableCell>
                  <TableCell><Badge tone={BOOKING_STATUS[r.status].tone}>{BOOKING_STATUS[r.status].label}</Badge></TableCell>
                  <TableCell className="tnum text-right font-medium text-foreground">{formatCurrency(r.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
