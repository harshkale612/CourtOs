import { db } from "./data";
import type { Court, CourtSection, Reservation } from "@/types";

/** Static lookups over the deterministic mock DB (safe on client & server). */
const courtMap = new Map<string, Court>(db.courts.map((c) => [c.id, c]));

export function getCourt(id: string): Court | undefined {
  return courtMap.get(id);
}

export function courtName(id: string): string {
  return courtMap.get(id)?.name ?? "Court";
}

/* ---- Sections ---- */
interface SectionRef {
  section: CourtSection;
  court: Court;
}
const sectionMap = new Map<string, SectionRef>(
  db.courts.flatMap((c) => (c.sections ?? []).map((s) => [s.id, { section: s, court: c }] as const)),
);

export function getSection(id: string): CourtSection | undefined {
  return sectionMap.get(id)?.section;
}

export function getSectionRef(id: string): SectionRef | undefined {
  return sectionMap.get(id);
}

export function sectionName(id: string): string {
  return sectionMap.get(id)?.section.name ?? "Section";
}

/**
 * Human label for what a reservation booked:
 * whole  → "Court A"
 * section→ "Court A · Section B"
 */
export function reservationCourtLabel(reservation: Reservation): string {
  const court = courtName(reservation.courtId);
  if (reservation.sectionId) return `${court} · ${sectionName(reservation.sectionId)}`;
  return court;
}

const coachMap = new Map(db.coaches.map((c) => [c.id, c]));

export function coachName(id?: string): string | undefined {
  return id ? coachMap.get(id)?.name : undefined;
}

const memberMap = new Map(db.members.map((m) => [m.id, m]));

export function memberName(id: string): string {
  return memberMap.get(id)?.name ?? "Member";
}

export function memberById(id: string) {
  return memberMap.get(id);
}
