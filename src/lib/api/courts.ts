import type { Court, SectionStatus, SlotAvailability, Sport } from "@/types";
import { db } from "@/lib/mock/data";
import { ANCHOR_DATE, atTime } from "@/lib/mock/prng";
import { evaluateSectionSlot, evaluateWholeSlot, sectionStatusAt } from "@/lib/mock/availability";
import { notFound, ok } from "./client";

/** Reference instant for "live" section status (6 PM prime time on the anchor day). */
const PRIME_REF = atTime(ANCHOR_DATE, 18).toISOString();

export const courtsApi = {
  list: (sport?: Sport) =>
    ok(sport ? db.courts.filter((c) => c.sport === sport) : db.courts),

  get: (id: string): Promise<Court> => {
    const court = db.courts.find((c) => c.id === id);
    return court ? ok(court) : notFound("Court");
  },

  /** Live status of every section (keyed by section id) at prime time. */
  sectionStatuses: (): Promise<Record<string, SectionStatus>> => {
    const out: Record<string, SectionStatus> = {};
    for (const court of db.courts) {
      for (const section of court.sections ?? []) {
        out[section.id] = sectionStatusAt(db.reservations, court, section, PRIME_REF);
      }
    }
    return ok(out);
  },

  /**
   * Hourly availability for every active court of a sport on a date.
   *
   * Returns a FLAT list of slots, one per lane × hour:
   *  - every court contributes a WHOLE-court lane (`bookingType: "whole"`);
   *  - shareable courts additionally contribute one lane per active SECTION.
   *
   * Availability is computed through the shared conflict engine, so a whole
   * booking greys out its sections and a section booking greys out the whole
   * lane — the two-mode rules are visible live in the grid.
   */
  availability: (sport: Sport, dateISO: string): Promise<SlotAvailability[]> => {
    const date = new Date(dateISO);
    const sportCourts = db.courts.filter((c) => c.sport === sport && c.isActive);
    const slots: SlotAvailability[] = [];

    for (const court of sportCourts) {
      const open = parseInt(court.openTime.split(":")[0], 10);
      const close = parseInt(court.closeTime.split(":")[0], 10);

      for (let hour = open; hour < close; hour++) {
        const start = atTime(date, hour).toISOString();
        const end = atTime(date, hour + 1).toISOString();

        // Whole-court lane
        const wholeVerdict = evaluateWholeSlot(db.reservations, court.id, start, end);
        slots.push({
          courtId: court.id,
          bookingType: "whole",
          start,
          end,
          available: wholeVerdict.available,
          price: court.hourlyRate,
          reservationId: wholeVerdict.reservationId,
          blockedBy: wholeVerdict.blockedBy,
        });

        // Section lanes (shareable only)
        for (const section of court.sections ?? []) {
          if (!section.isActive) continue;
          const verdict = evaluateSectionSlot(db.reservations, court.id, section.id, start, end);
          slots.push({
            courtId: court.id,
            sectionId: section.id,
            bookingType: "section",
            start,
            end,
            available: verdict.available,
            price: section.hourlyPrice,
            reservationId: verdict.reservationId,
            blockedBy: verdict.blockedBy,
          });
        }
      }
    }
    return ok(slots);
  },
};
