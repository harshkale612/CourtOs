"use client";

import Link from "next/link";
import type { PosOrder } from "@/types";
import { ORDER_CHANNELS } from "@/lib/constants/commerce";
import { formatCurrency, formatRelativeDay } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ProductThumb } from "@/features/pos/product-thumb";
import { PickupBadge } from "./pickup-status";
import { ReorderButton } from "./reorder-button";

/** One past purchase — channel, items at a glance, pickup state, reorder. */
export function OrderCard({ order, className }: { order: PosOrder; className?: string }) {
  const channel = ORDER_CHANNELS[order.channel];
  const products = order.lineItems.filter((l) => l.kind === "product");
  const units = order.lineItems.reduce((s, l) => s + l.quantity, 0);
  const reorderable = products.length > 0;

  return (
    <div
      className={cn(
        "group rounded-2xl border border-(--border-subtle) bg-raised p-4 shadow-sh-1 transition-all duration-300 hover:border-(--border-strong) hover:shadow-sh-2 sm:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
          style={{
            color: channel.color,
            borderColor: `color-mix(in oklab, ${channel.color} 30%, transparent)`,
            background: `color-mix(in oklab, ${channel.color} 12%, transparent)`,
          }}
        >
          <Icon name={channel.icon} className="size-3" /> {channel.short}
        </span>
        <Link
          href={`/app/shop/orders/${order.id}`}
          className="tnum text-sm font-semibold tracking-tight text-foreground hover:text-brand"
        >
          {order.number}
        </Link>
        <span className="text-xs text-ink-tertiary">{formatRelativeDay(order.createdAt)}</span>
        <PickupBadge fulfillment={order.fulfillment} className="ml-auto" />
      </div>

      {/* item strip */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-2">
          {order.lineItems.slice(0, 4).map((l) => (
            <ProductThumb
              key={l.id}
              category={l.category ?? "merch"}
              emoji={l.emoji}
              imageUrl={l.imageUrl}
              name={l.name}
              className="size-11 rounded-xl ring-2 ring-(--bg-raised)"
              emojiClassName="text-lg"
            />
          ))}
          {order.lineItems.length > 4 && (
            <span className="flex size-11 items-center justify-center rounded-xl bg-fill-4 text-xs font-semibold text-ink-secondary ring-2 ring-(--bg-raised)">
              +{order.lineItems.length - 4}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">
            {order.lineItems.map((l) => l.name).join(", ")}
          </p>
          <p className="text-xs text-ink-tertiary">
            {units} item{units === 1 ? "" : "s"}
            {order.reservationId ? " · booking add-on" : ""}
          </p>
        </div>
        <span className="tnum shrink-0 text-lg font-bold tracking-tight text-foreground">
          {formatCurrency(order.total)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/app/shop/orders/${order.id}`}>
            <Icon name="receipt" className="size-4" /> View order
          </Link>
        </Button>
        {reorderable && <ReorderButton orderId={order.id} />}
      </div>
    </div>
  );
}
