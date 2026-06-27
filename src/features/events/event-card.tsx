"use client";

import Image from "next/image";
import Link from "next/link";
import type { SportEvent } from "@/types";
import { coachName } from "@/lib/mock/lookup";
import { SPORTS } from "@/lib/constants/sports";
import { formatCurrency, formatRelativeDay } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SportBadge } from "@/components/ui/sport-badge";

const TYPE_LABEL: Record<string, string> = {
  clinic: "Clinic",
  league: "League",
  tournament: "Tournament",
  open_play: "Open Play",
  lesson: "Lesson",
};

export function EventCard({
  event,
  registered,
  onRegister,
  pending,
}: {
  event: SportEvent;
  registered?: boolean;
  onRegister?: (id: string) => void;
  pending?: boolean;
}) {
  const sport = SPORTS[event.sport];
  const pct = Math.round((event.registeredCount / event.capacity) * 100);
  const spotsLeft = event.capacity - event.registeredCount;
  const coach = coachName(event.coachId);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-raised transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--sh-3)]">
      <Link href={`/app/events/${event.id}`} className="relative block aspect-[16/9] overflow-hidden">
        {event.coverUrl && (
          <Image
            src={event.coverUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-raised)] via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone="neutral" className="bg-black/40 backdrop-blur">{TYPE_LABEL[event.type]}</Badge>
        </div>
        <div className="absolute right-3 top-3">
          <SportBadge sport={event.sport} showEmoji={false} className="bg-black/40 backdrop-blur" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/app/events/${event.id}`}>
          <h3 className="text-balance font-semibold leading-snug tracking-tight transition-colors group-hover:text-brand">
            {event.title}
          </h3>
        </Link>
        <div className="mt-2 space-y-1 text-xs text-ink-secondary">
          <p className="flex items-center gap-1.5">
            <Icon name="calendar" className="size-3.5 text-ink-tertiary" />
            {formatRelativeDay(event.start)}
          </p>
          {coach && (
            <p className="flex items-center gap-1.5">
              <Icon name="whistle" className="size-3.5 text-ink-tertiary" /> {coach}
            </p>
          )}
        </div>

        {/* capacity */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-ink-tertiary">{event.registeredCount}/{event.capacity} spots</span>
            <span className={cn("font-medium", spotsLeft <= 3 ? "text-orange" : "text-ink-secondary")}>
              {spotsLeft > 0 ? `${spotsLeft} left` : "Full"}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: sport.color }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="tnum font-bold text-foreground">
            {event.price === 0 ? "Free" : formatCurrency(event.price)}
          </span>
          {onRegister &&
            (registered ? (
              <Badge tone="success" dot>Registered</Badge>
            ) : (
              <Button size="sm" onClick={() => onRegister(event.id)} disabled={pending || spotsLeft <= 0}>
                {spotsLeft <= 0 ? "Join waitlist" : "Register"}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
