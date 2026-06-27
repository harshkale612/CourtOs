"use client";

import { useMemo } from "react";
import type { Court, SlotAvailability, Sport } from "@/types";
import { SPORTS } from "@/lib/constants/sports";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailability, useCourts } from "./hooks";

function hourLabel(iso: string) {
  const h = new Date(iso).getHours();
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${period}`;
}

export interface SelectedSlot {
  courtId: string;
  start: string;
}

export function CourtGrid({
  sport,
  dateISO,
  selected,
  onSelect,
}: {
  sport: Sport;
  dateISO: string;
  selected: SelectedSlot | null;
  onSelect: (slot: SlotAvailability, court: Court) => void;
}) {
  const { data: courts } = useCourts(sport);
  const { data: slots, isLoading } = useAvailability(sport, dateISO);
  const accent = SPORTS[sport].color;

  const { courtRows, hours } = useMemo(() => {
    const list = slots ?? [];
    const hourSet = [...new Set(list.map((s) => s.start))].sort();
    const byCourt = new Map<string, SlotAvailability[]>();
    for (const s of list) {
      if (!byCourt.has(s.courtId)) byCourt.set(s.courtId, []);
      byCourt.get(s.courtId)!.push(s);
    }
    const rows = [...byCourt.keys()].map((courtId) => ({
      courtId,
      court: courts?.find((c) => c.id === courtId),
      slots: byCourt.get(courtId)!.sort((a, b) => a.start.localeCompare(b.start)),
    }));
    return { courtRows: rows, hours: hourSet };
  }, [slots, courts]);

  if (isLoading || !slots) {
    return (
      <div className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-raised p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-raised">
      <div className="min-w-max">
        {/* header */}
        <div className="flex border-b border-[var(--border-subtle)]">
          <div className="sticky left-0 z-20 w-[152px] shrink-0 bg-raised px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
            Court
          </div>
          {hours.map((h) => (
            <div
              key={h}
              className="w-[76px] shrink-0 py-3 text-center text-xs font-medium text-ink-tertiary"
            >
              {hourLabel(h)}
            </div>
          ))}
        </div>

        {/* rows */}
        {courtRows.map(({ courtId, court, slots: courtSlots }) => (
          <div key={courtId} className="flex border-b border-[var(--border-subtle)] last:border-0">
            <div className="sticky left-0 z-20 flex w-[152px] shrink-0 flex-col justify-center gap-0.5 border-r border-[var(--border-subtle)] bg-raised px-4 py-2.5">
              <span className="truncate text-sm font-semibold text-foreground">{court?.name}</span>
              <span className="flex items-center gap-1.5 text-[11px] capitalize text-ink-tertiary">
                <span className="size-1.5 rounded-full" style={{ background: accent }} />
                {court?.surface} · {court?.environment}
              </span>
            </div>
            {courtSlots.map((slot) => {
              const isSelected = selected?.courtId === slot.courtId && selected?.start === slot.start;
              return (
                <div key={slot.start} className="w-[76px] shrink-0 p-1">
                  <button
                    disabled={!slot.available && !isSelected}
                    onClick={() => court && onSelect(slot, court)}
                    className={cn(
                      "group flex h-12 w-full flex-col items-center justify-center rounded-lg border text-[11px] font-medium transition-all duration-150",
                      slot.available && !isSelected &&
                        "border-[var(--border-subtle)] bg-white/[0.02] text-ink-tertiary hover:border-transparent hover:text-white",
                      !slot.available && !isSelected &&
                        "cursor-not-allowed border-transparent bg-white/[0.015] text-ink-tertiary/40",
                      isSelected && "border-transparent text-white",
                    )}
                    style={
                      isSelected
                        ? { background: accent, boxShadow: `0 6px 20px -6px ${accent}` }
                        : undefined
                    }
                    onMouseEnter={(e) => {
                      if (slot.available && !isSelected)
                        e.currentTarget.style.background = `color-mix(in oklab, ${accent} 28%, transparent)`;
                    }}
                    onMouseLeave={(e) => {
                      if (slot.available && !isSelected) e.currentTarget.style.background = "";
                    }}
                  >
                    {isSelected ? (
                      <Icon name="check" className="size-4" />
                    ) : slot.available ? (
                      <span>{formatCurrency(slot.price)}</span>
                    ) : (
                      <span className="text-base leading-none">·</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
