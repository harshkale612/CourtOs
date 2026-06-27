"use client";

import { useState } from "react";
import type { Sport } from "@/types";
import { SPORT_LIST } from "@/lib/constants/sports";
import { cn } from "@/lib/utils/cn";
import { useSessionUser } from "@/features/auth/use-session-user";
import { useEvents, useEventRegistrations, useRegisterEvent } from "@/features/events/hooks";
import { EventCard } from "@/features/events/event-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const user = useSessionUser();
  const [filter, setFilter] = useState<Sport | "all">("all");
  const { data: events, isLoading } = useEvents(filter === "all" ? undefined : filter);
  const { data: regs } = useEventRegistrations(user.id);
  const register = useRegisterEvent(user.id);
  const regIds = new Set((regs ?? []).map((r) => r.eventId));

  const chips: { id: Sport | "all"; label: string }[] = [
    { id: "all", label: "All sports" },
    ...SPORT_LIST.map((s) => ({ id: s.id, label: `${s.emoji} ${s.label}` })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Events</h1>
        <p className="mt-1 text-ink-secondary">Clinics, leagues, open play, and tournaments.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setFilter(chip.id)}
            className={cn(
              "shrink-0 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200",
              filter === chip.id
                ? "border-transparent bg-grad-brand text-white shadow-[var(--glow-brand)]"
                : "border-[var(--border-default)] bg-surface text-ink-secondary hover:border-[var(--border-strong)] hover:text-foreground",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
        </div>
      ) : (events ?? []).length === 0 ? (
        <EmptyState icon="trophy" title="No events found" description="Try a different sport filter." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(events ?? []).map((e) => (
            <EventCard
              key={e.id}
              event={e}
              registered={regIds.has(e.id)}
              onRegister={(id) => register.mutate(id)}
              pending={register.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
