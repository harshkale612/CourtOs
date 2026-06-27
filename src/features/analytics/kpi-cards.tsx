"use client";

import { formatCurrency, formatCompact } from "@/lib/utils/format";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useKpis } from "./hooks";

const ICONS: Record<string, string> = {
  revenue: "wallet",
  bookings: "calendar-check",
  members: "users",
  utilization: "activity",
};

function formatter(format: string) {
  if (format === "currency") return (n: number) => formatCurrency(n >= 100000 ? Math.round(n) : n);
  if (format === "percent") return (n: number) => `${Math.round(n)}%`;
  return (n: number) => (n >= 10000 ? formatCompact(n) : Math.round(n).toLocaleString());
}

export function KpiCards() {
  const { data: kpis, isLoading } = useKpis();

  if (isLoading || !kpis) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.key}
          label={kpi.label}
          value={kpi.value}
          icon={ICONS[kpi.key] ?? "activity"}
          accent={kpi.accent}
          delta={kpi.delta}
          format={formatter(kpi.format)}
        />
      ))}
    </div>
  );
}
