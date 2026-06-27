"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { coachName, courtName } from "@/lib/mock/lookup";
import { SPORTS } from "@/lib/constants/sports";
import { formatCurrency, formatRelativeDay, formatTimeRange } from "@/lib/utils/format";
import { useSessionUser } from "@/features/auth/use-session-user";
import { useEvent, useEventRegistrations, useRegisterEvent } from "@/features/events/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { SportBadge } from "@/components/ui/sport-badge";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_LABEL: Record<string, string> = {
  clinic: "Clinic", league: "League", tournament: "Tournament", open_play: "Open Play", lesson: "Lesson",
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useSessionUser();
  const { data: event, isLoading } = useEvent(params.id);
  const { data: regs } = useEventRegistrations(user.id);
  const register = useRegisterEvent(user.id);

  if (isLoading || !event) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const sport = SPORTS[event.sport];
  const registered = (regs ?? []).some((r) => r.eventId === event.id);
  const spotsLeft = event.capacity - event.registeredCount;
  const pct = Math.round((event.registeredCount / event.capacity) * 100);

  return (
    <div className="space-y-6">
      <Link href="/app/events" className="inline-flex items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-foreground">
        <Icon name="chevron-left" className="size-4" /> All events
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-[var(--border-subtle)]">
            {event.coverUrl && <Image src={event.coverUrl} alt={event.title} fill sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" priority />}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)]/80 to-transparent" />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Badge tone="neutral" className="bg-black/40 backdrop-blur">{TYPE_LABEL[event.type]}</Badge>
              <SportBadge sport={event.sport} className="bg-black/40 backdrop-blur" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="mt-4 text-pretty leading-relaxed text-ink-secondary">{event.description}</p>
          </div>
        </div>

        {/* booking sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5 rounded-3xl border border-[var(--border-subtle)] bg-raised p-6">
            <div className="flex items-baseline justify-between">
              <span className="tnum text-3xl font-bold tracking-tight">
                {event.price === 0 ? "Free" : formatCurrency(event.price)}
              </span>
              <span className={spotsLeft <= 3 ? "text-sm font-medium text-orange" : "text-sm text-ink-secondary"}>
                {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <Detail icon="calendar" label={formatRelativeDay(event.start)} />
              <Detail icon="clock" label={formatTimeRange(event.start, event.end)} />
              {coachName(event.coachId) && <Detail icon="whistle" label={`Coach ${coachName(event.coachId)}`} />}
              {event.courtId && <Detail icon="map-pin" label={courtName(event.courtId)} />}
              <Detail icon="badge-check" label={`${event.skillLevel} level`} />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-xs text-ink-tertiary">
                <span>{event.registeredCount} registered</span>
                <span>{event.capacity} capacity</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: sport.color }} />
              </div>
            </div>

            {registered ? (
              <Button variant="secondary" className="w-full" disabled>
                <Icon name="check-circle" className="size-4 text-success" /> You&apos;re registered
              </Button>
            ) : (
              <Button className="w-full" onClick={() => register.mutate(event.id)} disabled={register.isPending}>
                {register.isPending ? "Registering…" : spotsLeft <= 0 ? "Join waitlist" : "Register now"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 capitalize text-ink-secondary">
      <Icon name={icon} className="size-4 text-ink-tertiary" />
      {label}
    </div>
  );
}
