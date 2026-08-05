"use client";

import type { PosLineItem } from "@/types";
import { TAX_LABEL } from "@/lib/constants/pos";
import { formatCurrency } from "@/lib/utils/format";
import { computeTotals } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";

/** Money block shared by the basket, checkout and confirmation screens. */
export function OrderSummary({
  items,
  className,
  extraRows,
}: {
  items: PosLineItem[];
  className?: string;
  /** Context rows rendered above the total (e.g. "Court · 1 hr"). */
  extraRows?: { label: string; value: string }[];
}) {
  const totals = computeTotals(items);

  return (
    <div className={cn("space-y-1.5 text-sm", className)}>
      {extraRows?.map((r) => (
        <Row key={r.label} label={r.label} value={r.value} muted />
      ))}
      <Row label={`Subtotal · ${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"}`} value={formatCurrency(totals.subtotal)} />
      {totals.discountTotal > 0 && (
        <Row label="Discount" value={`− ${formatCurrency(totals.discountTotal)}`} negative />
      )}
      <Row label={`${TAX_LABEL} (13%)`} value={formatCurrency(totals.tax)} />
      <div className="my-1 border-t border-(--border-subtle)" />
      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold text-foreground">Total</span>
        <span className="tnum text-xl font-bold tracking-tight text-foreground">
          {formatCurrency(totals.total)}
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  negative,
  muted,
}: {
  label: string;
  value: string;
  negative?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={cn("text-ink-secondary", muted && "text-ink-tertiary")}>{label}</span>
      <span className={cn("tnum font-medium text-foreground", negative && "text-danger")}>
        {value}
      </span>
    </div>
  );
}
