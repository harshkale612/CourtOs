"use client";

import { useMemo, useState } from "react";
import { db } from "@/lib/mock/data";
import { formatCurrency, initials } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePosCartStore } from "@/stores/pos-cart-store";

/** Attach a member to the sale (enables club credit + member history). */
export function CustomerPicker({ className }: { className?: string }) {
  const { customerId, customerName, setCustomer } = usePosCartStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const base = query
      ? db.members.filter(
          (m) => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query),
        )
      : db.members;
    return base.slice(0, 40);
  }, [q]);

  return (
    <>
      <div className={cn("flex items-center gap-1.5", className)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-(--border-default) bg-surface px-3 py-2 text-left text-sm transition-colors hover:border-(--border-strong)"
        >
          <Icon name={customerId ? "user" : "user-plus"} className="size-4 shrink-0 text-ink-secondary" />
          <span className={cn("truncate", customerId ? "font-medium text-foreground" : "text-ink-secondary")}>
            {customerName ?? "Add customer (walk-in)"}
          </span>
        </button>
        {customerId && (
          <button
            type="button"
            onClick={() => setCustomer(undefined, undefined)}
            aria-label="Clear customer"
            className="shrink-0 rounded-lg border border-(--border-default) p-2 text-ink-tertiary transition-colors hover:border-(--border-strong) hover:text-danger"
          >
            <Icon name="x" className="size-4" />
          </button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attach a member</DialogTitle>
            <DialogDescription>Link this sale to a member for club credit & history.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
            <Input
              autoFocus
              placeholder="Search members…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="-mx-2 h-80 px-2">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setCustomer(undefined, undefined);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-fill-4"
              >
                <span className="flex size-9 items-center justify-center rounded-full border border-(--border-default) bg-surface text-ink-secondary">
                  <Icon name="user" className="size-4" />
                </span>
                <span className="text-sm font-medium text-foreground">Walk-in (no member)</span>
              </button>
              {results.map((m) => {
                const credit = db.clubCredit[m.id] ?? 0;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setCustomer(m.id, m.name);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-fill-4"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-grad-brand-soft text-xs font-semibold text-foreground">
                      {initials(m.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{m.name}</span>
                      <span className="block truncate text-xs text-ink-tertiary">{m.email}</span>
                    </span>
                    {credit > 0 && (
                      <span
                        className="tnum shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          color: "var(--accent-purple)",
                          background: "color-mix(in oklab, var(--accent-purple) 14%, transparent)",
                        }}
                      >
                        {formatCurrency(credit)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
