"use client";

import type { PickupMethod, Reservation } from "@/types";
import { PICKUP_METHODS, PICKUP_METHOD_LIST } from "@/lib/constants/commerce";
import { reservationCourtLabel } from "@/lib/mock/lookup";
import { formatDate, formatTimeRange } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";

/**
 * Where the member wants to collect. "Pickup after booking" only appears when
 * they actually have an upcoming session to attach it to — and then asks which.
 */
export function PickupSelect({
  value,
  reservationId,
  onChange,
  reservations = [],
  className,
}: {
  value: PickupMethod;
  reservationId?: string;
  onChange: (method: PickupMethod, reservationId?: string) => void;
  /** Upcoming, non-cancelled reservations for this member. */
  reservations?: Reservation[];
  className?: string;
}) {
  const options = PICKUP_METHOD_LIST.filter(
    (m) => m.id !== "after_booking" || reservations.length > 0,
  );

  return (
    <div className={cn("space-y-2", className)}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <div key={opt.id}>
            <button
              type="button"
              onClick={() =>
                onChange(opt.id, opt.id === "after_booking" ? (reservationId ?? reservations[0]?.id) : undefined)
              }
              aria-pressed={active}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
                active
                  ? "border-transparent bg-grad-brand-soft shadow-sh-1 ring-1 ring-brand/40"
                  : "border-(--border-default) bg-surface hover:border-(--border-strong)",
              )}
            >
              <span
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: `color-mix(in oklab, ${opt.color} 16%, transparent)`,
                  color: opt.color,
                }}
              >
                <Icon name={opt.icon} className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{opt.label}</span>
                <span className="block text-xs text-ink-secondary">{opt.blurb}</span>
                <span className="mt-1 block text-[11px] text-ink-tertiary">{opt.location}</span>
              </span>
              <span
                className={cn(
                  "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active ? "border-transparent bg-grad-brand text-white" : "border-(--border-strong)",
                )}
              >
                {active && <Icon name="check" className="size-3" strokeWidth={3} />}
              </span>
            </button>

            {/* which session to meet at */}
            {active && opt.id === "after_booking" && (
              <div className="mt-2 space-y-1.5 rounded-xl border border-(--border-subtle) bg-surface p-2">
                {reservations.slice(0, 4).map((r) => {
                  const picked = reservationId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onChange("after_booking", r.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        picked ? "bg-fill-4 text-foreground" : "text-ink-secondary hover:bg-fill-2",
                      )}
                    >
                      <Icon
                        name={picked ? "check-circle" : "circle-dot"}
                        className={cn("size-4 shrink-0", picked && "text-brand")}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-foreground">
                          {reservationCourtLabel(r)}
                        </span>
                        <span className="block text-xs text-ink-tertiary">
                          {formatDate(r.start)} · {formatTimeRange(r.start, r.end)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Compact, read-only echo of the chosen pickup (checkout review, receipts). */
export function PickupLine({ method, className }: { method: PickupMethod; className?: string }) {
  const cfg = PICKUP_METHODS[method];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <Icon name={cfg.icon} className="size-4" style={{ color: cfg.color }} />
      <span className="font-medium text-foreground">{cfg.label}</span>
    </span>
  );
}
