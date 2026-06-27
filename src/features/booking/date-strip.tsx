"use client";

import { format, isSameDay } from "date-fns";
import { ANCHOR_DATE, addDays } from "@/lib/mock/prng";
import { cn } from "@/lib/utils/cn";

const DAYS = Array.from({ length: 14 }, (_, i) => addDays(ANCHOR_DATE, i));

export function DateStrip({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const selected = new Date(value);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {DAYS.map((day) => {
        const active = isSameDay(day, selected);
        const today = isSameDay(day, ANCHOR_DATE);
        return (
          <button
            key={day.toISOString()}
            onClick={() => onChange(day.toISOString())}
            aria-pressed={active}
            className={cn(
              "flex w-16 shrink-0 flex-col items-center gap-0.5 rounded-xl border py-2.5 transition-all duration-200",
              active
                ? "border-transparent bg-grad-brand text-white shadow-[var(--glow-brand)]"
                : "border-[var(--border-subtle)] bg-surface text-ink-secondary hover:border-[var(--border-strong)] hover:text-foreground",
            )}
          >
            <span className="text-[11px] font-medium uppercase tracking-wide opacity-80">
              {today ? "Today" : format(day, "EEE")}
            </span>
            <span className="tnum text-lg font-bold leading-none">{format(day, "d")}</span>
            <span className="text-[10px] opacity-70">{format(day, "MMM")}</span>
          </button>
        );
      })}
    </div>
  );
}
