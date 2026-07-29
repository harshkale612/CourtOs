"use client";

import { formatCompact, formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosKpis } from "./hooks";

function formatter(format: string) {
  if (format === "currency") return (n: number) => formatCurrency(n >= 100000 ? Math.round(n) : n);
  if (format === "percent") return (n: number) => `${Math.round(n)}%`;
  return (n: number) => (n >= 10000 ? formatCompact(n) : Math.round(n).toLocaleString());
}

/** POS KPI grid — pass `keys` to pick & order a subset (dashboard vs reports). */
export function PosKpis({ keys, className }: { keys?: string[]; className?: string }) {
  const { data, isLoading } = usePosKpis();
  const count = keys?.length ?? 4;

  const grid = cn(
    "grid gap-4 sm:grid-cols-2",
    count >= 4 ? "lg:grid-cols-4" : count === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2",
    className,
  );

  if (isLoading || !data) {
    return (
      <div className={grid}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const shown = keys
    ? keys.map((k) => data.find((d) => d.key === k)).filter((k): k is NonNullable<typeof k> => !!k)
    : data;

  return (
    <div className={grid}>
      {shown.map((kpi) => (
        <StatCard
          key={kpi.key}
          label={kpi.label}
          value={kpi.value}
          icon={kpi.icon}
          accent={kpi.accent}
          delta={kpi.delta}
          format={formatter(kpi.format)}
        />
      ))}
    </div>
  );
}
