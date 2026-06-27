import type { EventRegistration, Sport } from "@/types";
import { db } from "@/lib/mock/data";
import { notFound, ok } from "./client";

let regCounter = 9000;

export const eventsApi = {
  list: (sport?: Sport) =>
    ok(
      (sport ? db.events.filter((e) => e.sport === sport) : db.events).sort(
        (a, b) => +new Date(a.start) - +new Date(b.start),
      ),
    ),

  get: (id: string) => {
    const e = db.events.find((x) => x.id === id);
    return e ? ok(e) : notFound("Event");
  },

  registrationsFor: (userId: string) =>
    ok(db.eventRegistrations.filter((r) => r.userId === userId)),

  register: (eventId: string, userId: string): Promise<EventRegistration> => {
    const event = db.events.find((e) => e.id === eventId);
    if (!event) return notFound("Event");
    const reg: EventRegistration = {
      id: `reg_${++regCounter}`,
      eventId,
      userId,
      status: event.registeredCount < event.capacity ? "registered" : "waitlisted",
      registeredAt: new Date().toISOString(),
    };
    if (reg.status === "registered") event.registeredCount += 1;
    db.eventRegistrations.push(reg);
    return ok(reg, 420);
  },
};
