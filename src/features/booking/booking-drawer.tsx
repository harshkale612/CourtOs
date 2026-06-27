"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Court, SlotAvailability, Sport } from "@/types";
import { SPORTS } from "@/lib/constants/sports";
import { formatCurrency, formatLongDate, formatTimeRange } from "@/lib/utils/format";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { SportBadge } from "@/components/ui/sport-badge";
import { useCreateReservation } from "./hooks";

export function BookingDrawer({
  open,
  onOpenChange,
  court,
  slot,
  sport,
  dateISO,
  userId,
  userName,
  onConfirmed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  court: Court | null;
  slot: SlotAvailability | null;
  sport: Sport;
  dateISO: string;
  userId: string;
  userName: string;
  onConfirmed: () => void;
}) {
  const [guests, setGuests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const create = useCreateReservation(sport, dateISO, userId);
  const accent = SPORTS[sport].color;

  const reset = () => {
    setGuests([]);
    setNotes("");
    setSuccess(false);
  };

  const confirm = async () => {
    if (!court || !slot) return;
    try {
      await create.mutateAsync({
        courtId: court.id,
        userId,
        start: slot.start,
        end: slot.end,
        participants: [userName, ...guests],
        notes: notes || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        reset();
        onConfirmed();
      }, 1700);
    } catch {
      /* handled in hook */
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        {success ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              className="relative flex size-20 items-center justify-center rounded-full"
              style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}
            >
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${accent}` }}
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
              />
              <Icon name="check" className="size-9" strokeWidth={3} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h3 className="mt-6 text-2xl font-bold tracking-tight">You&apos;re on court! 🎾</h3>
              <p className="mt-2 text-ink-secondary">
                {court?.name} · {slot && formatTimeRange(slot.start, slot.end)}
              </p>
            </motion.div>
          </div>
        ) : (
        <>
        <SheetHeader>
          <SheetTitle>Confirm your booking</SheetTitle>
          <SheetDescription>Review the details and you&apos;re on court.</SheetDescription>
        </SheetHeader>

        {court && slot && (
          <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-4">
            {/* summary card */}
            <div
              className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-surface p-5"
              style={{ boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 25%, transparent)` }}
            >
              <div className="absolute -right-8 -top-8 size-24 rounded-full opacity-30 blur-2xl" style={{ background: accent }} />
              <SportBadge sport={sport} />
              <h3 className="mt-3 text-xl font-bold tracking-tight">{court.name}</h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                <Row icon="calendar" label="Date" value={formatLongDate(dateISO)} />
                <Row icon="clock" label="Time" value={formatTimeRange(slot.start, slot.end)} />
                <Row icon="map-pin" label="Surface" value={`${court.surface} · ${court.environment}`} />
              </dl>
            </div>

            {/* guests */}
            <div className="space-y-2">
              <Label htmlFor="guest">Add guests (optional)</Label>
              <Input
                id="guest"
                placeholder="Guest name, press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = (e.target as HTMLInputElement).value.trim();
                    if (v) setGuests((g) => [...g, v]);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-grad-brand-soft px-3 py-1 text-xs font-medium text-foreground">
                  {userName} (you)
                </span>
                {guests.map((g, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs text-foreground">
                    {g}
                    <button onClick={() => setGuests((arr) => arr.filter((_, idx) => idx !== i))} aria-label="Remove guest">
                      <Icon name="x" className="size-3 text-ink-tertiary hover:text-danger" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" placeholder="Anything the front desk should know?" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}

        {/* footer */}
        {court && slot && (
          <div className="border-t border-[var(--border-subtle)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-ink-secondary">Total</span>
              <span className="tnum text-2xl font-bold tracking-tight">{formatCurrency(slot.price)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={confirm} disabled={create.isPending}>
              {create.isPending ? "Confirming…" : "Confirm booking"}
            </Button>
          </div>
        )}
        </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon name={icon} className="size-4 text-ink-tertiary" />
      <span className="text-ink-tertiary">{label}</span>
      <span className="ml-auto font-medium capitalize text-foreground">{value}</span>
    </div>
  );
}
