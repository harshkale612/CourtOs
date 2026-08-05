"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PosOrder } from "@/types";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useSessionUser } from "@/features/auth/use-session-user";
import { useMyOrders } from "@/features/shop/hooks";
import { OrderCard } from "@/features/shop/order-card";
import { CartButton } from "@/features/shop/cart-button";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

type Filter = "all" | "online" | "pos" | "to_collect";

const FILTERS: { id: Filter; label: string; icon: string }[] = [
  { id: "all", label: "All orders", icon: "layout-grid" },
  { id: "to_collect", label: "To collect", icon: "package-check" },
  { id: "online", label: "Online", icon: "shopping-bag" },
  { id: "pos", label: "In club", icon: "store" },
];

function matches(order: PosOrder, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "online") return order.channel === "online";
  if (filter === "pos") return order.channel === "pos";
  return (
    order.fulfillment?.status === "preparing" || order.fulfillment?.status === "ready"
  );
}

export default function ShopOrdersPage() {
  const user = useSessionUser();
  const { data: orders, isLoading } = useMyOrders(user.id);
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(
    () => (orders ?? []).filter((o) => matches(o, filter)),
    [orders, filter],
  );

  const counts = useMemo(() => {
    const all = orders ?? [];
    return {
      all: all.length,
      online: all.filter((o) => o.channel === "online").length,
      pos: all.filter((o) => o.channel === "pos").length,
      to_collect: all.filter((o) => matches(o, "to_collect")).length,
    } as Record<Filter, number>;
  }, [orders]);

  const spent = (orders ?? []).reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My orders</h1>
          <p className="mt-1 text-ink-secondary">
            Everything you&apos;ve bought online and at the desk — with pickup status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/app/shop">
              <Icon name="store" className="size-4" /> Shop
            </Link>
          </Button>
          <CartButton />
        </div>
      </div>

      {/* stats */}
      {!isLoading && (orders ?? []).length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Orders" value={String(counts.all)} icon="receipt" />
          <Stat label="Waiting for you" value={String(counts.to_collect)} icon="package-check" />
          <Stat label="Total spent" value={formatCurrency(spent)} icon="wallet" />
        </div>
      )}

      {/* filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors duration-200",
                active
                  ? "border-transparent bg-grad-brand text-white shadow-glow-brand"
                  : "border-(--border-default) bg-surface text-ink-secondary hover:border-(--border-strong) hover:text-foreground",
              )}
            >
              <Icon name={f.icon} className="size-4" />
              {f.label}
              <span className="tnum opacity-70">{counts[f.id]}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon="receipt"
          title={filter === "all" ? "No orders yet" : "Nothing here"}
          description={
            filter === "all"
              ? "Your pro-shop purchases will show up here, with pickup status."
              : "Try a different filter to see your other orders."
          }
          action={
            <Button size="sm" asChild>
              <Link href="/app/shop">Browse the shop</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-(--border-subtle) bg-raised p-4">
      <span className="flex size-10 items-center justify-center rounded-xl bg-fill-3 text-brand">
        <Icon name={icon} className="size-5" />
      </span>
      <div>
        <p className="tnum text-xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-ink-secondary">{label}</p>
      </div>
    </div>
  );
}
