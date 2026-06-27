"use client";

import type { HeatCell } from "@/lib/api";
import { cn } from "@/lib/utils/cn";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function hourLabel(h: number) {
  const period = h >= 12 ? "p" : "a";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${period}`;
}

/**
 * Court-utilization heatmap (day × hour). Cell color interpolates from the
 * raised surface to the brand color by utilization. This is the analytics
 * differentiator vs CourtReserve's flat tables.
 */
export function Heatmap({ cells, className }: { cells: HeatCell[]; className?: string }) {
  const hours = Array.from(new Set(cells.map((c) => c.hour))).sort((a, b) => a - b);

  const value = (day: number, hour: number) =>
    cells.find((c) => c.day === day && c.hour === hour)?.value ?? 0;

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="min-w-[640px]">
        {/* hour axis */}
        <div className="mb-1.5 flex gap-1 pl-10">
          {hours.map((h) => (
            <div key={h} className="flex-1 text-center text-[10px] text-ink-tertiary">
              {h % 2 === 0 ? hourLabel(h) : ""}
            </div>
          ))}
        </div>
        {DAYS.map((day, di) => (
          <div key={day} className="mb-1 flex items-center gap-1">
            <div className="w-9 text-right text-[11px] font-medium text-ink-tertiary">{day}</div>
            {hours.map((h) => {
              const v = value(di, h);
              return (
                <div
                  key={h}
                  title={`${day} ${hourLabel(h)} · ${Math.round(v * 100)}% utilized`}
                  className="group relative h-6 flex-1 rounded-[5px] transition-transform duration-150 hover:scale-110 hover:ring-2 hover:ring-brand/50"
                  style={{
                    background:
                      v === 0
                        ? "rgba(255,255,255,0.03)"
                        : `color-mix(in oklab, var(--brand) ${Math.round(18 + v * 82)}%, var(--bg-raised))`,
                  }}
                />
              );
            })}
          </div>
        ))}
        {/* legend */}
        <div className="mt-3 flex items-center gap-2 pl-10 text-[11px] text-ink-tertiary">
          <span>Less</span>
          {[0.1, 0.35, 0.6, 0.85, 1].map((v) => (
            <span
              key={v}
              className="size-3 rounded-[3px]"
              style={{
                background: `color-mix(in oklab, var(--brand) ${Math.round(18 + v * 82)}%, var(--bg-raised))`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
