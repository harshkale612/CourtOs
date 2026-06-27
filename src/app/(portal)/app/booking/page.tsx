"use client";

import { useState } from "react";
import type { Court, SlotAvailability } from "@/types";
import { SPORTS } from "@/lib/constants/sports";
import { useBookingStore } from "@/stores/booking-store";
import { useSessionUser } from "@/features/auth/use-session-user";
import { SportTabs } from "@/features/booking/sport-tabs";
import { DateStrip } from "@/features/booking/date-strip";
import { CourtGrid } from "@/features/booking/court-grid";
import { BookingDrawer } from "@/features/booking/booking-drawer";

export default function BookingPage() {
  const user = useSessionUser();
  const { sport, dateISO, setSport, setDate } = useBookingStore();
  const [active, setActive] = useState<{ court: Court; slot: SlotAvailability } | null>(null);
  const [open, setOpen] = useState(false);

  const onSelect = (slot: SlotAvailability, court: Court) => {
    setActive({ court, slot });
    setOpen(true);
  };

  return (
    <div className="space-y-6" style={{ ["--sport-accent" as string]: SPORTS[sport].color }}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Book a court</h1>
        <p className="mt-1 text-ink-secondary">
          Pick a sport and time — your court is one tap away.
        </p>
      </div>

      <div className="space-y-4">
        <SportTabs value={sport} onChange={setSport} />
        <DateStrip value={dateISO} onChange={setDate} />
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-ink-tertiary">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded border border-[var(--border-default)] bg-white/[0.02]" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded" style={{ background: SPORTS[sport].color }} /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-white/[0.015]" /> Booked
        </span>
      </div>

      <CourtGrid
        sport={sport}
        dateISO={dateISO}
        selected={active ? { courtId: active.court.id, start: active.slot.start } : null}
        onSelect={onSelect}
      />

      <BookingDrawer
        open={open}
        onOpenChange={setOpen}
        court={active?.court ?? null}
        slot={active?.slot ?? null}
        sport={sport}
        dateISO={dateISO}
        userId={user.id}
        userName={user.name}
        onConfirmed={() => {
          setOpen(false);
          setActive(null);
        }}
      />
    </div>
  );
}
