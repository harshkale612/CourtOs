import type { Court, SlotAvailability, Sport } from "@/types";
import { db } from "@/lib/mock/data";
import { atTime } from "@/lib/mock/prng";
import { notFound, ok } from "./client";

export const courtsApi = {
  list: (sport?: Sport) =>
    ok(sport ? db.courts.filter((c) => c.sport === sport) : db.courts),

  get: (id: string): Promise<Court> => {
    const court = db.courts.find((c) => c.id === id);
    return court ? ok(court) : notFound("Court");
  },

  /**
   * Hourly availability grid for every active court of a sport on a date.
   * Rows = courts, columns = hours (open→close). Drives the booking canvas.
   */
  availability: (sport: Sport, dateISO: string): Promise<SlotAvailability[]> => {
    const date = new Date(dateISO);
    const sportCourts = db.courts.filter((c) => c.sport === sport && c.isActive);
    const slots: SlotAvailability[] = [];

    for (const court of sportCourts) {
      const open = parseInt(court.openTime.split(":")[0], 10);
      const close = parseInt(court.closeTime.split(":")[0], 10);
      for (let hour = open; hour < close; hour++) {
        const start = atTime(date, hour);
        const end = atTime(date, hour + 1);
        const taken = db.reservations.find(
          (r) =>
            r.courtId === court.id &&
            r.status !== "cancelled" &&
            new Date(r.start).getTime() === start.getTime(),
        );
        slots.push({
          courtId: court.id,
          start: start.toISOString(),
          end: end.toISOString(),
          available: !taken,
          price: court.hourlyRate,
          reservationId: taken?.id,
        });
      }
    }
    return ok(slots);
  },
};
