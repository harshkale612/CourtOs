import { create } from "zustand";
import type { PickupMethod } from "@/types";
import { createCartItemsSlice, type CartItemsSlice } from "./cart-items-slice";

/**
 * Member Shop basket — the portal-side twin of the register cart.
 * Same line-item mechanics (shared slice), plus how the member wants to collect
 * the order. The basket is client-side draft state; the placed order is server
 * truth via api.shop.placeOrder.
 */

interface ShopCartState extends CartItemsSlice {
  /** Slide-over cart visibility — shared so any page can open the basket. */
  open: boolean;
  pickup: PickupMethod;
  pickupNote: string;
  /** Booking this pickup rides along with, when "after_booking" is chosen. */
  reservationId?: string;

  setOpen: (open: boolean) => void;
  setPickup: (method: PickupMethod, reservationId?: string) => void;
  setPickupNote: (note: string) => void;
  clear: () => void;
}

export const useShopCartStore = create<ShopCartState>((set, get) => ({
  ...createCartItemsSlice(set, get),
  open: false,
  pickup: "reception",
  pickupNote: "",
  reservationId: undefined,

  setOpen: (open) => set({ open }),
  setPickup: (method, reservationId) =>
    set({
      pickup: method,
      // A courtside pickup is meaningless without the booking it follows.
      reservationId: method === "after_booking" ? reservationId : undefined,
    }),
  setPickupNote: (pickupNote) => set({ pickupNote }),
  clear: () =>
    set({
      items: [],
      pickupNote: "",
      pickup: "reception",
      reservationId: undefined,
      open: false,
    }),
}));
