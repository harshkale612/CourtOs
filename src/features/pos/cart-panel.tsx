"use client";

import { useState } from "react";
import { computeTotals } from "@/lib/utils/pos";
import { formatCurrency } from "@/lib/utils/format";
import { TAX_LABEL } from "@/lib/constants/pos";
import { cn } from "@/lib/utils/cn";
import { usePosCartStore } from "@/stores/pos-cart-store";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { CartLine } from "./cart-line";
import { CustomerPicker } from "./customer-picker";
import { AddServiceDialog } from "./add-service-dialog";
import { CheckoutDialog } from "./checkout-dialog";

function SummaryRow({ label, value, strong, negative }: { label: string; value: string; strong?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={cn(strong ? "text-base font-semibold text-foreground" : "text-ink-secondary")}>{label}</span>
      <span className={cn("tnum", strong ? "text-lg font-bold text-foreground" : "font-medium text-foreground", negative && "text-danger")}>
        {value}
      </span>
    </div>
  );
}

/** The live register cart: customer, line items, add-service, summary & checkout. */
export function CartPanel({ className }: { className?: string }) {
  const items = usePosCartStore((s) => s.items);
  const clear = usePosCartStore((s) => s.clear);
  const note = usePosCartStore((s) => s.note);
  const setNote = usePosCartStore((s) => s.setNote);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const totals = computeTotals(items);
  const empty = items.length === 0;

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-raised shadow-sh-2", className)}>
      {/* header */}
      <div className="flex items-center justify-between gap-2 border-b border-(--border-subtle) p-4">
        <div className="flex items-center gap-2">
          <Icon name="shopping-cart" className="size-5 text-brand" />
          <h2 className="font-semibold tracking-tight">Current sale</h2>
          {!empty && (
            <span className="tnum rounded-full bg-fill-4 px-2 py-0.5 text-xs font-semibold">{totals.itemCount}</span>
          )}
        </div>
        {!empty && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <Icon name="trash-2" className="size-4" /> Clear
          </Button>
        )}
      </div>

      {/* customer + add service */}
      <div className="flex gap-2 border-b border-(--border-subtle) p-3">
        <CustomerPicker className="min-w-0 flex-1" />
        <Button variant="secondary" size="sm" className="shrink-0" onClick={() => setServiceOpen(true)}>
          <Icon name="plus" className="size-4" /> Service
        </Button>
      </div>

      {/* line items */}
      <div className="flex-1 overflow-y-auto p-3">
        {empty ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon="shopping-cart"
              title="Cart is empty"
              description="Tap products to start a sale, or add a club service."
              className="border-0"
            />
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <CartLine key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* footer */}
      {!empty && (
        <div className="space-y-3 border-t border-(--border-subtle) p-4">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Order note (optional)…"
            className="h-9 text-sm"
          />
          <div className="space-y-1.5 text-sm">
            <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
            {totals.discountTotal > 0 && (
              <SummaryRow label="Discount" value={`− ${formatCurrency(totals.discountTotal)}`} negative />
            )}
            <SummaryRow label={`${TAX_LABEL} (13%)`} value={formatCurrency(totals.tax)} />
            <div className="my-1 border-t border-(--border-subtle)" />
            <SummaryRow label="Total" value={formatCurrency(totals.total)} strong />
          </div>
          <Button size="lg" className="w-full" onClick={() => setCheckoutOpen(true)}>
            <Icon name="credit-card" className="size-4" /> Charge {formatCurrency(totals.total)}
          </Button>
        </div>
      )}

      <AddServiceDialog open={serviceOpen} onOpenChange={setServiceOpen} />
      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </div>
  );
}
