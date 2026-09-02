import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";
import type { PreviewCard } from "./preview-data";

/**
 * One CourtOS interface object, lifted out of the product onto an elevated
 * card. Solid `bg-surface`, not `.glass` — these sit in front of a
 * continuously-animating background for most of the scroll, and
 * `backdrop-filter` forces a re-blur of everything behind it on every frame
 * that background moves. A handful of these stacked was measurably the
 * single most expensive thing in the whole hero (~45% of frame cost in the
 * settled state). A solid, mostly-opaque surface reads just as premium and
 * costs the compositor nothing.
 */
export function ProductCard({ card, className }: { card: PreviewCard; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-(--border-default) bg-surface/95 p-3 shadow-sh-4",
        className,
      )}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `color-mix(in oklab, ${card.accent} 16%, transparent)`,
          color: card.accent,
        }}
      >
        <Icon name={card.icon} className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-tertiary">
          {card.eyebrow}
        </p>
        <p className="mt-0.5 truncate text-[13px] font-semibold text-foreground">{card.title}</p>
        <p className="truncate text-[11px] text-ink-tertiary">{card.sub}</p>
      </div>

      <p className="tnum shrink-0 text-xs font-bold text-foreground">{card.meta}</p>
    </div>
  );
}
