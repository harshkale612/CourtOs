"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FulfillmentStatus, OrderChannel, PosOrder } from "@/types";
import {
  FULFILLMENT_STATUS,
  ORDER_CHANNELS,
  ORDER_CHANNEL_LIST,
  PICKUP_METHODS,
} from "@/lib/constants/commerce";
import { ORDER_STATUS } from "@/lib/constants/pos";
import { formatCurrency, formatRelativeDay, formatTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { AdminHeader } from "@/features/admin/admin-header";
import { useCommerceSummary, usePosOrders } from "@/features/pos/hooks";
import { OrderDetailDialog } from "@/features/pos/order-detail-dialog";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ChannelFilter = OrderChannel | "all";
type PickupFilter = FulfillmentStatus | "all" | "open";

const PICKUP_FILTERS: { id: PickupFilter; label: string; icon: string }[] = [
  { id: "all", label: "All pickups", icon: "layout-grid" },
  { id: "open", label: "Needs action", icon: "hourglass" },
  { id: "preparing", label: "Preparing", icon: "package-open" },
  { id: "ready", label: "Ready", icon: "package-check" },
  { id: "picked_up", label: "Picked up", icon: "check-circle" },
];

function matchesPickup(order: PosOrder, filter: PickupFilter) {
  if (filter === "all") return true;
  const status = order.fulfillment?.status;
  if (filter === "open") return status === "preparing" || status === "ready";
  return status === filter;
}

export default function CommerceOrdersPage() {
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [pickup, setPickup] = useState<PickupFilter>("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<PosOrder | null>(null);

  const { data: orders, isLoading } = usePosOrders({
    limit: 200,
    channel: channel === "all" ? undefined : channel,
    query: query.trim() || undefined,
  });
  const { data: summary } = useCommerceSummary();

  const rows = useMemo(
    () => (orders ?? []).filter((o) => matchesPickup(o, pickup)),
    [orders, pickup],
  );

  const pickupCounts = useMemo(() => {
    const all = orders ?? [];
    const count = (f: PickupFilter) => all.filter((o) => matchesPickup(o, f)).length;
    return {
      all: all.length,
      open: count("open"),
      preparing: count("preparing"),
      ready: count("ready"),
      picked_up: count("picked_up"),
      cancelled: count("cancelled"),
    } as Record<PickupFilter, number>;
  }, [orders]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Orders"
        subtitle="Every sale across both channels — the register and the member shop"
        actions={
          <>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/admin/pos">
                <Icon name="shopping-cart" className="size-4" /> Register
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/admin/pos/reports">
                <Icon name="bar-chart-3" className="size-4" /> Reports
              </Link>
            </Button>
          </>
        }
      />

      {/* channel snapshot */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary ? (
          <>
            <StatCard
              label="Online shop orders (30d)"
              value={summary.onlineOrders}
              icon="shopping-bag"
              accent={ORDER_CHANNELS.online.color}
              delta={18.4}
            />
            <StatCard
              label="POS orders (30d)"
              value={summary.posOrders}
              icon="store"
              accent={ORDER_CHANNELS.pos.color}
              delta={5.2}
            />
            <StatCard
              label="Awaiting pickup"
              value={summary.awaitingPickup}
              icon="package-check"
              accent="var(--accent-orange)"
            />
            <StatCard
              label="Average basket size"
              value={summary.avgBasketSize}
              icon="shopping-basket"
              accent="var(--accent-purple)"
              format={(n) => formatCurrency(n)}
              delta={4.6}
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))
        )}
      </div>

      {/* filters */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by receipt no., member or product…"
              className="h-10 pl-9"
              aria-label="Search orders"
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", ...ORDER_CHANNEL_LIST.map((c) => c.id)] as ChannelFilter[]).map((id) => {
              const cfg = id === "all" ? null : ORDER_CHANNELS[id];
              const on = channel === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setChannel(id)}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium transition-colors",
                    on
                      ? "border-transparent bg-fill-5 text-foreground"
                      : "border-(--border-default) text-ink-secondary hover:border-(--border-strong)",
                  )}
                >
                  <Icon
                    name={cfg?.icon ?? "layout-grid"}
                    className="size-4"
                    style={cfg ? { color: cfg.color } : undefined}
                  />
                  {cfg?.short ?? "All channels"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {PICKUP_FILTERS.map((f) => {
            const on = pickup === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setPickup(f.id)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition-colors",
                  on
                    ? "border-transparent bg-grad-brand text-white shadow-glow-brand"
                    : "border-(--border-default) bg-surface text-ink-secondary hover:border-(--border-strong) hover:text-foreground",
                )}
              >
                <Icon name={f.icon} className="size-3.5" />
                {f.label}
                <span className="tnum opacity-70">{pickupCounts[f.id] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon="receipt"
          title="No orders match"
          description="Adjust the channel, pickup state or search to see more."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-(--border-subtle) bg-raised">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead className="hidden sm:table-cell">Channel</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden lg:table-cell">Items</TableHead>
                <TableHead className="hidden md:table-cell">Pickup</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 60).map((o) => {
                const chan = ORDER_CHANNELS[o.channel];
                const units = o.lineItems.reduce((s, l) => s + l.quantity, 0);
                const f = o.fulfillment;
                const fCfg = f ? FULFILLMENT_STATUS[f.status] : null;
                return (
                  <TableRow
                    key={o.id}
                    className="cursor-pointer"
                    onClick={() => setActive(o)}
                  >
                    <TableCell>
                      <span className="tnum block font-medium text-foreground">{o.number}</span>
                      <span className="block text-xs text-ink-tertiary">
                        {formatTime(o.createdAt)} · {formatRelativeDay(o.createdAt).split(" · ")[0]}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          color: chan.color,
                          borderColor: `color-mix(in oklab, ${chan.color} 30%, transparent)`,
                          background: `color-mix(in oklab, ${chan.color} 12%, transparent)`,
                        }}
                      >
                        <Icon name={chan.icon} className="size-3" /> {chan.short}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="block truncate text-foreground">
                        {o.customerName ?? "Walk-in"}
                      </span>
                      {o.channel === "pos" && (
                        <span className="block truncate text-xs text-ink-tertiary">
                          by {o.cashierName}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="flex items-center gap-1.5">
                        <span className="tnum text-foreground">{units}</span>
                        <span className="truncate text-xs text-ink-tertiary">
                          {o.lineItems[0]?.name}
                          {o.lineItems.length > 1 ? ` +${o.lineItems.length - 1}` : ""}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {f ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <Icon
                            name={PICKUP_METHODS[f.method].icon}
                            className="size-3.5"
                            style={{ color: PICKUP_METHODS[f.method].color }}
                          />
                          <span className="text-ink-secondary">
                            {PICKUP_METHODS[f.method].label.replace("Pickup ", "")}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-ink-tertiary">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {o.status !== "completed" ? (
                        <Badge tone={ORDER_STATUS[o.status].tone}>
                          {ORDER_STATUS[o.status].label}
                        </Badge>
                      ) : fCfg ? (
                        <Badge tone={fCfg.tone} className="gap-1">
                          <Icon name={fCfg.icon} className="size-3" />
                          {fCfg.label}
                        </Badge>
                      ) : (
                        <Badge tone="success">Completed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="tnum text-right font-medium text-foreground">
                      {formatCurrency(o.total)}
                    </TableCell>
                    <TableCell>
                      <Icon name="chevron-right" className="size-4 text-ink-tertiary" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <OrderDetailDialog
        order={active}
        open={!!active}
        onOpenChange={(v) => !v && setActive(null)}
      />
    </div>
  );
}
