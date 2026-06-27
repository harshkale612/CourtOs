"use client";

import type { Reservation } from "@/types";
import { getCourt } from "@/lib/mock/lookup";
import { SPORTS } from "@/lib/constants/sports";
import { BOOKING_STATUS } from "@/lib/constants/statuses";
import { formatCurrency, formatRelativeDay, formatTimeRange } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function ReservationCard({
  reservation,
  onCancel,
  onReschedule,
  compact,
}: {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  onReschedule?: (r: Reservation) => void;
  compact?: boolean;
}) {
  const court = getCourt(reservation.courtId);
  const sport = SPORTS[reservation.sport];
  const status = BOOKING_STATUS[reservation.status];
  const canModify = reservation.status === "confirmed" || reservation.status === "pending";

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-raised p-4 transition-colors hover:border-[var(--border-strong)]">
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ background: `color-mix(in oklab, ${sport.color} 16%, transparent)` }}
      >
        {sport.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-foreground">{court?.name ?? "Court"}</p>
          <Badge tone={status.tone} className={cn(compact && "hidden sm:inline-flex")}>
            {status.label}
          </Badge>
        </div>
        <p className="mt-0.5 text-sm text-ink-secondary">{formatRelativeDay(reservation.start)}</p>
        <p className="text-xs text-ink-tertiary">
          {formatTimeRange(reservation.start, reservation.end)} · {sport.label}
        </p>
      </div>

      <div className="hidden flex-col items-end gap-2 sm:flex">
        <span className="tnum font-semibold text-foreground">{formatCurrency(reservation.price)}</span>
        {canModify && (onReschedule || onCancel) && (
          <div className="flex gap-1">
            {onReschedule && (
              <Button variant="ghost" size="sm" onClick={() => onReschedule(reservation)}>
                <Icon name="calendar-range" className="size-4" /> Reschedule
              </Button>
            )}
            {onCancel && (
              <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={() => onCancel(reservation.id)}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
