"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Court, PosLineItem, SlotAvailability, Sport } from "@/types";
import { SPORTS } from "@/lib/constants/sports";
import { BOOKING_SCOPE } from "@/lib/constants/courts";
import { DEFAULT_TAX_RATE, TAX_LABEL } from "@/lib/constants/pos";
import { PICKUP_METHODS } from "@/lib/constants/commerce";
import { formatCurrency, formatLongDate, formatTimeRange } from "@/lib/utils/format";
import { computeTotals } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { SportBadge } from "@/components/ui/sport-badge";
import { PaymentSelect, type PaymentChoice } from "@/features/payments/payment-select";
import { usePlaceShopOrder, useShopProducts } from "@/features/shop/hooks";
import { useCreateReservation } from "./hooks";
import { BookingAddons, type AddonSelection } from "./booking-addons";

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
  const [addons, setAddons] = useState<AddonSelection>({});
  const [payment, setPayment] = useState<PaymentChoice | null>(null);
  const [success, setSuccess] = useState<{ addonCount: number } | null>(null);
  const create = useCreateReservation(sport, dateISO, userId);
  const placeOrder = usePlaceShopOrder(userId);
  const { data: products } = useShopProducts();
  const accent = SPORTS[sport].color;

  const section = slot?.sectionId ? court?.sections?.find((s) => s.id === slot.sectionId) : undefined;
  const scope = slot ? BOOKING_SCOPE[slot.bookingType] : null;
  const bookingLabel = slot?.bookingType === "section" && section ? section.name : "Entire court";

  /** The court itself, as a line on the combined order. */
  const courtLine: PosLineItem | null = useMemo(() => {
    if (!court || !slot) return null;
    return {
      id: "court",
      kind: "booking",
      refId: slot.sectionId ?? court.id,
      name: `${court.name}${section ? ` · ${section.name}` : ""} · ${formatTimeRange(slot.start, slot.end)}`,
      emoji: SPORTS[sport].emoji,
      unitPrice: slot.price,
      quantity: 1,
      taxRate: DEFAULT_TAX_RATE,
      discount: 0,
    };
  }, [court, slot, section, sport]);

  /** Pro-shop items picked in this drawer. */
  const addonLines: PosLineItem[] = useMemo(() => {
    const rows: PosLineItem[] = [];
    for (const [productId, quantity] of Object.entries(addons)) {
      const p = (products ?? []).find((x) => x.id === productId);
      if (!p || quantity <= 0) continue;
      rows.push({
        id: `addon_${p.id}`,
        kind: "product",
        refId: p.id,
        name: p.name,
        category: p.category,
        sku: p.sku,
        emoji: p.emoji,
        imageUrl: p.imageUrl,
        unitPrice: p.price,
        quantity,
        taxRate: p.taxRate,
        discount: 0,
      });
    }
    return rows;
  }, [addons, products]);

  const hasAddons = addonLines.length > 0;
  const orderLines = useMemo(
    () => (courtLine ? [courtLine, ...addonLines] : addonLines),
    [courtLine, addonLines],
  );
  const totals = computeTotals(orderLines);
  const addonUnits = addonLines.reduce((s, l) => s + l.quantity, 0);
  const busy = create.isPending || placeOrder.isPending;

  const reset = () => {
    setGuests([]);
    setNotes("");
    setAddons({});
    setPayment(null);
    setSuccess(null);
  };

  const confirm = async () => {
    if (!court || !slot) return;
    try {
      const reservation = await create.mutateAsync({
        courtId: court.id,
        sectionId: slot.sectionId,
        userId,
        start: slot.start,
        end: slot.end,
        participants: [userName, ...guests],
        notes: notes || undefined,
      });

      // One basket, one payment: the court plus everything added to it.
      if (hasAddons && payment) {
        await placeOrder.mutateAsync({
          userId,
          userName,
          lineItems: orderLines,
          payment,
          pickup: {
            method: "after_booking",
            reservationId: reservation.id,
            readyAt: reservation.end,
          },
          reservationId: reservation.id,
          note: notes || undefined,
        });
      }

      setSuccess({ addonCount: addonUnits });
      setTimeout(() => {
        reset();
        onConfirmed();
      }, 2200);
    } catch {
      /* handled in hooks */
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
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
                {court?.name}
                {section ? ` · ${section.name}` : ""} · {slot && formatTimeRange(slot.start, slot.end)}
              </p>
              {success.addonCount > 0 && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-fill-3 px-3.5 py-1.5 text-sm text-foreground">
                  <Icon name="shopping-bag" className="size-4 text-brand" />
                  {success.addonCount} item{success.addonCount === 1 ? "" : "s"} waiting courtside
                </p>
              )}
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
                  className="relative overflow-hidden rounded-2xl border border-(--border-subtle) bg-surface p-5"
                  style={{ boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 25%, transparent)` }}
                >
                  <div className="absolute -right-8 -top-8 size-24 rounded-full opacity-30 blur-2xl" style={{ background: accent }} />
                  <div className="flex flex-wrap items-center gap-2">
                    <SportBadge sport={sport} />
                    {scope && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          color: scope.color,
                          borderColor: `color-mix(in oklab, ${scope.color} 30%, transparent)`,
                          background: `color-mix(in oklab, ${scope.color} 12%, transparent)`,
                        }}
                      >
                        <Icon name={scope.icon} className="size-3" /> {scope.label}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl font-bold tracking-tight">
                    {court.name}
                    {section && <span className="text-ink-secondary"> · {section.name}</span>}
                  </h3>
                  <dl className="mt-4 space-y-2.5 text-sm">
                    <Row icon="calendar" label="Date" value={formatLongDate(dateISO)} />
                    <Row icon="clock" label="Time" value={formatTimeRange(slot.start, slot.end)} />
                    <Row
                      icon={slot.bookingType === "section" ? "grid-2x2" : "maximize"}
                      label="Booking"
                      value={bookingLabel}
                    />
                    <Row icon="map-pin" label="Surface" value={`${court.surface} · ${court.environment}`} />
                  </dl>
                </div>

                {/* pro-shop add-ons */}
                <div className="border-t border-(--border-subtle) pt-5">
                  <BookingAddons selection={addons} onChange={setAddons} accent={accent} />
                </div>

                {/* payment — only when there's a basket to charge */}
                {hasAddons && (
                  <div className="space-y-2 border-t border-(--border-subtle) pt-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                      <Icon name="credit-card" className="size-4" style={{ color: accent }} />
                      Pay for court + items together
                    </h3>
                    <PaymentSelect
                      userId={userId}
                      amount={totals.total}
                      value={payment}
                      onChange={setPayment}
                    />
                    <p className="flex items-center gap-1.5 text-xs text-ink-tertiary">
                      <Icon name={PICKUP_METHODS.after_booking.icon} className="size-3.5" />
                      {PICKUP_METHODS.after_booking.blurb}
                    </p>
                  </div>
                )}

                {/* guests */}
                <div className="space-y-2 border-t border-(--border-subtle) pt-5">
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
                      <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-fill-4 px-3 py-1 text-xs text-foreground">
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
              <div className="border-t border-(--border-subtle) p-6">
                {hasAddons ? (
                  <div className="mb-4 space-y-1.5 text-sm">
                    <SummaryRow label={`Court · ${bookingLabel}`} value={formatCurrency(slot.price)} />
                    <SummaryRow
                      label={`Pro shop · ${addonUnits} item${addonUnits === 1 ? "" : "s"}`}
                      value={formatCurrency(addonLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0))}
                    />
                    <SummaryRow label={`${TAX_LABEL} (13%)`} value={formatCurrency(totals.tax)} />
                    <div className="my-1 border-t border-(--border-subtle)" />
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold text-foreground">One payment</span>
                      <span className="tnum text-2xl font-bold tracking-tight">
                        {formatCurrency(totals.total)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-ink-secondary">Total · {bookingLabel}</span>
                    <span className="tnum text-2xl font-bold tracking-tight">
                      {formatCurrency(slot.price)}
                      <span className="text-sm font-normal text-ink-tertiary">/hr</span>
                    </span>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  onClick={confirm}
                  disabled={busy || (hasAddons && !payment)}
                >
                  {busy ? (
                    <>
                      <Spinner size="sm" /> {placeOrder.isPending ? "Taking payment…" : "Confirming…"}
                    </>
                  ) : hasAddons ? (
                    <>
                      <Icon name="credit-card" className="size-4" /> Book &amp; pay{" "}
                      {formatCurrency(totals.total)}
                    </>
                  ) : (
                    "Confirm booking"
                  )}
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

function SummaryRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3", className)}>
      <span className="text-ink-secondary">{label}</span>
      <span className="tnum font-medium text-foreground">{value}</span>
    </div>
  );
}
