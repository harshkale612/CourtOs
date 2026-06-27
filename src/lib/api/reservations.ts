import type { Reservation } from "@/types";
import { db } from "@/lib/mock/data";
import { notFound, ok } from "./client";

let resCounter = 100000;

export interface CreateReservationInput {
  courtId: string;
  userId: string;
  start: string;
  end: string;
  participants?: string[];
  notes?: string;
}

export const reservationsApi = {
  /** A user's reservations, newest first. */
  listForUser: (userId: string) =>
    ok(
      db.reservations
        .filter((r) => r.userId === userId)
        .sort((a, b) => +new Date(b.start) - +new Date(a.start)),
    ),

  /** All reservations on a given calendar day (admin). */
  listByDate: (dateISO: string) => {
    const day = new Date(dateISO).toDateString();
    return ok(db.reservations.filter((r) => new Date(r.start).toDateString() === day));
  },

  get: (id: string): Promise<Reservation> => {
    const r = db.reservations.find((x) => x.id === id);
    return r ? ok(r) : notFound("Reservation");
  },

  create: (input: CreateReservationInput): Promise<Reservation> => {
    const court = db.courts.find((c) => c.id === input.courtId);
    if (!court) return notFound("Court");
    const reservation: Reservation = {
      id: `res_${++resCounter}`,
      courtId: input.courtId,
      userId: input.userId,
      sport: court.sport,
      start: input.start,
      end: input.end,
      status: "confirmed",
      price: court.hourlyRate,
      participants: input.participants ?? [],
      notes: input.notes,
      createdVia: "web",
    };
    db.reservations.push(reservation);
    return ok(reservation, 420);
  },

  cancel: (id: string): Promise<Reservation> => {
    const r = db.reservations.find((x) => x.id === id);
    if (!r) return notFound("Reservation");
    r.status = "cancelled";
    return ok(r, 360);
  },

  reschedule: (id: string, start: string, end: string): Promise<Reservation> => {
    const r = db.reservations.find((x) => x.id === id);
    if (!r) return notFound("Reservation");
    r.start = start;
    r.end = end;
    r.status = "confirmed";
    return ok(r, 360);
  },
};
