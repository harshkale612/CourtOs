"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Sport } from "@/types";
import { ANCHOR_DATE } from "@/lib/mock/prng";
import { SPORT_LIST } from "@/lib/constants/sports";
import { durationMinutes } from "@/lib/utils/format";
import { useSessionUser } from "@/features/auth/use-session-user";
import { useReservations } from "@/features/reservations/hooks";
import { useMembership, usePlans } from "@/features/membership/hooks";
import { useEvents, useEventRegistrations } from "@/features/events/hooks";
import { useBookingStore } from "@/stores/booking-store";
import { ReservationCard } from "@/features/reservations/reservation-card";
import { EventCard } from "@/features/events/event-card";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

function greeting() {
  const h = ANCHOR_DATE.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useSessionUser();
  const setSport = useBookingStore((s) => s.setSport);
  const { data: reservations, isLoading } = useReservations(user.id);
  const { data: membership } = useMembership(user.id);
  const { data: plans } = usePlans();
  const { data: events } = useEvents();
  const { data: regs } = useEventRegistrations(user.id);

  const now = ANCHOR_DATE.getTime();
  const active = (reservations ?? []).filter((r) => r.status !== "cancelled");
  const upcoming = active
    .filter((r) => new Date(r.start).getTime() >= now && r.status !== "completed")
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const completed = active.filter((r) => r.status === "completed");
  const hours = Math.round(active.reduce((sum, r) => sum + durationMinutes(r.start, r.end), 0) / 60);

  const plan = plans?.find((p) => p.id === membership?.planId);
  const used = completed.length;
  const included = plan?.includedBookings ?? 0;
  const upcomingEvents = (events ?? []).filter((e) => new Date(e.start).getTime() >= now).slice(0, 2);
  const regIds = new Set((regs ?? []).map((r) => r.eventId));

  const quickBook = (sport: Sport) => {
    setSport(sport);
    router.push("/app/booking");
  };

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-ink-secondary">{greeting()},</p>
          <h1 className="text-3xl font-bold tracking-tight">{user.name.split(" ")[0]} 👋</h1>
        </div>
        <Button asChild>
          <Link href="/app/booking">
            <Icon name="calendar-plus" className="size-4" /> Book a court
          </Link>
        </Button>
      </div>

      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming bookings" value={upcoming.length} icon="calendar-check" accent="var(--accent-blue)" />
        <StatCard label="Hours on court" value={hours} icon="clock" accent="var(--accent-emerald)" delta={9} />
        <StatCard label="Events joined" value={(regs ?? []).length} icon="trophy" accent="var(--accent-pink)" />
        <StatCard label="Sessions played" value={completed.length} icon="activity" accent="var(--accent-purple)" delta={6} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* left: upcoming + quick book */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Upcoming reservations</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/app/reservations">View all <Icon name="arrow-right" className="size-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
              ) : upcoming.length === 0 ? (
                <EmptyState
                  icon="calendar-plus"
                  title="No upcoming bookings"
                  description="Your next court is one tap away."
                  action={<Button size="sm" asChild><Link href="/app/booking">Book a court</Link></Button>}
                />
              ) : (
                upcoming.slice(0, 3).map((r) => <ReservationCard key={r.id} reservation={r} compact />)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick book</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {SPORT_LIST.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => quickBook(sport.id)}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--border-strong)]"
                  >
                    <span className="text-2xl">{sport.emoji}</span>
                    <span className="text-xs font-medium text-foreground">{sport.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* right: membership + events */}
        <div className="space-y-6">
          <Card variant="featured">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="badge-check" className="size-5 text-brand" />
                {plan?.name ?? "Membership"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {included === -1 ? (
                <p className="text-sm text-ink-secondary">Unlimited bookings included.</p>
              ) : (
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-ink-secondary">Bookings used</span>
                    <span className="tnum font-medium text-foreground">{used} / {included}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-grad-brand" style={{ width: `${Math.min(100, (used / Math.max(1, included)) * 100)}%` }} />
                  </div>
                </div>
              )}
              <Button variant="secondary" size="sm" className="w-full" asChild>
                <Link href="/app/membership">Manage membership</Link>
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold tracking-tight">Recommended events</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/app/events">See all</Link>
              </Button>
            </div>
            {upcomingEvents.map((e) => (
              <EventCard key={e.id} event={e} registered={regIds.has(e.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
