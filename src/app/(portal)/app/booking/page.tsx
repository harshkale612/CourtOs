"use client";

import { useState } from "react";
import { SPORTS } from "@/lib/constants/sports";
import { useBookingStore } from "@/stores/booking-store";
import { useSessionUser } from "@/features/auth/use-session-user";
import { SportTabs } from "@/features/booking/sport-tabs";
import { DateStrip } from "@/features/booking/date-strip";
import { CourtBoard, type BoardSelection } from "@/features/booking/court-board";
import { BookingDrawer } from "@/features/booking/booking-drawer";

export default function BookingPage() {
  const user = useSessionUser();
  const { sport, dateISO, setSport, setDate } = useBookingStore();
  const [active, setActive] = useState<BoardSelection | null>(null);
  const [open, setOpen] = useState(false);

  const onSelect = (sel: BoardSelection) => {
    setActive(sel);
    setOpen(true);
  };

  const selectedKey = active
    ? `${active.slot.courtId}|${active.slot.sectionId ?? "whole"}|${active.slot.start}`
    : null;

  return (
    <div className="space-y-6" style={{ ["--sport-accent" as string]: SPORTS[sport].color }}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Book a court</h1>
        <p className="mt-1 text-ink-secondary">
          Whole courts book as one. Shareable courts let you take the entire court — or just a section.
        </p>
      </div>

      <div className="space-y-4">
        <SportTabs value={sport} onChange={setSport} />
        <DateStrip value={dateISO} onChange={setDate} />
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-tertiary">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded border border-(--border-default) bg-fill-1" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded" style={{ background: SPORTS[sport].color }} /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-fill-1" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex size-3 items-center justify-center rounded bg-fill-1 text-[8px] text-ink-tertiary/60">✕</span>
          Blocked by another lane
        </span>
      </div>

      <CourtBoard sport={sport} dateISO={dateISO} selectedKey={selectedKey} onSelect={onSelect} />

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
