"use client";

import { useEffect } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreditBalance } from "@/features/pos/hooks";
import { usePaymentMethods } from "./hooks";

/** What the caller charges — mirrors a `PosPayment` tender. */
export interface PaymentChoice {
  method: "card" | "club_credit";
  reference: string;
}

const BRAND_COLOR: Record<string, string> = {
  visa: "#1A1F71",
  mastercard: "#EB001B",
  amex: "#006FCF",
  discover: "#FF6000",
};

/**
 * The member's payment step — one component behind every member-facing
 * checkout (Shop basket, booking confirmation, booking add-ons), so paying for
 * a court and paying for a sports drink feel like the same act.
 */
export function PaymentSelect({
  userId,
  amount,
  value,
  onChange,
  className,
}: {
  userId: string;
  /** Total being charged — club credit is offered only when it covers it. */
  amount: number;
  value: PaymentChoice | null;
  onChange: (choice: PaymentChoice) => void;
  className?: string;
}) {
  const { data: methods, isLoading } = usePaymentMethods(userId);
  const { data: credit = 0 } = useCreditBalance(userId);
  const creditCovers = credit >= amount - 0.01;

  // Default to the member's primary card as soon as one is known.
  useEffect(() => {
    if (value || !methods?.length) return;
    const card = methods.find((m) => m.isDefault) ?? methods[0];
    onChange({ method: "card", reference: `${brandLabel(card.brand)} •${card.last4}` });
  }, [methods, value, onChange]);

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {(methods ?? []).map((m) => {
        const reference = `${brandLabel(m.brand)} •${m.last4}`;
        const active = value?.method === "card" && value.reference === reference;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange({ method: "card", reference })}
            aria-pressed={active}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
              active
                ? "border-transparent bg-grad-brand-soft shadow-sh-1 ring-1 ring-brand/40"
                : "border-(--border-default) bg-surface hover:border-(--border-strong)",
            )}
          >
            <span
              className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md text-[10px] font-bold uppercase text-white"
              style={{ background: BRAND_COLOR[m.brand] }}
            >
              {m.brand.slice(0, 4)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">•••• {m.last4}</span>
              <span className="block text-xs text-ink-tertiary">
                Expires {String(m.expMonth).padStart(2, "0")}/{m.expYear}
                {m.isDefault ? " · default" : ""}
              </span>
            </span>
            <Check active={active} />
          </button>
        );
      })}

      <button
        type="button"
        disabled={!creditCovers}
        onClick={() => onChange({ method: "club_credit", reference: "Club credit" })}
        aria-pressed={value?.method === "club_credit"}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
          value?.method === "club_credit"
            ? "border-transparent bg-grad-brand-soft shadow-sh-1 ring-1 ring-brand/40"
            : "border-(--border-default) bg-surface hover:border-(--border-strong)",
          !creditCovers && "cursor-not-allowed opacity-55 hover:border-(--border-default)",
        )}
      >
        <span
          className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md"
          style={{
            background: "color-mix(in oklab, var(--accent-purple) 16%, transparent)",
            color: "var(--accent-purple)",
          }}
        >
          <Icon name="wallet" className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-foreground">Club credit</span>
          <span className="block text-xs text-ink-tertiary">
            {formatCurrency(credit)} available
            {!creditCovers && credit > 0 ? " · not enough for this order" : ""}
          </span>
        </span>
        <Check active={value?.method === "club_credit"} />
      </button>
    </div>
  );
}

function Check({ active }: { active?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
        active ? "border-transparent bg-grad-brand text-white" : "border-(--border-strong)",
      )}
    >
      {active && <Icon name="check" className="size-3" strokeWidth={3} />}
    </span>
  );
}

function brandLabel(brand: string) {
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}
