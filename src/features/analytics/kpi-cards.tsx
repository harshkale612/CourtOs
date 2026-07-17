"use client";

import { formatCurrency, formatCompact } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useKpis } from "./hooks";

function formatter(format: string) {
  if (format === "currency") return (n: number) => formatCurrency(n >= 100000 ? Math.round(n) : n);
  if (format === "percent") return (n: number) => `${Math.round(n)}%`;
  return (n: number) => (n >= 10000 ? formatCompact(n) : Math.round(n).toLocaleString());
}

/**
 * KPI grid. Pass `keys` to select & order a subset of the KPIs the API returns
 * (dashboard and analytics surface different slices); omit to render them all.
 */
export function KpiCards({ keys, className }: { keys?: string[]; className?: string }) {
  const { data: kpis, isLoading } = useKpis();
  const count = keys?.length ?? 4;

  const grid = cn(
    "grid gap-4 sm:grid-cols-2",
    count >= 4 ? "lg:grid-cols-4" : count === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2",
    className,
  );

  if (isLoading || !kpis) {
    return (
      <div className={grid}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const shown = keys
    ? keys.map((k) => kpis.find((kpi) => kpi.key === k)).filter((k): k is NonNullable<typeof k> => !!k)
    : kpis;

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
