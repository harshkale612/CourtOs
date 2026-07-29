"use client";

import { useEffect, useMemo, useState } from "react";
import type { PaymentMethodKind, PosOrder, PosPayment } from "@/types";
import { PAYMENT_METHOD_LIST, POS_PAYMENT_METHODS } from "@/lib/constants/pos";
import { formatCurrency } from "@/lib/utils/format";
import { computeTotals, round2 } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";
import { useSessionUser } from "@/features/auth/use-session-user";
import { usePosCartStore } from "@/stores/pos-cart-store";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateOrder, useCreditBalance } from "./hooks";
import { Receipt } from "./receipt";

const CARD_REFS = ["Visa •4242", "Mastercard •5318", "Amex •0005", "Interac Debit"];
type Tab = PaymentMethodKind | "split";

interface SplitRow {
  method: PaymentMethodKind;
  amount: string;
}

function printReceipt() {
  document.body.classList.add("printing-receipt");
  const cleanup = () => {
    document.body.classList.remove("printing-receipt");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
}

export function CheckoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const items = usePosCartStore((s) => s.items);
  const customerId = usePosCartStore((s) => s.customerId);
  const customerName = usePosCartStore((s) => s.customerName);
  const orderNote = usePosCartStore((s) => s.note);
  const clear = usePosCartStore((s) => s.clear);
  const user = useSessionUser();
  const { data: credit = 0 } = useCreditBalance(customerId);
  const createOrder = useCreateOrder();

  const totals = useMemo(() => computeTotals(items), [items]);
  const total = totals.total;

  const [tab, setTab] = useState<Tab>("card");
  const [tendered, setTendered] = useState("");
  const [cardRef, setCardRef] = useState(CARD_REFS[0]);
  const [split, setSplit] = useState<SplitRow[]>([
    { method: "card", amount: "" },
    { method: "cash", amount: "" },
  ]);
  const [done, setDone] = useState<PosOrder | null>(null);

  useEffect(() => {
    if (open) {
      setDone(null);
      setTendered("");
      setTab("card");
      setSplit([
        { method: "card", amount: "" },
        { method: "cash", amount: "" },
      ]);
    }
  }, [open]);

  const cashSuggestions = useMemo(() => {
    const out = new Set<number>([round2(total)]);
    for (const d of [5, 10, 20, 50, 100]) {
      const up = Math.ceil(total / d) * d;
      if (up >= total) out.add(up);
      if (out.size >= 4) break;
    }
    return [...out].sort((a, b) => a - b).slice(0, 4);
  }, [total]);

  const tenderedNum = Number(tendered) || 0;
  const changeDue = Math.max(0, round2(tenderedNum - total));

  const splitCovered = round2(split.reduce((s, r) => s + (Number(r.amount) || 0), 0));
  const splitRemaining = round2(total - splitCovered);

  function buildPayments(): PosPayment[] | null {
    if (!items.length) return null;
    if (tab === "cash") {
      if (tenderedNum + 0.001 < total) return null;
      return [{ method: "cash", amount: total, reference: "Cash", tendered: tenderedNum }];
    }
    if (tab === "card") return [{ method: "card", amount: total, reference: cardRef }];
    if (tab === "club_credit") {
      if (!customerId || credit + 0.001 < total) return null;
      return [{ method: "club_credit", amount: total, reference: "Club credit" }];
    }
    // split
    const rows = split
      .map((r) => ({ method: r.method, amount: round2(Number(r.amount) || 0) }))
      .filter((r) => r.amount > 0);
    if (!rows.length || Math.abs(round2(rows.reduce((s, r) => s + r.amount, 0)) - total) > 0.01) return null;
    const creditSum = round2(rows.filter((r) => r.method === "club_credit").reduce((s, r) => s + r.amount, 0));
    if (creditSum > 0 && (!customerId || creditSum > credit + 0.01)) return null;
    return rows.map((r) => ({
      method: r.method,
      amount: r.amount,
      reference: r.method === "cash" ? "Cash" : r.method === "card" ? cardRef : "Club credit",
      tendered: r.method === "cash" ? r.amount : undefined,
    }));
  }

  const payments = buildPayments();
  const canComplete = payments !== null && !createOrder.isPending;

  function complete() {
    if (!payments) return;
    createOrder.mutate(
      {
        lineItems: items,
        payments,
        cashierId: user.id,
        cashierName: user.name,
        customerId,
        customerName,
        note: orderNote || undefined,
      },
      { onSuccess: (order) => { setDone(order); clear(); } },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {done ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="check-circle" className="size-5 text-success" /> Payment complete
              </DialogTitle>
              <DialogDescription>{done.number} · {formatCurrency(done.total)} collected.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <Receipt order={done} />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={printReceipt}>
                <Icon name="printer" className="size-4" /> Print receipt
              </Button>
              <Button className="flex-1" onClick={() => onOpenChange(false)}>
                <Icon name="plus" className="size-4" /> New sale
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Checkout</DialogTitle>
              <DialogDescription>
                {customerName ? `Member · ${customerName}` : "Walk-in customer"}
              </DialogDescription>
            </DialogHeader>

            {/* amount due */}
            <div className="rounded-2xl border border-(--border-subtle) bg-surface p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-ink-tertiary">Amount due</p>
              <p className="tnum mt-1 text-4xl font-bold tracking-tight">{formatCurrency(total)}</p>
              <p className="mt-1 text-xs text-ink-tertiary">
                {totals.itemCount} item{totals.itemCount === 1 ? "" : "s"} · incl. {formatCurrency(totals.tax)} HST
              </p>
            </div>

            {/* method tabs */}
            <div className="grid grid-cols-4 gap-1.5">
              {(["cash", "card", "club_credit", "split"] as Tab[]).map((t) => {
                const label = t === "split" ? "Split" : POS_PAYMENT_METHODS[t].label;
                const icon = t === "split" ? "layers" : POS_PAYMENT_METHODS[t].icon;
                const active = tab === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[11px] font-semibold transition-colors",
                      active
                        ? "border-transparent bg-grad-brand-soft text-foreground"
                        : "border-(--border-subtle) text-ink-secondary hover:border-(--border-strong)",
                    )}
                  >
                    <Icon name={icon} className="size-4" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* method body */}
            <div className="min-h-[92px]">
              {tab === "cash" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {cashSuggestions.map((amt, i) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTendered(String(amt))}
                        className="rounded-lg border border-(--border-default) bg-surface px-3 py-1.5 text-sm font-medium transition-colors hover:border-(--border-strong)"
                      >
                        {i === 0 ? "Exact" : formatCurrency(amt)}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-tertiary">CA$</span>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={tendered}
                      onChange={(e) => setTendered(e.target.value)}
                      placeholder="Cash tendered"
                      className="pl-11 text-base"
                    />
                  </div>
                  {tenderedNum > 0 && (
                    <div className="flex items-center justify-between rounded-lg bg-fill-2 px-3 py-2 text-sm">
                      <span className="text-ink-secondary">Change due</span>
                      <span className={cn("tnum font-bold", tenderedNum < total ? "text-danger" : "text-success")}>
                        {tenderedNum < total ? `Short ${formatCurrency(total - tenderedNum)}` : formatCurrency(changeDue)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {tab === "card" && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-ink-secondary">Card / terminal</label>
                  <Select value={cardRef} onValueChange={setCardRef}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CARD_REFS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-ink-tertiary">Tap, insert, or swipe on the terminal to collect {formatCurrency(total)}.</p>
                </div>
              )}

              {tab === "club_credit" && (
                <div className="space-y-2">
                  {!customerId ? (
                    <div className="flex items-center gap-2 rounded-lg border border-orange/30 bg-orange/10 px-3 py-2.5 text-sm text-orange">
                      <Icon name="triangle-alert" className="size-4 shrink-0" />
                      Attach a member to pay with club credit.
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg bg-fill-2 px-3 py-2.5 text-sm">
                      <span className="text-ink-secondary">{customerName}&apos;s balance</span>
                      <span className="tnum font-semibold text-foreground">{formatCurrency(credit)}</span>
                    </div>
                  )}
                  {customerId && credit < total && (
                    <p className="text-xs text-danger">
                      Not enough credit — short {formatCurrency(total - credit)}. Use Split to combine tenders.
                    </p>
                  )}
                </div>
              )}

              {tab === "split" && (
                <div className="space-y-2">
                  {split.map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Select
                        value={row.method}
                        onValueChange={(v) =>
                          setSplit((s) => s.map((r, j) => (j === i ? { ...r, method: v as PaymentMethodKind } : r)))
                        }
                      >
                        <SelectTrigger className="h-10 w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHOD_LIST.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-tertiary">CA$</span>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={row.amount}
                          onChange={(e) => setSplit((s) => s.map((r, j) => (j === i ? { ...r, amount: e.target.value } : r)))}
                          placeholder="0.00"
                          className="h-10 pl-10"
                        />
                      </div>
                      {split.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setSplit((s) => s.filter((_, j) => j !== i))}
                          aria-label="Remove payment"
                          className="rounded-lg border border-(--border-default) p-2 text-ink-tertiary hover:border-(--border-strong) hover:text-danger"
                        >
                          <Icon name="x" className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setSplit((s) => [...s, { method: "cash", amount: "" }])}
                      className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                    >
                      <Icon name="plus" className="size-3.5" /> Add tender
                    </button>
                    <span className={cn("tnum font-semibold", Math.abs(splitRemaining) < 0.01 ? "text-success" : "text-ink-secondary")}>
                      {Math.abs(splitRemaining) < 0.01 ? "Fully covered" : splitRemaining > 0 ? `${formatCurrency(splitRemaining)} left` : `${formatCurrency(-splitRemaining)} over`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button size="lg" className="w-full" disabled={!canComplete} onClick={complete}>
              {createOrder.isPending ? (
                <><Spinner size="sm" /> Processing…</>
              ) : (
                <><Icon name="check" className="size-4" /> Charge {formatCurrency(total)}</>
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
