import type { Sport } from "@/types";
import { SPORTS } from "@/lib/constants/sports";
import { cn } from "@/lib/utils/cn";

/** Pill that carries a sport's accent color. Used across booking & admin. */
export function SportBadge({
  sport,
  className,
  showEmoji = true,
}: {
  sport: Sport;
  className?: string;
  showEmoji?: boolean;
}) {
  const config = SPORTS[sport];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        className,
      )}
      style={{
        color: config.color,
        borderColor: `color-mix(in oklab, ${config.color} 25%, transparent)`,
        background: `color-mix(in oklab, ${config.color} 12%, transparent)`,
      }}
    >
      {showEmoji && <span aria-hidden>{config.emoji}</span>}
      {config.label}
    </span>
  );
}
