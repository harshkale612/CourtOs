"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { Sport } from "@/types";
import { ANCHOR_DATE, addDays } from "@/lib/mock/prng";
import { courtName, memberName } from "@/lib/mock/lookup";
import { SPORTS, SPORT_LIST } from "@/lib/constants/sports";
import { BOOKING_STATUS } from "@/lib/constants/statuses";
import { formatCurrency, formatTimeRange } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useReservationsByDate } from "@/features/admin/hooks";
import { AdminHeader } from "@/features/admin/admin-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminReservationsPage() {
  const [dayOffset, setDayOffset] = useState(0);
  const [sportFilter, setSportFilter] = useState<Sport | "all">("all");
  const date = addDays(ANCHOR_DATE, dayOffset);
  const { data: reservations, isLoading } = useReservationsByDate(date.toISOString());

  const filtered = useMemo(() => {
    return (reservations ?? [])
      .filter((r) => sportFilter === "all" || r.sport === sportFilter)
      .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  }, [reservations, sportFilter]);

  const revenue = filtered.filter((r) => r.status !== "cancelled").reduce((s, r) => s + r.price, 0);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Reservations"
        subtitle="Every booking across the club"
        actions={<Button size="sm"><Icon name="plus" className="size-4" /> New reservation</Button>}
      />

      {/* date nav + summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={() => setDayOffset((d) => d - 1)} aria-label="Previous day">
            <Icon name="chevron-left" className="size-4" />
          </Button>
          <div className="min-w-44 text-center">
            <p className="font-semibold">{dayOffset === 0 ? "Today" : format(date, "EEE, MMM d")}</p>
            <p className="text-xs text-ink-tertiary">{format(date, "MMMM yyyy")}</p>
          </div>
          <Button variant="secondary" size="icon" onClick={() => setDayOffset((d) => d + 1)} aria-label="Next day">
            <Icon name="chevron-right" className="size-4" />
          </Button>
          {dayOffset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setDayOffset(0)}>Today</Button>
          )}
        </div>
        <div className="flex gap-6">
          <div><p className="text-xs text-ink-tertiary">Bookings</p><p className="tnum text-lg font-bold">{filtered.length}</p></div>
          <div><p className="text-xs text-ink-tertiary">Revenue</p><p className="tnum text-lg font-bold">{formatCurrency(revenue)}</p></div>
        </div>
      </div>

      {/* sport filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ id: "all" as const, label: "All sports" }, ...SPORT_LIST.map((s) => ({ id: s.id, label: `${s.emoji} ${s.label}` }))].map((c) => (
          <button
            key={c.id}
            onClick={() => setSportFilter(c.id)}
            className={cn(
              "shrink-0 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all",
              sportFilter === c.id ? "border-transparent bg-grad-brand text-white" : "border-[var(--border-default)] bg-surface text-ink-secondary hover:border-[var(--border-strong)]",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6"><EmptyState icon="calendar-range" title="No reservations" description="Nothing booked for this day and filter." /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Court</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="hidden md:table-cell">Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-foreground">{memberName(r.userId)}</TableCell>
                    <TableCell><span className="inline-flex items-center gap-1.5">{SPORTS[r.sport].emoji} {courtName(r.courtId)}</span></TableCell>
                    <TableCell className="tnum">{formatTimeRange(r.start, r.end)}</TableCell>
                    <TableCell className="hidden capitalize md:table-cell">{r.createdVia}</TableCell>
                    <TableCell><Badge tone={BOOKING_STATUS[r.status].tone}>{BOOKING_STATUS[r.status].label}</Badge></TableCell>
                    <TableCell className="tnum text-right font-medium text-foreground">{formatCurrency(r.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
