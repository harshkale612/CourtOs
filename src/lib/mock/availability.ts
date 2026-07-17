/**
 * Booking conflict & availability engine — the single source of truth for the
 * two-mode (whole vs. section) rules. Pure functions over a reservation list so
 * the mock generator, the courts API, the reservations validator, the courts
 * page, and analytics all agree by construction (no circular deps on `db`).
 *
 * Rules encoded here:
 *  - A WHOLE-court booking overlaps (and is overlapped by) EVERY lane — the
 *    whole court and all of its sections.
 *  - A SECTION booking overlaps only its own section AND any whole-court booking.
 *  - Sibling sections are independent.
 */
import type { BlockReason, Court, CourtSection, Reservation, SectionStatus } from "@/types";

const HOUR_MS = 60 * 60 * 1000;

/** Half-open interval overlap: [aStart, aEnd) ∩ [bStart, bEnd) ≠ ∅. */
export function overlaps(
  aStart: string | number,
  aEnd: string | number,
  bStart: string | number,
  bEnd: string | number,
): boolean {
  const a0 = +new Date(aStart);
  const a1 = +new Date(aEnd);
  const b0 = +new Date(bStart);
  const b1 = +new Date(bEnd);
  return a0 < b1 && b0 < a1;
}

/** Reservations on a physical court that still hold the slot (not cancelled). */
export function activeCourtReservations(
  reservations: Reservation[],
  courtId: string,
): Reservation[] {
  return reservations.filter((r) => r.courtId === courtId && r.status !== "cancelled");
}

/** The single-lane availability verdict used by the grid and validator. */
export interface SlotVerdict {
  available: boolean;
  blockedBy?: BlockReason;
  reservationId?: string;
}

/**
 * Evaluate a WHOLE-court lane slot. Unavailable if any whole booking overlaps
 * (`self`) or any section booking overlaps (`section` — sections block the whole).
 */
export function evaluateWholeSlot(
  reservations: Reservation[],
  courtId: string,
  start: string,
  end: string,
  ignoreId?: string,
): SlotVerdict {
  const active = activeCourtReservations(reservations, courtId).filter((r) => r.id !== ignoreId);
  const wholeHit = active.find((r) => r.bookingType === "whole" && overlaps(r.start, r.end, start, end));
  if (wholeHit) return { available: false, blockedBy: "self", reservationId: wholeHit.id };
  const sectionHit = active.find(
    (r) => r.bookingType === "section" && overlaps(r.start, r.end, start, end),
  );
  if (sectionHit) return { available: false, blockedBy: "section", reservationId: sectionHit.id };
  return { available: true };
}

/**
 * Evaluate a SECTION lane slot. Unavailable if that section is booked (`self`)
 * or a whole-court booking overlaps (`whole` — whole overrides sections).
 */
export function evaluateSectionSlot(
  reservations: Reservation[],
  courtId: string,
  sectionId: string,
  start: string,
  end: string,
  ignoreId?: string,
): SlotVerdict {
  const active = activeCourtReservations(reservations, courtId).filter((r) => r.id !== ignoreId);
  const wholeHit = active.find((r) => r.bookingType === "whole" && overlaps(r.start, r.end, start, end));
  if (wholeHit) return { available: false, blockedBy: "whole", reservationId: wholeHit.id };
  const selfHit = active.find(
    (r) => r.sectionId === sectionId && overlaps(r.start, r.end, start, end),
  );
  if (selfHit) return { available: false, blockedBy: "self", reservationId: selfHit.id };
  return { available: true };
}

/** Would booking (court, section?) over [start,end) conflict? Used to validate creates. */
export function hasConflict(
  reservations: Reservation[],
  courtId: string,
  sectionId: string | undefined,
  start: string,
  end: string,
  ignoreId?: string,
): boolean {
  const verdict = sectionId
    ? evaluateSectionSlot(reservations, courtId, sectionId, start, end, ignoreId)
    : evaluateWholeSlot(reservations, courtId, start, end, ignoreId);
  return !verdict.available;
}

/** Status of a section at a reference instant (1-hour window). */
export function sectionStatusAt(
  reservations: Reservation[],
  court: Court,
  section: CourtSection,
  refISO: string,
): SectionStatus {
  const end = new Date(+new Date(refISO) + HOUR_MS).toISOString();
  return evaluateSectionSlot(reservations, court.id, section.id, refISO, end).available
    ? "available"
    : "occupied";
}

/** Status of a whole court at a reference instant (1-hour window). */
export function wholeStatusAt(
  reservations: Reservation[],
  court: Court,
  refISO: string,
): SectionStatus {
  const end = new Date(+new Date(refISO) + HOUR_MS).toISOString();
  return evaluateWholeSlot(reservations, court.id, refISO, end).available ? "available" : "occupied";
}
