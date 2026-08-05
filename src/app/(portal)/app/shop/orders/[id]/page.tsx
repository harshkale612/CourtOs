"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ORDER_CHANNELS } from "@/lib/constants/commerce";
import { reservationCourtLabel } from "@/lib/mock/lookup";
import { formatCurrency, formatDate, formatRelativeDay, formatTimeRange } from "@/lib/utils/format";
import { useSessionUser } from "@/features/auth/use-session-user";
import { useMyOrder } from "@/features/shop/hooks";
import { useReservations } from "@/features/reservations/hooks";
import { PickupTracker } from "@/features/shop/pickup-status";
import { ReorderButton } from "@/features/shop/reorder-button";
import { Receipt } from "@/features/pos/receipt";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function ShopOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useSessionUser();
  const { data: order, isLoading, isError } = useMyOrder(user.id, params.id);
  const { data: reservations } = useReservations(user.id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <EmptyState
        icon="receipt"
        title="Order not found"
        description="We couldn't find that order on your account."
        action={
          <Button size="sm" asChild>
            <Link href="/app/shop/orders">Back to my orders</Link>
          </Button>
        }
      />
    );
  }

  const channel = ORDER_CHANNELS[order.channel];
  const linkedReservation = order.fulfillment?.reservationId
    ? (reservations ?? []).find((r) => r.id === order.fulfillment?.reservationId)
    : undefined;
  const hasProducts = order.lineItems.some((l) => l.kind === "product");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href="/app/shop/orders">
            <Icon name="chevron-left" className="size-4" /> My orders
          </Link>
        </Button>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{order.number}</h1>
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            style={{
              color: channel.color,
              borderColor: `color-mix(in oklab, ${channel.color} 30%, transparent)`,
              background: `color-mix(in oklab, ${channel.color} 12%, transparent)`,
            }}
          >
            <Icon name={channel.icon} className="size-3" /> {channel.label}
          </span>
        </div>
        <p className="mt-1 text-ink-secondary">
          {formatRelativeDay(order.createdAt)} · {formatCurrency(order.total)}
        </p>
      </div>

      {order.fulfillment && <PickupTracker fulfillment={order.fulfillment} />}

      {linkedReservation && (
        <div className="flex items-center gap-3 rounded-2xl border border-(--border-subtle) bg-surface p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fill-3 text-brand">
            <Icon name="calendar-check" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Collect after {reservationCourtLabel(linkedReservation)}
            </p>
            <p className="text-xs text-ink-tertiary">
              {formatDate(linkedReservation.start)} ·{" "}
              {formatTimeRange(linkedReservation.start, linkedReservation.end)}
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/reservations">
              View <Icon name="arrow-right" className="size-4" />
            </Link>
          </Button>
        </div>
      )}

      <Receipt order={order} />

      <div className="flex flex-wrap gap-2">
        {hasProducts && <ReorderButton orderId={order.id} label="Order these again" size="md" />}
        <Button variant="secondary" size="md" asChild>
          <Link href="/app/shop">
            <Icon name="store" className="size-4" /> Back to the shop
          </Link>
        </Button>
      </div>
    </div>
  );
}
