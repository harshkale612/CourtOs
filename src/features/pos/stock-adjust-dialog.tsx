"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product, StockAdjustmentReason } from "@/types";
import { cn } from "@/lib/utils/cn";
import { useSessionUser } from "@/features/auth/use-session-user";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductThumb } from "./product-thumb";
import { useAdjustStock } from "./hooks";

const ADD_REASONS: { id: StockAdjustmentReason; label: string }[] = [
  { id: "restock", label: "Restock" },
  { id: "return", label: "Customer return" },
  { id: "correction", label: "Correction" },
];
const REMOVE_REASONS: { id: StockAdjustmentReason; label: string }[] = [
  { id: "damage", label: "Damage / loss" },
  { id: "correction", label: "Correction" },
];

export function StockAdjustDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product?: Product;
}) {
  const user = useSessionUser();
  const adjust = useAdjustStock();
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [qty, setQty] = useState("12");
  const [reason, setReason] = useState<StockAdjustmentReason>("restock");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setMode("add");
      setQty("12");
      setReason("restock");
      setNote("");
    }
  }, [open, product]);

  const reasons = mode === "add" ? ADD_REASONS : REMOVE_REASONS;
  const qtyNum = Math.max(0, Number(qty) || 0);
  const delta = mode === "add" ? qtyNum : -qtyNum;
  const newStock = (product?.stock ?? 0) + delta;
  const invalid = qtyNum <= 0 || newStock < 0;

  const quick = useMemo(() => (mode === "add" ? [6, 12, 24, 48] : [1, 2, 5]), [mode]);

  function submit() {
    if (!product || invalid) return;
    adjust.mutate(
      { productId: product.id, delta, reason, note: note.trim() || undefined, by: user.name },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>Record a stock movement — it&apos;s logged to the audit trail.</DialogDescription>
        </DialogHeader>

        {product && (
          <div className="flex items-center gap-3 rounded-xl border border-(--border-subtle) bg-surface p-3">
            <ProductThumb category={product.category} emoji={product.emoji} name={product.name} className="size-12 rounded-lg" emojiClassName="text-2xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
              <p className="text-xs text-ink-tertiary">SKU {product.sku}</p>
            </div>
            <div className="text-right">
              <p className="tnum text-lg font-bold text-foreground">{product.stock}</p>
              <p className="text-xs text-ink-tertiary">on hand</p>
            </div>
          </div>
        )}

        {/* add / remove */}
        <div className="grid grid-cols-2 gap-1.5">
          {(["add", "remove"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setReason(m === "add" ? "restock" : "damage");
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold capitalize transition-colors",
                mode === m
                  ? "border-transparent bg-grad-brand-soft text-foreground"
                  : "border-(--border-subtle) text-ink-secondary hover:border-(--border-strong)",
              )}
            >
              <Icon name={m === "add" ? "plus" : "minus"} className="size-4" /> {m} stock
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="adj-qty">Quantity</Label>
          <div className="flex flex-wrap gap-2">
            {quick.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQty(String(q))}
                className="rounded-lg border border-(--border-default) bg-surface px-3 py-1.5 text-sm font-medium transition-colors hover:border-(--border-strong)"
              >
                {mode === "add" ? "+" : "−"}{q}
              </button>
            ))}
          </div>
          <Input id="adj-qty" type="number" min={0} value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Reason</Label>
          <Select value={reason} onValueChange={(v) => setReason(v as StockAdjustmentReason)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {reasons.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="adj-note">Note</Label>
          <Input id="adj-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-fill-2 px-3.5 py-2.5 text-sm">
          <span className="text-ink-secondary">New on-hand</span>
          <span className={cn("tnum text-lg font-bold", newStock < 0 ? "text-danger" : "text-foreground")}>
            {newStock}
          </span>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={invalid || adjust.isPending} onClick={submit}>
            <Icon name="check" className="size-4" /> Apply adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
