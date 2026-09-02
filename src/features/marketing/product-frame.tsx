"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";
import { useIdleProgress } from "./use-idle-progress";
import { EASE_OUT_FN as EASE_FN } from "./hero/ease";
import {
  PREVIEW_BOOKINGS,
  PREVIEW_COURTS,
  PREVIEW_HOURS,
  PREVIEW_KPIS,
} from "./preview-data";

const SIDEBAR = [
  { label: "Dashboard", icon: "layout-dashboard", active: true },
  { label: "Bookings", icon: "calendar-days" },
  { label: "Members", icon: "users" },
  { label: "Memberships", icon: "badge-check" },
  { label: "Events", icon: "trophy" },
  { label: "Payments", icon: "credit-card" },
  { label: "POS", icon: "monitor-smartphone" },
];

const ROWS = PREVIEW_HOURS.length;

/**
 * The CourtOS dashboard as a composed product snapshot — a carefully chosen
 * slice, not every panel in the app. The schedule inside is the same court
 * grid the hero visualisation resolves into (see preview-data).
 *
 * `p` is optional scene progress: when supplied, the shell staggers itself in
 * as the frame is revealed. Without it the frame simply renders settled.
 */
export function ProductFrame({
  p,
  className,
}: {
  p?: MotionValue<number> | null;
  className?: string;
}) {
  const driven = !!p;
  // Settled (1) when nothing is driving the scene, so the frame renders as
  // the finished dashboard rather than mid-reveal.
  const drive = useIdleProgress(p ?? null, 1);
  const sidebarX = useTransform(drive, [0.68, 0.82], [-40, 0], { ease: EASE_FN });
  const sidebarOpacity = useTransform(drive, [0.68, 0.82], [0, 1], { ease: EASE_FN });

  return (
    <div className={cn("relative w-full", className)}>
      {/* Halo — the frame reads as lit, not pasted on */}
      <div className="absolute inset-6 -z-10 rounded-[2rem] bg-grad-brand opacity-20 blur-[80px]" />

      <div className="glow-border relative overflow-hidden rounded-[18px] bg-raised/90 shadow-sh-4 backdrop-blur-xl sm:rounded-[22px]">
        {/* Browser chrome */}
        <div className="flex h-11 items-center justify-between border-b border-(--border-subtle) bg-fill-1 px-4 sm:h-12 sm:px-5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="size-2.5 rounded-full bg-danger/70 sm:size-3" />
            <span className="size-2.5 rounded-full bg-warning/70 sm:size-3" />
            <span className="size-2.5 rounded-full bg-success/70 sm:size-3" />
          </div>
          <div className="flex h-6 w-40 items-center justify-center rounded-md border border-(--border-default) bg-fill-2 text-[10px] font-medium text-ink-tertiary sm:w-60 sm:text-[11px]">
            <Icon name="lock" className="mr-1.5 size-3" />
            app.courtos.com
          </div>
          <span className="w-10" />
        </div>

        <div className="flex h-[420px] sm:h-[500px] lg:h-[580px]">
          {/* Sidebar */}
          <motion.aside
            style={driven ? { x: sidebarX, opacity: sidebarOpacity } : undefined}
            className="hidden w-56 shrink-0 flex-col border-r border-(--border-subtle) bg-fill-1/60 p-3.5 lg:flex"
          >
            <div className="mb-7 flex items-center gap-2 px-1 text-sm font-bold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-grad-brand text-white shadow-glow-brand">
                C
              </span>
              CourtOS
            </div>
            <nav className="flex flex-col gap-0.5 text-[13px] font-medium">
              {SIDEBAR.map((item) => (
                <span
                  key={item.label}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2",
                    item.active ? "bg-fill-4 text-foreground" : "text-ink-secondary",
                  )}
                >
                  <Icon
                    name={item.icon}
                    className={cn("size-4", item.active ? "text-brand" : "text-ink-tertiary")}
                  />
                  {item.label}
                </span>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-2.5 rounded-xl border border-(--border-subtle) bg-surface p-2.5">
              <span className="size-7 rounded-full bg-grad-brand-soft" />
              <span className="flex flex-col leading-tight">
                <span className="text-[11px] font-semibold">Riverside Racquet</span>
                <span className="text-[10px] text-ink-tertiary">Club manager</span>
              </span>
            </div>
          </motion.aside>

          {/* Main */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 bg-canvas/40 p-4 sm:gap-5 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold sm:text-lg">Overview</p>
                <p className="truncate text-[11px] text-ink-tertiary sm:text-xs">
                  Today&apos;s activity across every court
                </p>
              </div>
              <span className="hidden h-8 shrink-0 items-center rounded-lg border border-(--border-default) bg-surface px-3 text-xs font-medium sm:flex">
                <Icon name="calendar" className="mr-1.5 size-3.5 text-ink-secondary" />
                Today
              </span>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
              {PREVIEW_KPIS.map((kpi, i) => (
                <KpiTile key={kpi.label} kpi={kpi} index={i} p={p} />
              ))}
            </div>

            {/* Court schedule — the grid the court became */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-(--border-subtle) bg-surface">
              <div className="flex items-center justify-between border-b border-(--border-subtle) px-3 py-2.5 sm:px-4">
                <p className="text-xs font-semibold sm:text-sm">Court schedule</p>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-success sm:text-[11px]">
                  <span className="size-1.5 rounded-full bg-success" />
                  Live
                </span>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-[38px_1fr] gap-2 p-2.5 sm:grid-cols-[46px_1fr] sm:gap-3 sm:p-3">
                {/* Hour axis */}
                <div className="flex flex-col justify-between pb-4 text-[9px] font-semibold text-ink-tertiary sm:text-[10px]">
                  {PREVIEW_HOURS.map((h) => (
                    <span key={h}>{h}</span>
                  ))}
                </div>

                <div className="flex min-w-0 flex-col">
                  <div className="mb-1.5 grid grid-cols-4 gap-1.5 sm:gap-2">
                    {PREVIEW_COURTS.map((court) => (
                      <div key={court.name} className="min-w-0 truncate">
                        <p className="truncate text-[9px] font-bold uppercase tracking-wider sm:text-[10px]">
                          {court.name}
                        </p>
                        <p
                          className="truncate text-[9px] font-semibold sm:text-[10px]"
                          style={{ color: court.sport.color }}
                        >
                          {court.sport.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="relative grid min-h-0 flex-1 grid-cols-4 gap-1.5 sm:gap-2">
                    {/* Hour rules */}
                    {Array.from({ length: ROWS }, (_, i) => (
                      <span
                        key={i}
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 border-t border-dashed border-(--border-subtle)"
                        style={{ top: `${(i / ROWS) * 100}%` }}
                      />
                    ))}

                    {PREVIEW_COURTS.map((court, col) => (
                      <div key={court.name} className="relative min-w-0">
                        {PREVIEW_BOOKINGS.filter((b) => b.col === col).map((b) => (
                          <div
                            key={`${b.col}-${b.from}`}
                            className="absolute inset-x-0 overflow-hidden rounded-md border px-1.5 py-1"
                            style={{
                              top: `${(b.from / ROWS) * 100}%`,
                              height: `calc(${((b.to - b.from) / ROWS) * 100}% - 3px)`,
                              backgroundColor: `color-mix(in oklab, ${b.color} 14%, transparent)`,
                              borderColor: `color-mix(in oklab, ${b.color} 45%, transparent)`,
                            }}
                          >
                            <p
                              className="truncate text-[9px] font-semibold sm:text-[10px]"
                              style={{ color: b.color }}
                            >
                              {b.title}
                            </p>
                            <p className="truncate text-[9px] text-ink-tertiary">{b.sub}</p>
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Now-line — the net, still exactly where it was */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-1/2 border-t-2 border-danger"
                    >
                      <span className="absolute -left-1 -top-[7px] size-2 rounded-full bg-danger" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiTile({
  kpi,
  index,
  p,
}: {
  kpi: (typeof PREVIEW_KPIS)[number];
  index: number;
  p?: MotionValue<number> | null;
}) {
  const drive = useIdleProgress(p ?? null, 1);
  const start = 0.7 + index * 0.03;
  const opacity = useTransform(drive, [start, start + 0.08], [0, 1], { ease: EASE_FN });
  const y = useTransform(drive, [start, start + 0.08], [12, 0], { ease: EASE_FN });

  return (
    <motion.div
      style={p ? { opacity, y } : undefined}
      className="rounded-xl border border-(--border-subtle) bg-surface p-2.5 sm:p-3"
    >
      <p className="truncate text-[10px] font-medium text-ink-tertiary sm:text-[11px]">
        {kpi.label}
      </p>
      <p className="tnum mt-0.5 truncate text-lg font-bold tracking-tight sm:text-xl">
        {kpi.value}
      </p>
      <p
        className={cn(
          "mt-1 flex items-center text-[10px] font-medium",
          kpi.trend === "up" ? "text-success" : "text-danger",
        )}
      >
        <Icon
          name={kpi.trend === "up" ? "trending-up" : "trending-down"}
          className="mr-1 size-3"
        />
        {kpi.change}
      </p>
    </motion.div>
  );
}
