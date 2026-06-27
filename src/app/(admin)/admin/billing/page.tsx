"use client";

import { memberName } from "@/lib/mock/lookup";
import { PAYMENT_STATUS } from "@/lib/constants/statuses";
import { formatCurrency, formatLongDate } from "@/lib/utils/format";
import { CHART_COLORS } from "@/components/charts/chart-theme";
import { useAllTransactions } from "@/features/admin/hooks";
import { useRevenueSeries } from "@/features/analytics/hooks";
import { AdminHeader } from "@/features/admin/admin-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart } from "@/components/charts/area-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function BillingPage() {
  const { data: transactions, isLoading } = useAllTransactions();
  const { data: revenue } = useRevenueSeries();

  const txns = transactions ?? [];
  const paid = txns.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const refunded = txns.filter((t) => t.status === "refunded").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Billing"
        subtitle="Revenue, transactions, and payouts"
        actions={<Button size="sm"><Icon name="arrow-right" className="size-4" /> Export</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected" value={paid + 184200} icon="wallet" accent="var(--accent-emerald)" delta={12} format={(n) => formatCurrency(Math.round(n))} />
        <StatCard label="Pending payout" value={4820} icon="credit-card" accent="var(--accent-blue)" format={(n) => formatCurrency(Math.round(n))} />
        <StatCard label="Refunded" value={refunded} icon="receipt" accent="var(--accent-orange)" format={(n) => formatCurrency(Math.round(n))} />
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
        <CardContent>
          {revenue ? (
            <AreaChart data={revenue} xKey="label" height={260} series={[{ key: "revenue", name: "Revenue", color: CHART_COLORS.emerald }]} valueFormatter={(v) => formatCurrency(v)} />
          ) : (
            <Skeleton className="h-64 w-full" />
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Recent transactions</h2>
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns.slice(0, 14).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-foreground">{memberName(t.userId)}</TableCell>
                  <TableCell className="hidden capitalize sm:table-cell">{t.type}</TableCell>
                  <TableCell className="hidden md:table-cell">{t.method}</TableCell>
                  <TableCell>{formatLongDate(t.createdAt)}</TableCell>
                  <TableCell><Badge tone={PAYMENT_STATUS[t.status].tone}>{PAYMENT_STATUS[t.status].label}</Badge></TableCell>
                  <TableCell className="tnum text-right font-medium text-foreground">{formatCurrency(t.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
