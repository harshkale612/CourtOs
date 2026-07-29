"use client";

import { useState } from "react";
import type { PosLineItem } from "@/types";
import { LINE_ITEM_KINDS } from "@/lib/constants/pos";
import { formatCurrency } from "@/lib/utils/format";
import { lineNet } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { usePosCartStore } from "@/stores/pos-cart-store";
import { ProductThumb } from "./product-thumb";

function StepBtn({ icon, onClick, label }: { icon: string; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-lg border border-(--border-default) bg-raised text-foreground transition-colors hover:border-(--border-strong) hover:bg-fill-4 active:scale-95"
    >
      <Icon name={icon} className="size-4" />
    </button>
  );
}

export function CartLine({ item }: { item: PosLineItem }) {
  const { incQty, decQty, setDiscount, setLineNote, removeItem } = usePosCartStore();
  const [showDiscount, setShowDiscount] = useState(item.discount > 0);
  const [showNote, setShowNote] = useState(!!item.note);
  const net = lineNet(item);
  const kindCfg = LINE_ITEM_KINDS[item.kind];
  const isService = item.kind !== "product";

  return (
    <div className="rounded-xl border border-(--border-subtle) bg-surface p-2.5">
      <div className="flex gap-2.5">
        <ProductThumb
          category={item.category ?? "merch"}
          emoji={item.emoji}
          imageUrl={item.imageUrl}
          name={item.name}
          className="size-11 shrink-0 rounded-lg"
          emojiClassName="text-xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-medium leading-tight text-foreground">{item.name}</p>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              aria-label="Remove item"
              className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-ink-tertiary transition-colors hover:bg-fill-4 hover:text-danger"
            >
              <Icon name="x" className="size-4" />
            </button>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-tertiary">
            {isService ? (
              <span className="inline-flex items-center gap-1" style={{ color: kindCfg.color }}>
                <Icon name={kindCfg.icon} className="size-3" /> {kindCfg.label}
              </span>
            ) : (
              <span className="tnum">{formatCurrency(item.unitPrice)} ea</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StepBtn icon="minus" onClick={() => decQty(item.id)} label="Decrease quantity" />
          <span className="tnum w-6 text-center text-sm font-semibold">{item.quantity}</span>
          <StepBtn icon="plus" onClick={() => incQty(item.id)} label="Increase quantity" />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowDiscount((v) => !v)}
            aria-label="Toggle discount"
            className={cn(
              "flex size-8 items-center justify-center rounded-lg border transition-colors",
              item.discount > 0
                ? "border-orange/30 bg-orange/12 text-orange"
                : "border-(--border-default) text-ink-tertiary hover:border-(--border-strong) hover:text-foreground",
            )}
          >
            <Icon name="percent" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowNote((v) => !v)}
            aria-label="Toggle note"
            className={cn(
              "flex size-8 items-center justify-center rounded-lg border transition-colors",
              item.note
                ? "border-brand/30 bg-brand/12 text-brand"
                : "border-(--border-default) text-ink-tertiary hover:border-(--border-strong) hover:text-foreground",
            )}
          >
            <Icon name="pencil" className="size-4" />
          </button>
          <span className="tnum ml-1 w-16 text-right text-sm font-bold text-foreground">
            {formatCurrency(net)}
          </span>
        </div>
      </div>

      {showDiscount && (
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-xs text-ink-secondary">Discount</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-tertiary">
              CA$
            </span>
            <Input
              type="number"
              min={0}
              step="0.5"
              value={item.discount || ""}
              placeholder="0.00"
              onChange={(e) => setDiscount(item.id, Number(e.target.value) || 0)}
              className="h-9 pl-10 text-sm"
            />
          </div>
        </div>
      )}

      {showNote && (
        <div className="mt-2.5">
          <Input
            value={item.note ?? ""}
            placeholder="Add a note (e.g. size M, no ice)…"
            onChange={(e) => setLineNote(item.id, e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      )}
    </div>
  );
}
