"use client";

import type { Sport } from "@/types";
import { SPORT_LIST } from "@/lib/constants/sports";
import { cn } from "@/lib/utils/cn";

export function SportTabs({ value, onChange }: { value: Sport; onChange: (s: Sport) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {SPORT_LIST.map((sport) => {
        const active = value === sport.id;
        return (
          <button
            key={sport.id}
            onClick={() => onChange(sport.id)}
            aria-pressed={active}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200",
              active
                ? "border-transparent text-white"
                : "border-[var(--border-default)] bg-surface text-ink-secondary hover:border-[var(--border-strong)] hover:text-foreground",
            )}
            style={
              active
                ? { background: sport.color, boxShadow: `0 6px 24px -6px ${sport.color}` }
                : undefined
            }
          >
            <span>{sport.emoji}</span>
            {sport.label}
          </button>
        );
      })}
    </div>
  );
}
