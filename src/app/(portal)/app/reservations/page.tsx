"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Reservation } from "@/types";
import { ANCHOR_DATE } from "@/lib/mock/prng";
import { useSessionUser } from "@/features/auth/use-session-user";
import { useReservations, useCancelReservation } from "@/features/reservations/hooks";
import { ReservationCard } from "@/features/reservations/reservation-card";
import { useBookingStore } from "@/stores/booking-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ReservationsPage() {
  const router = useRouter();
  const user = useSessionUser();
  const setSport = useBookingStore((s) => s.setSport);
  const { data: reservations, isLoading } = useReservations(user.id);
  const cancel = useCancelReservation(user.id);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const now = ANCHOR_DATE.getTime();
  const { upcoming, past, cancelled } = useMemo(() => {
    const all = reservations ?? [];
    return {
      upcoming: all.filter(
        (r) => (r.status === "confirmed" || r.status === "pending") && new Date(r.start).getTime() >= now,
      ),
      past: all.filter((r) => r.status === "completed" || r.status === "no_show" || (new Date(r.start).getTime() < now && r.status !== "cancelled")),
      cancelled: all.filter((r) => r.status === "cancelled"),
    };
  }, [reservations, now]);

  const reschedule = (r: Reservation) => {
    setSport(r.sport);
    router.push("/app/booking");
  };

  const renderList = (list: Reservation[], emptyMsg: string, withActions = false) => {
    if (isLoading) return Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />);
    if (list.length === 0)
      return (
        <EmptyState
          icon="calendar-check"
          title={emptyMsg}
          description="When you book, your reservations show up here."
          action={<Button size="sm" asChild><Link href="/app/booking">Book a court</Link></Button>}
        />
      );
    return list.map((r) => (
      <ReservationCard
        key={r.id}
        reservation={r}
        onCancel={withActions ? setCancelId : undefined}
        onReschedule={withActions ? reschedule : undefined}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reservations</h1>
          <p className="mt-1 text-ink-secondary">Manage your upcoming and past bookings.</p>
        </div>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/app/booking"><Icon name="calendar-plus" className="size-4" /> New booking</Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming{upcoming.length > 0 && ` (${upcoming.length})`}</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-3">{renderList(upcoming, "No upcoming reservations", true)}</TabsContent>
        <TabsContent value="past" className="space-y-3">{renderList(past, "No past reservations")}</TabsContent>
        <TabsContent value="cancelled" className="space-y-3">{renderList(cancelled, "No cancelled reservations")}</TabsContent>
      </Tabs>

      <Dialog open={!!cancelId} onOpenChange={(v) => !v && setCancelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this reservation?</DialogTitle>
            <DialogDescription>
              This frees the slot for other members. If you&apos;re within the cancellation window,
              you won&apos;t be charged.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelId(null)}>Keep it</Button>
            <Button
              variant="destructive"
              disabled={cancel.isPending}
              onClick={() => {
                if (cancelId) cancel.mutate(cancelId, { onSettled: () => setCancelId(null) });
              }}
            >
              {cancel.isPending ? "Cancelling…" : "Cancel reservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
