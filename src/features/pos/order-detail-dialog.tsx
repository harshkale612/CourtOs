"use client";

import type { FulfillmentStatus, PosOrder } from "@/types";
import { FULFILLMENT_STATUS, ORDER_CHANNELS, PICKUP_METHODS } from "@/lib/constants/commerce";
import { formatRelativeDay } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateFulfillment } from "./hooks";
import { Receipt } from "./receipt";

/** Which state the desk can move a pickup to next. */
const NEXT_ACTIONS: Partial<Record<FulfillmentStatus, FulfillmentStatus[]>> = {
  preparing: ["ready", "cancelled"],
  ready: ["picked_up", "cancelled"],
  cancelled: ["preparing"],
};

/** Full order view for staff — receipt plus the pickup controls. */
export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
}: {
  order: PosOrder | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const update = useUpdateFulfillment();
  if (!order) return null;

  const channel = ORDER_CHANNELS[order.channel];
  const fulfillment = order.fulfillment;
  const actions = fulfillment ? (NEXT_ACTIONS[fulfillment.status] ?? []) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {order.number}
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
          </DialogTitle>
          <DialogDescription>
            {order.customerName ?? "Walk-in"} · {formatRelativeDay(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        {fulfillment && (
          <div className="space-y-3 rounded-xl border border-(--border-subtle) bg-surface p-3.5">
            <div className="flex items-start gap-2.5">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: `color-mix(in oklab, ${PICKUP_METHODS[fulfillment.method].color} 16%, transparent)`,
                  color: PICKUP_METHODS[fulfillment.method].color,
                }}
              >
                <Icon name={PICKUP_METHODS[fulfillment.method].icon} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {PICKUP_METHODS[fulfillment.method].label}
                </p>
                <p className="text-xs text-ink-tertiary">{fulfillment.location}</p>
                {fulfillment.note && (
                  <p className="mt-0.5 text-xs italic text-ink-tertiary">“{fulfillment.note}”</p>
                )}
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{
                  color: FULFILLMENT_STATUS[fulfillment.status].color,
                  background: `color-mix(in oklab, ${FULFILLMENT_STATUS[fulfillment.status].color} 14%, transparent)`,
                }}
              >
                {FULFILLMENT_STATUS[fulfillment.status].label}
              </span>
            </div>

            {actions.length > 0 && (
              <div className="flex gap-2">
                {actions.map((next) => {
                  const cfg = FULFILLMENT_STATUS[next];
                  const destructive = next === "cancelled";
                  return (
                    <Button
                      key={next}
                      size="sm"
                      variant={destructive ? "ghost" : "primary"}
                      className={cn("flex-1", destructive && "text-danger hover:text-danger")}
                      disabled={update.isPending}
                      onClick={() => update.mutate({ orderId: order.id, status: next })}
                    >
                      <Icon name={cfg.icon} className="size-4" />
                      {next === "ready"
                        ? "Mark ready"
                        : next === "picked_up"
                          ? "Mark picked up"
                          : next === "preparing"
                            ? "Reopen"
                            : "Cancel pickup"}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="max-h-[52vh] overflow-y-auto">
          <Receipt order={order} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
