import type { BookingScope } from "@/types";
import { BOOKING_SCOPE } from "@/lib/constants/courts";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";

/** Pill marking whether a reservation booked the entire court or a section. */
export function BookingTypeBadge({
  type,
  className,
  showIcon = true,
}: {
  type: BookingScope;
  className?: string;
  showIcon?: boolean;
}) {
  const cfg = BOOKING_SCOPE[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        className,
      )}
      style={{
        color: cfg.color,
        borderColor: `color-mix(in oklab, ${cfg.color} 28%, transparent)`,
        background: `color-mix(in oklab, ${cfg.color} 12%, transparent)`,
      }}
    >
      {showIcon && <Icon name={cfg.icon} className="size-3" />}
      {cfg.label}
    </span>
  );
}
