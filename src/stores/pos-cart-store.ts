import { create } from "zustand";
import type { PosLineItem, Product } from "@/types";

/**
 * POS cart — purely client-side draft state for the register. The completed
 * order (server truth) lives in TanStack Query via api.pos.createOrder.
 * Line ids are generated from a module counter (no Date.now/random) so the
 * store is SSR-safe and never causes hydration drift.
 */

let seq = 0;
const nextId = () => `cart_${++seq}`;

interface PosCartState {
  items: PosLineItem[];
  customerId?: string;
  customerName?: string;
  note: string;

  addProduct: (product: Product, qty?: number) => void;
  /** Add a non-retail service line (booking / membership / event / …). */
  addLine: (line: Omit<PosLineItem, "id">) => void;
  setQuantity: (lineId: string, qty: number) => void;
  incQty: (lineId: string) => void;
  decQty: (lineId: string) => void;
  setDiscount: (lineId: string, discount: number) => void;
  setLineNote: (lineId: string, note: string) => void;
  removeItem: (lineId: string) => void;
  setCustomer: (id: string | undefined, name: string | undefined) => void;
  setNote: (note: string) => void;
  clear: () => void;
}

export const usePosCartStore = create<PosCartState>((set) => ({
  items: [],
  customerId: undefined,
  customerName: undefined,
  note: "",

  addProduct: (product, qty = 1) =>
    set((s) => {
      // Merge into an existing clean line for the same product.
      const existing = s.items.find(
        (l) => l.kind === "product" && l.refId === product.id && l.discount === 0 && !l.note,
      );
      if (existing) {
        return {
          items: s.items.map((l) =>
            l.id === existing.id ? { ...l, quantity: l.quantity + qty } : l,
          ),
        };
      }
      const line: PosLineItem = {
        id: nextId(),
        kind: "product",
        refId: product.id,
        name: product.name,
        category: product.category,
        sku: product.sku,
        emoji: product.emoji,
        imageUrl: product.imageUrl,
        unitPrice: product.price,
        quantity: qty,
        taxRate: product.taxRate,
        discount: 0,
      };
      return { items: [...s.items, line] };
    }),

  addLine: (line) => set((s) => ({ items: [...s.items, { ...line, id: nextId() }] })),

  setQuantity: (lineId, qty) =>
    set((s) => ({
      items: s.items.flatMap((l) =>
        l.id === lineId ? (qty <= 0 ? [] : [{ ...l, quantity: qty }]) : [l],
      ),
    })),

  incQty: (lineId) =>
    set((s) => ({
      items: s.items.map((l) => (l.id === lineId ? { ...l, quantity: l.quantity + 1 } : l)),
    })),

  decQty: (lineId) =>
    set((s) => ({
      items: s.items.flatMap((l) =>
        l.id === lineId
          ? l.quantity <= 1
            ? []
            : [{ ...l, quantity: l.quantity - 1 }]
          : [l],
      ),
    })),

  setDiscount: (lineId, discount) =>
    set((s) => ({
      items: s.items.map((l) =>
        l.id === lineId ? { ...l, discount: Math.max(0, discount) } : l,
      ),
    })),

  setLineNote: (lineId, note) =>
    set((s) => ({
      items: s.items.map((l) => (l.id === lineId ? { ...l, note: note || undefined } : l)),
    })),

  removeItem: (lineId) => set((s) => ({ items: s.items.filter((l) => l.id !== lineId) })),

  setCustomer: (id, name) => set({ customerId: id, customerName: name }),
  setNote: (note) => set({ note }),
  clear: () => set({ items: [], customerId: undefined, customerName: undefined, note: "" }),
}));
