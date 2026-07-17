import type { BookingScope, Reservation } from "@/types";
import { db } from "@/lib/mock/data";
import { hasConflict } from "@/lib/mock/availability";
import { resolvePrice } from "@/lib/utils/pricing";
import { ApiError, notFound, ok } from "./client";

let resCounter = 100000;

export interface CreateReservationInput {
  courtId: string;
  /** Omit to book the entire court; provide to book a single section. */
  sectionId?: string;
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

    if (input.sectionId && !court.sections?.some((s) => s.id === input.sectionId)) {
      return notFound("Section");
    }

    // Enforce the two-mode conflict rules before writing.
    if (hasConflict(db.reservations, input.courtId, input.sectionId, input.start, input.end)) {
      const reason = input.sectionId
        ? "That section overlaps an existing booking (a whole-court booking blocks all sections)."
        : "The whole court can't be booked while a section or the court is already reserved for that time.";
      throw new ApiError(409, reason);
    }

    const bookingType: BookingScope = input.sectionId ? "section" : "whole";
    const reservation: Reservation = {
      id: `res_${++resCounter}`,
      courtId: input.courtId,
      sectionId: input.sectionId,
      bookingType,
      userId: input.userId,
      sport: court.sport,
      start: input.start,
      end: input.end,
      status: "confirmed",
      price: resolvePrice(court, input.sectionId),
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
    // Respect conflicts on reschedule too (ignore this reservation's own slot).
    if (hasConflict(db.reservations, r.courtId, r.sectionId, start, end, r.id)) {
      throw new ApiError(409, "That time conflicts with another booking on this court.");
    }
    r.start = start;
    r.end = end;
    r.status = "confirmed";
    return ok(r, 360);
  },
};
