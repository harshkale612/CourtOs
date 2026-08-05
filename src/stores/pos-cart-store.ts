import { create } from "zustand";
import { createCartItemsSlice, type CartItemsSlice } from "./cart-items-slice";

/**
 * POS cart — purely client-side draft state for the register. The completed
 * order (server truth) lives in TanStack Query via api.pos.createOrder.
 * Line-item mechanics come from the shared cart slice, so the register and the
 * member Shop basket behave identically.
 */

interface PosCartState extends CartItemsSlice {
  customerId?: string;
  customerName?: string;
  note: string;

  setCustomer: (id: string | undefined, name: string | undefined) => void;
  setNote: (note: string) => void;
  clear: () => void;
}

export const usePosCartStore = create<PosCartState>((set, get) => {
  return {
    ...createCartItemsSlice(set, get),
    customerId: undefined,
    customerName: undefined,
    note: "",

    setCustomer: (id, name) => set({ customerId: id, customerName: name }),
    setNote: (note) => set({ note }),
    clear: () => set({ items: [], customerId: undefined, customerName: undefined, note: "" }),
  };
});
