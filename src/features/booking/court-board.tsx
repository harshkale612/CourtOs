"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Court, CourtSection, SlotAvailability, Sport } from "@/types";
import { SPORTS } from "@/lib/constants/sports";
import { COURT_TYPE, sectionColor } from "@/lib/constants/courts";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { priceRange } from "@/lib/utils/pricing";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailability, useCourts } from "./hooks";

export interface BoardSelection {
  court: Court;
  slot: SlotAvailability;
  section?: CourtSection;
}

function hourLabel(iso: string) {
  const h = new Date(iso).getHours();
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${period}`;
}

function selectionKey(courtId: string, sectionId: string | undefined, start: string) {
  return `${courtId}|${sectionId ?? "whole"}|${start}`;
}

const CHIP = "w-[82px]";

/* -------------------------------------------------------------------------- */

export function CourtBoard({
  sport,
  dateISO,
  selectedKey,
  onSelect,
}: {
  sport: Sport;
  dateISO: string;
  selectedKey: string | null;
  onSelect: (sel: BoardSelection) => void;
}) {
  const { data: courts } = useCourts(sport);
  const { data: slots, isLoading } = useAvailability(sport, dateISO);

  const { grouped, hours } = useMemo(() => {
    const list = slots ?? [];
    const hourSet = [...new Set(list.filter((s) => s.bookingType === "whole").map((s) => s.start))].sort();
    const map = new Map<string, { whole: SlotAvailability[]; sections: Map<string, SlotAvailability[]> }>();
    for (const s of list) {
      if (!map.has(s.courtId)) map.set(s.courtId, { whole: [], sections: new Map() });
      const entry = map.get(s.courtId)!;
      if (s.bookingType === "whole") entry.whole.push(s);
      else if (s.sectionId) {
        if (!entry.sections.has(s.sectionId)) entry.sections.set(s.sectionId, []);
        entry.sections.get(s.sectionId)!.push(s);
      }
    }
    for (const entry of map.values()) {
      entry.whole.sort((a, b) => a.start.localeCompare(b.start));
      for (const arr of entry.sections.values()) arr.sort((a, b) => a.start.localeCompare(b.start));
    }
    return { grouped: map, hours: hourSet };
  }, [slots]);

  if (isLoading || !slots || !courts) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  const wholeCourts = courts.filter((c) => c.type === "whole");
  const shareableCourts = courts.filter((c) => c.type === "shareable");

  if (courts.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-raised p-10 text-center text-ink-secondary">
        No courts for {SPORTS[sport].label} yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {wholeCourts.length > 0 && (
        <WholeCourtsPanel
          sport={sport}
          courts={wholeCourts}
          grouped={grouped}
          hours={hours}
          selectedKey={selectedKey}
          onSelect={onSelect}
        />
      )}

      {shareableCourts.length > 0 && (
        <div className="space-y-4">
          <GroupLabel type="shareable" count={shareableCourts.length} />
          {shareableCourts.map((court) => (
            <ShareableCourtCard
              key={court.id}
              court={court}
              lanes={grouped.get(court.id)}
              hours={hours}
              selectedKey={selectedKey}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function GroupLabel({ type, count }: { type: "whole" | "shareable"; count: number }) {
  const cfg = COURT_TYPE[type];
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex size-7 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in oklab, ${cfg.color} 16%, transparent)`, color: cfg.color }}
      >
        <Icon name={cfg.icon} className="size-4" />
      </span>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-secondary">
        {type === "whole" ? "Whole courts" : "Shareable courts"}
      </h2>
      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-ink-tertiary">
        {count}
      </span>
    </div>
  );
}

function HourAxis({ hours, labelWidth }: { hours: string[]; labelWidth: string }) {
  return (
    <div className="flex border-b border-[var(--border-subtle)]">
      <div className={cn("shrink-0", labelWidth)} />
      {hours.map((h) => (
        <div key={h} className={cn("shrink-0 py-2 text-center text-[11px] font-medium text-ink-tertiary", CHIP)}>
          {hourLabel(h)}
        </div>
      ))}
    </div>
  );
}

function SlotChip({
  slot,
  accent,
  isSelected,
  onSelect,
}: {
  slot: SlotAvailability;
  accent: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const blockedTitle =
    slot.blockedBy === "whole"
      ? "Blocked — the whole court is booked this hour"
      : slot.blockedBy === "section"
        ? "Blocked — a section is booked this hour"
        : "Booked";
  return (
    <div className={cn("shrink-0 p-1", CHIP)}>
      <button
        disabled={!slot.available && !isSelected}
        onClick={onSelect}
        title={!slot.available ? blockedTitle : undefined}
        className={cn(
          "group flex h-11 w-full flex-col items-center justify-center rounded-lg border text-[11px] font-semibold transition-all duration-150",
          slot.available && !isSelected &&
            "border-[var(--border-subtle)] bg-white/[0.02] text-ink-tertiary hover:text-white",
          !slot.available && !isSelected &&
            "cursor-not-allowed border-transparent bg-white/[0.015] text-ink-tertiary/40",
          isSelected && "border-transparent text-white",
        )}
        style={isSelected ? { background: accent, boxShadow: `0 6px 20px -6px ${accent}` } : undefined}
        onMouseEnter={(e) => {
          if (slot.available && !isSelected)
            e.currentTarget.style.background = `color-mix(in oklab, ${accent} 30%, transparent)`;
        }}
        onMouseLeave={(e) => {
          if (slot.available && !isSelected) e.currentTarget.style.background = "";
        }}
      >
        {isSelected ? (
          <Icon name="check" className="size-4" />
        ) : slot.available ? (
          <span>{formatCurrency(slot.price)}</span>
        ) : slot.blockedBy === "whole" || slot.blockedBy === "section" ? (
          <Icon name="x" className="size-3.5" />
        ) : (
          <span className="text-base leading-none">·</span>
        )}
      </button>
    </div>
  );
}

function LaneStrip({
  slots,
  court,
  section,
  accent,
  selectedKey,
  onSelect,
}: {
  slots: SlotAvailability[];
  court: Court;
  section?: CourtSection;
  accent: string;
  selectedKey: string | null;
  onSelect: (sel: BoardSelection) => void;
}) {
  return (
    <div className="flex">
      {slots.map((slot) => {
        const key = selectionKey(slot.courtId, slot.sectionId, slot.start);
        return (
          <SlotChip
            key={slot.start}
            slot={slot}
            accent={accent}
            isSelected={selectedKey === key}
            onSelect={() => onSelect({ court, slot, section })}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------ Whole courts ------------------------------ */

function WholeCourtsPanel({
  sport,
  courts,
  grouped,
  hours,
  selectedKey,
  onSelect,
}: {
  sport: Sport;
  courts: Court[];
  grouped: Map<string, { whole: SlotAvailability[]; sections: Map<string, SlotAvailability[]> }>;
  hours: string[];
  selectedKey: string | null;
  onSelect: (sel: BoardSelection) => void;
}) {
  const accent = SPORTS[sport].color;
  const LABEL = "w-[168px]";
  return (
    <div className="space-y-4">
      <GroupLabel type="whole" count={courts.length} />
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-raised">
        <div className="min-w-max">
          <HourAxis hours={hours} labelWidth={LABEL} />
          {courts.map((court) => {
            const lane = grouped.get(court.id)?.whole ?? [];
            return (
              <div key={court.id} className="flex border-b border-[var(--border-subtle)] last:border-0">
                <div className={cn("flex shrink-0 flex-col justify-center gap-0.5 border-r border-[var(--border-subtle)] px-4 py-2.5", LABEL)}>
                  <span className="truncate text-sm font-semibold text-foreground">{court.name}</span>
                  <span className="flex items-center gap-1.5 text-[11px] capitalize text-ink-tertiary">
                    <span className="size-1.5 rounded-full" style={{ background: accent }} />
                    {court.surface} · {court.environment}
                  </span>
                </div>
                <LaneStrip
                  slots={lane}
                  court={court}
                  accent={accent}
                  selectedKey={selectedKey}
                  onSelect={onSelect}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Shareable court card -------------------------- */

function ShareableCourtCard({
  court,
  lanes,
  hours,
  selectedKey,
  onSelect,
}: {
  court: Court;
  lanes: { whole: SlotAvailability[]; sections: Map<string, SlotAvailability[]> } | undefined;
  hours: string[];
  selectedKey: string | null;
  onSelect: (sel: BoardSelection) => void;
}) {
  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState<"whole" | "section">("section");
  const sportAccent = SPORTS[court.sport].color;
  const range = priceRange(court);
  const sections = court.sections ?? [];
  const LABEL = "w-[168px]";

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-raised">
      {/* header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span
          className="flex size-11 items-center justify-center rounded-xl text-xl"
          style={{ background: `color-mix(in oklab, ${sportAccent} 16%, transparent)` }}
        >
          {SPORTS[court.sport].emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold tracking-tight text-foreground">{court.name}</span>
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                color: COURT_TYPE.shareable.color,
                borderColor: `color-mix(in oklab, ${COURT_TYPE.shareable.color} 25%, transparent)`,
                background: `color-mix(in oklab, ${COURT_TYPE.shareable.color} 12%, transparent)`,
              }}
            >
              <Icon name="layout-grid" className="size-3" /> Shareable
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-tertiary">
            {sections.length} sections · entire court {formatCurrency(court.hourlyRate)}/hr · sections from{" "}
            {formatCurrency(range.from)}/hr
          </p>
        </div>
        <Icon name="chevron-down" className={cn("size-5 text-ink-tertiary transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--border-subtle)] px-5 py-4">
              {/* mode toggle — the two booking choices */}
              <div className="mb-4 inline-flex rounded-xl border border-[var(--border-subtle)] bg-surface p-1">
                <ModeTab active={mode === "whole"} onClick={() => setMode("whole")} icon="maximize" label="Entire court" />
                <ModeTab active={mode === "section"} onClick={() => setMode("section")} icon="grid-2x2" label="By section" />
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <HourAxis hours={hours} labelWidth={LABEL} />

                  {mode === "whole" ? (
                    <div className="flex">
                      <div className={cn("flex shrink-0 flex-col justify-center gap-0.5 border-r border-[var(--border-subtle)] px-4 py-2.5", LABEL)}>
                        <span className="text-sm font-semibold text-foreground">Entire court</span>
                        <span className="text-[11px] text-ink-tertiary">{formatCurrency(court.hourlyRate)}/hr · books all sections</span>
                      </div>
                      <LaneStrip
                        slots={lanes?.whole ?? []}
                        court={court}
                        accent={sportAccent}
                        selectedKey={selectedKey}
                        onSelect={onSelect}
                      />
                    </div>
                  ) : (
                    sections.map((section, i) => {
                      const accent = sectionColor(i);
                      return (
                        <div key={section.id} className="flex border-t border-[var(--border-subtle)] first:border-0">
                          <div className={cn("flex shrink-0 items-center gap-2.5 border-r border-[var(--border-subtle)] px-4 py-2.5", LABEL)}>
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}>
                              {section.shortLabel}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{section.name}</p>
                              <p className="text-[11px] text-ink-tertiary">{formatCurrency(section.hourlyPrice)}/hr</p>
                            </div>
                          </div>
                          <LaneStrip
                            slots={lanes?.sections.get(section.id) ?? []}
                            court={court}
                            section={section}
                            accent={accent}
                            selectedKey={selectedKey}
                            onSelect={onSelect}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModeTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
        active ? "bg-grad-brand text-white shadow-[var(--glow-brand)]" : "text-ink-secondary hover:text-foreground",
      )}
    >
      <Icon name={icon} className="size-4" />
      {label}
    </button>
  );
}
