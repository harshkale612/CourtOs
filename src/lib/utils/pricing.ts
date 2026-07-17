/**
 * Pricing accessors — the single, named surface for court/section prices.
 *
 * `Court.hourlyRate` is always "the price to book the entire physical court".
 * These helpers give that concept an explicit name (`wholeCourtPrice`) and
 * resolve the correct price for a booking regardless of its scope, so the
 * booking summary, mock generator, and analytics never disagree.
 */
import type { Court, CourtSection } from "@/types";

/** Price to book the ENTIRE physical court for one hour. */
export function wholeCourtPrice(court: Court): number {
  return court.hourlyRate;
}

/** Price to book a single section for one hour. */
export function sectionPrice(section: CourtSection): number {
  return section.hourlyPrice;
}

/** Resolve the correct hourly price for a booking (whole court or a section). */
export function resolvePrice(court: Court, sectionId?: string): number {
  if (!sectionId) return wholeCourtPrice(court);
  const section = court.sections?.find((s) => s.id === sectionId);
  return section ? sectionPrice(section) : wholeCourtPrice(court);
}

/** Active sections of a shareable court (empty for whole courts). */
export function activeSections(court: Court): CourtSection[] {
  return (court.sections ?? []).filter((s) => s.isActive);
}

/**
 * Price envelope for a court card:
 * - whole court → { from: rate }
 * - shareable   → { from: cheapest section, to: whole-court price }
 */
export function priceRange(court: Court): { from: number; to?: number } {
  if (court.type === "whole" || !court.sections?.length) {
    return { from: court.hourlyRate };
  }
  const sectionPrices = court.sections.map((s) => s.hourlyPrice);
  return { from: Math.min(...sectionPrices), to: court.hourlyRate };
}
