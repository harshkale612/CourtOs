"use client";

import { formatCurrency } from "@/lib/utils/format";
import { computeTotals } from "@/lib/utils/pos";
import { cn } from "@/lib/utils/cn";
import { useShopCartStore } from "@/stores/shop-cart-store";
import { Icon } from "@/components/ui/icon";

/** Opens the basket and shows what's in it — the shop's persistent anchor. */
export function CartButton({ className }: { className?: string }) {
  const items = useShopCartStore((s) => s.items);
  const setOpen = useShopCartStore((s) => s.setOpen);
  const totals = computeTotals(items);
  const count = totals.itemCount;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "relative inline-flex h-10 items-center gap-2 rounded-full border border-(--border-default) bg-surface px-4 text-sm font-medium text-foreground transition-all duration-200 hover:border-(--border-strong) hover:shadow-sh-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        className,
      )}
      aria-label={`Open cart · ${count} item${count === 1 ? "" : "s"}`}
    >
      <span className="relative">
        <Icon name="shopping-bag" className="size-4" />
        {count > 0 && (
          <span className="tnum absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-grad-brand text-[10px] font-bold text-white shadow-glow-brand">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span className="tnum font-semibold text-foreground">{formatCurrency(totals.total)}</span>
      )}
    </button>
  );
}
