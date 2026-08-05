import type { PosLineItem, Product } from "@/types";

/**
 * The line-item mechanics every cart shares — the staff register and the member
 * Shop basket both compose this slice, so quantity/merge/discount behaviour can
 * never drift between channels.
 *
 * Line ids come from a module counter (no Date.now/random) so carts are
 * SSR-safe and never cause hydration drift.
 */

let seq = 0;
const nextId = () => `cart_${++seq}`;

export interface CartItemsSlice {
  items: PosLineItem[];

  /** Add a retail product, merging into an existing clean line when possible. */
  addProduct: (product: Product, qty?: number) => void;
  /** Add a non-retail service line (booking / membership / event / …). */
  addLine: (line: Omit<PosLineItem, "id">) => void;
  /** Replace the whole basket (reorder, booking hand-off). */
  setItems: (items: Omit<PosLineItem, "id">[]) => void;
  setQuantity: (lineId: string, qty: number) => void;
  incQty: (lineId: string) => void;
  decQty: (lineId: string) => void;
  setDiscount: (lineId: string, discount: number) => void;
  setLineNote: (lineId: string, note: string) => void;
  removeItem: (lineId: string) => void;
  /** Quantity of a product across the cart — powers "in cart" affordances. */
  quantityOf: (productId: string) => number;
  clearItems: () => void;
}

/** Only the `items` field is written here, so any composing store's `set` fits. */
type SetItems = (
  partial: { items: PosLineItem[] } | ((state: CartItemsSlice) => { items: PosLineItem[] }),
) => void;

/**
 * Composed by each cart store, which layers on its own state (customer & tender
 * for the register, pickup & booking link for the Shop).
 */
export const createCartItemsSlice = (
  set: SetItems,
  get: () => CartItemsSlice,
): CartItemsSlice => {
  return {
    items: [],

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

    setItems: (items) => set({ items: items.map((l) => ({ ...l, id: nextId() })) }),

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
          l.id === lineId ? (l.quantity <= 1 ? [] : [{ ...l, quantity: l.quantity - 1 }]) : [l],
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

    quantityOf: (productId) =>
      get()
        .items.filter((l) => l.kind === "product" && l.refId === productId)
        .reduce((sum, l) => sum + l.quantity, 0),

    clearItems: () => set({ items: [] }),
  };
};
