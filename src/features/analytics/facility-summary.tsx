"use client";

import { COURT_TYPE } from "@/lib/constants/courts";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Counter } from "@/components/motion/counter";
import { useFacilitySummary } from "./hooks";

/** Facility composition — physical courts by type + section occupancy at a glance. */
export function FacilitySummary({ className }: { className?: string }) {
  const { data, isLoading } = useFacilitySummary();

  if (isLoading || !data) {
    return <Skeleton className={cn("h-[172px] w-full rounded-2xl", className)} />;
  }

  const wholePct = data.physicalCourts ? (data.wholeCourts / data.physicalCourts) * 100 : 0;
  const availPct = data.totalSections ? (data.availableSections / data.totalSections) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="layers" className="size-5 text-brand" /> Facility composition
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        {/* courts */}
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold tracking-tight"><Counter value={data.physicalCourts} /></p>
              <p className="text-sm text-ink-secondary">Physical courts</p>
            </div>
          </div>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-fill-4">
            <div className="h-full" style={{ width: `${wholePct}%`, background: COURT_TYPE.whole.color }} />
            <div className="h-full flex-1" style={{ background: COURT_TYPE.shareable.color }} />
          </div>
          <div className="mt-3 space-y-1.5 text-sm">
            <Legend color={COURT_TYPE.whole.color} label="Whole courts" value={data.wholeCourts} />
            <Legend color={COURT_TYPE.shareable.color} label="Shareable courts" value={data.shareableCourts} />
          </div>
        </div>

        {/* sections */}
        <div className="sm:border-l sm:border-(--border-subtle) sm:pl-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold tracking-tight"><Counter value={data.totalSections} /></p>
              <p className="text-sm text-ink-secondary">Total sections</p>
            </div>
          </div>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-fill-4">
            <div className="h-full" style={{ width: `${availPct}%`, background: "var(--success)" }} />
            <div className="h-full flex-1" style={{ background: "var(--danger)" }} />
          </div>
          <div className="mt-3 space-y-1.5 text-sm">
            <Legend color="var(--success)" label="Available now" value={data.availableSections} />
            <Legend color="var(--danger)" label="Occupied now" value={data.occupiedSections} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2.5 rounded-full" style={{ background: color }} />
      <span className="text-ink-secondary">{label}</span>
      <span className="tnum ml-auto font-semibold text-foreground">{value}</span>
    </div>
  );
}
