"use client";

import { formatCompact, formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommerceKpis } from "./hooks";

function formatter(format: string) {
  if (format === "currency") return (n: number) => formatCurrency(n >= 100000 ? Math.round(n) : n);
  if (format === "percent") return (n: number) => `${Math.round(n)}%`;
  return (n: number) => (n >= 10000 ? formatCompact(n) : Math.round(n).toLocaleString());
}

/**
 * Cross-channel KPI grid — online orders, POS orders, commerce revenue, retail
 * revenue, court revenue, average basket. Pass `keys` to pick & order a subset.
 */
export function CommerceKpis({ keys, className }: { keys?: string[]; className?: string }) {
  const { data, isLoading } = useCommerceKpis();
  const count = keys?.length ?? 6;

  const grid = cn(
    "grid gap-4 sm:grid-cols-2",
    count % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4",
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
