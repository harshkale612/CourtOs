import { create } from "zustand";
import type { Sport } from "@/types";
import { ANCHOR_DATE } from "@/lib/mock/prng";

/**
 * Booking draft — purely client-side selection state for the live court grid.
 * Server truth (availability, the created reservation) lives in TanStack Query.
 */
export interface SlotSelection {
  courtId: string;
  courtName: string;
  start: string;
  end: string;
  price: number;
}

interface BookingState {
  sport: Sport;
  /** ISO date string (day granularity) currently shown in the grid. */
  dateISO: string;
  selection: SlotSelection | null;
  participants: string[];
  notes: string;

  setSport: (sport: Sport) => void;
  setDate: (dateISO: string) => void;
  selectSlot: (slot: SlotSelection) => void;
  clearSelection: () => void;
  setParticipants: (names: string[]) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const initialDate = ANCHOR_DATE.toISOString();

export const useBookingStore = create<BookingState>((set) => ({
  sport: "tennis",
  dateISO: initialDate,
  selection: null,
  participants: [],
  notes: "",

  setSport: (sport) => set({ sport, selection: null }),
  setDate: (dateISO) => set({ dateISO, selection: null }),
  selectSlot: (selection) => set({ selection }),
  clearSelection: () => set({ selection: null }),
  setParticipants: (participants) => set({ participants }),
  setNotes: (notes) => set({ notes }),
  reset: () =>
    set({ selection: null, participants: [], notes: "", dateISO: initialDate, sport: "tennis" }),
}));
