"use client";

import type { OrderFulfillment } from "@/types";
import {
  FULFILLMENT_STATUS,
  FULFILLMENT_TRAIL,
  PICKUP_METHODS,
} from "@/lib/constants/commerce";
import { formatRelativeDay } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

/** Compact pickup state — used in order lists and tables. */
export function PickupBadge({
  fulfillment,
  className,
}: {
  fulfillment?: OrderFulfillment;
  className?: string;
}) {
  if (!fulfillment) {
    return (
      <Badge tone="neutral" className={className}>
        No pickup
      </Badge>
    );
  }
  const cfg = FULFILLMENT_STATUS[fulfillment.status];
  return (
    <Badge tone={cfg.tone} className={cn("gap-1", className)}>
      <Icon name={cfg.icon} className="size-3" />
      {cfg.label}
    </Badge>
  );
}

/**
 * The member's "where's my order?" answer: which counter, what state, what's
 * next. Rendered on the order detail page and the active-pickup banner.
 */
export function PickupTracker({
  fulfillment,
  className,
}: {
  fulfillment: OrderFulfillment;
  className?: string;
}) {
  const method = PICKUP_METHODS[fulfillment.method];
  const status = FULFILLMENT_STATUS[fulfillment.status];
  const cancelled = fulfillment.status === "cancelled";
  const currentStep = FULFILLMENT_TRAIL.indexOf(fulfillment.status);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-(--border-subtle) bg-raised p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `color-mix(in oklab, ${method.color} 16%, transparent)`,
            color: method.color,
          }}
        >
          <Icon name={method.icon} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold tracking-tight">{method.label}</h3>
            <PickupBadge fulfillment={fulfillment} />
          </div>
          <p className="mt-0.5 text-sm text-ink-secondary">{status.hint}</p>
          <p className="mt-1 text-xs text-ink-tertiary">{fulfillment.location}</p>
          {fulfillment.readyAt && !cancelled && fulfillment.status !== "picked_up" && (
            <p className="mt-1 text-xs text-ink-tertiary">
              Ready {formatRelativeDay(fulfillment.readyAt)}
            </p>
          )}
          {fulfillment.pickedUpAt && fulfillment.status === "picked_up" && (
            <p className="mt-1 text-xs text-ink-tertiary">
              Collected {formatRelativeDay(fulfillment.pickedUpAt)}
            </p>
          )}
          {fulfillment.note && (
            <p className="mt-1 text-xs italic text-ink-tertiary">“{fulfillment.note}”</p>
          )}
        </div>
      </div>

      {/* progress trail */}
      {!cancelled && (
        <ol className="mt-5 flex items-center gap-1.5" aria-label="Pickup progress">
          {FULFILLMENT_TRAIL.map((step, i) => {
            const cfg = FULFILLMENT_STATUS[step];
            const done = i <= currentStep;
            return (
              <li key={step} className="flex flex-1 flex-col gap-1.5">
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-colors duration-500",
                    done ? "bg-grad-brand" : "bg-fill-4",
                  )}
                />
                <span
                  className={cn(
                    "flex items-center gap-1 text-[11px] font-medium",
                    done ? "text-foreground" : "text-ink-tertiary",
                  )}
                >
                  <Icon name={cfg.icon} className="size-3" />
                  {cfg.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
