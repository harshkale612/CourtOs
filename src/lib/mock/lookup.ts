import { db } from "./data";
import type { Court } from "@/types";

/** Static lookups over the deterministic mock DB (safe on client & server). */
const courtMap = new Map<string, Court>(db.courts.map((c) => [c.id, c]));

export function getCourt(id: string): Court | undefined {
  return courtMap.get(id);
}

export function courtName(id: string): string {
  return courtMap.get(id)?.name ?? "Court";
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
