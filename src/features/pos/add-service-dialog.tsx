"use client";

import { useState } from "react";
import type { PosLineItemKind } from "@/types";
import { db } from "@/lib/mock/data";
import { SPORTS } from "@/lib/constants/sports";
import { DEFAULT_TAX_RATE, LINE_ITEM_KINDS, SERVICE_KINDS } from "@/lib/constants/pos";
import { formatCurrency } from "@/lib/utils/format";
import { round2 } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePosCartStore } from "@/stores/pos-cart-store";

const DURATIONS = [
  { value: "1", label: "1 hour" },
  { value: "1.5", label: "1.5 hours" },
  { value: "2", label: "2 hours" },
];

/**
 * Adds a non-retail club service to the current sale — the seam that lets one
 * receipt mix a court booking, a membership, an event, coaching and a guest
 * pass with retail products.
 */
export function AddServiceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const addLine = usePosCartStore((s) => s.addLine);
  const [kind, setKind] = useState<PosLineItemKind>("booking");
  const [courtId, setCourtId] = useState(db.courts[0]?.id ?? "");
  const [hours, setHours] = useState("1");

  const close = () => onOpenChange(false);

  const addBooking = () => {
    const court = db.courts.find((c) => c.id === courtId);
    if (!court) return;
    const h = Number(hours);
    addLine({
      kind: "booking",
      refId: court.id,
      name: `${court.name} · ${hours} hr`,
      emoji: SPORTS[court.sport].emoji,
      unitPrice: round2(court.hourlyRate * h),
      quantity: 1,
      taxRate: DEFAULT_TAX_RATE,
      discount: 0,
    });
    close();
  };

  const bookingCourt = db.courts.find((c) => c.id === courtId);
  const bookingPrice = bookingCourt ? round2(bookingCourt.hourlyRate * Number(hours)) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to sale</DialogTitle>
          <DialogDescription>
            Sell a club service on the same receipt as retail — one unified transaction.
          </DialogDescription>
        </DialogHeader>

        {/* kind selector */}
        <div className="grid grid-cols-5 gap-1.5">
          {SERVICE_KINDS.map((k) => {
            const cfg = LINE_ITEM_KINDS[k];
            const active = kind === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-center text-[11px] font-medium transition-colors",
                  active
                    ? "border-transparent bg-grad-brand-soft text-foreground"
                    : "border-(--border-subtle) text-ink-secondary hover:border-(--border-strong)",
                )}
              >
                <Icon name={cfg.icon} className="size-4" style={{ color: cfg.color }} />
                <span className="leading-tight">{cfg.label.replace("Court ", "")}</span>
              </button>
            );
          })}
        </div>

        {/* body */}
        <div className="mt-1">
          {kind === "booking" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Court</label>
                  <Select value={courtId} onValueChange={setCourtId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {db.courts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {SPORTS[c.sport].emoji} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Duration</label>
                  <Select value={hours} onValueChange={setHours}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-(--border-subtle) bg-surface px-3.5 py-3">
                <span className="text-sm text-ink-secondary">Whole-court price</span>
                <span className="tnum text-lg font-bold text-foreground">{formatCurrency(bookingPrice)}</span>
              </div>
              <Button className="w-full" onClick={addBooking}>
                <Icon name="plus" className="size-4" /> Add booking to sale
              </Button>
            </div>
          )}

          {kind === "membership" && (
            <ServiceList
              rows={db.plans.map((p) => ({
                id: p.id,
                title: `${p.name} Membership`,
                subtitle: `${p.interval} · ${p.description}`,
                price: p.price,
                emoji: "🏅",
              }))}
              onPick={(row) => {
                addLine({ kind: "membership", refId: row.id, name: row.title, emoji: "🏅", unitPrice: row.price, quantity: 1, taxRate: DEFAULT_TAX_RATE, discount: 0 });
                close();
              }}
            />
          )}

          {kind === "event" && (
            <ServiceList
              rows={db.events
                .filter((e) => e.price > 0)
                .map((e) => ({ id: e.id, title: e.title, subtitle: SPORTS[e.sport].label, price: e.price, emoji: "🏆" }))}
              onPick={(row) => {
                addLine({ kind: "event", refId: row.id, name: row.title, emoji: "🏆", unitPrice: row.price, quantity: 1, taxRate: DEFAULT_TAX_RATE, discount: 0 });
                close();
              }}
            />
          )}

          {kind === "coaching" && (
            <ServiceList
              rows={db.products
                .filter((p) => p.category === "coaching")
                .map((p) => ({ id: p.id, title: p.name, subtitle: p.description ?? "Coaching", price: p.price, emoji: p.emoji ?? "🎓" }))}
              onPick={(row) => {
                addLine({ kind: "coaching", refId: row.id, name: row.title, category: "coaching", emoji: row.emoji, unitPrice: row.price, quantity: 1, taxRate: DEFAULT_TAX_RATE, discount: 0 });
                close();
              }}
            />
          )}

          {kind === "guest_pass" && (
            <ServiceList
              rows={db.products
                .filter((p) => p.category === "passes")
                .map((p) => ({ id: p.id, title: p.name, subtitle: p.description ?? "Guest pass", price: p.price, emoji: p.emoji ?? "🎟️" }))}
              onPick={(row) => {
                addLine({ kind: "guest_pass", refId: row.id, name: row.title, category: "passes", emoji: row.emoji, unitPrice: row.price, quantity: 1, taxRate: DEFAULT_TAX_RATE, discount: 0 });
                close();
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ServiceRow {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  emoji: string;
}

function ServiceList({ rows, onPick }: { rows: ServiceRow[]; onPick: (row: ServiceRow) => void }) {
  if (!rows.length) {
    return <p className="py-8 text-center text-sm text-ink-tertiary">Nothing available.</p>;
  }
  return (
    <ScrollArea className="-mx-1 max-h-72 px-1">
      <div className="space-y-1.5">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => onPick(row)}
            className="flex w-full items-center gap-3 rounded-xl border border-(--border-subtle) bg-surface px-3 py-2.5 text-left transition-colors hover:border-(--border-strong) hover:bg-fill-2"
          >
            <span className="text-2xl" aria-hidden>{row.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{row.title}</span>
              <span className="block truncate text-xs capitalize text-ink-tertiary">{row.subtitle}</span>
            </span>
            <span className="tnum text-sm font-bold text-foreground">{formatCurrency(row.price)}</span>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
