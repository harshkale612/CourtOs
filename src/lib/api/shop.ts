import type { PosLineItem, PosOrder, Product } from "@/types";
import { db } from "@/lib/mock/data";
import { SHOP_CATEGORIES } from "@/lib/constants/commerce";
import { computeTotals } from "@/lib/utils/pos";
import { ApiError, notFound, ok } from "./client";
import { placeCommerceOrder, type PickupRequest } from "./pos";

/**
 * Member-facing storefront. Reads the SAME catalog and writes the SAME orders
 * as the staff register (`api.pos`) — only the surface differs: members see
 * shop categories, their own history, and pickup status.
 */

export interface PlaceShopOrderInput {
  userId: string;
  userName: string;
  lineItems: PosLineItem[];
  /** Card reference ("Visa •4242") or club credit — resolved by the caller. */
  payment: { method: "card" | "club_credit"; reference: string };
  pickup: PickupRequest;
  /** Set when the basket rides along with a court booking. */
  reservationId?: string;
  note?: string;
}

/** Items a member can actually buy online: in-catalog, in-stock-tracked, active. */
function shopCatalog(): Product[] {
  return db.products.filter(
    (p) => p.status !== "archived" && SHOP_CATEGORIES.includes(p.category),
  );
}

export interface ReorderResult {
  /** Lines that are still purchasable, re-priced at today's price. */
  lineItems: PosLineItem[];
  /** Names that couldn't be re-added (archived or out of stock). */
  unavailable: string[];
  /** Names whose quantity had to be trimmed to available stock. */
  adjusted: string[];
}

let reorderSeq = 0;

export const shopApi = {
  /* -------------------------------- catalog ------------------------------- */
  products: (): Promise<Product[]> => ok(shopCatalog().map((p) => ({ ...p }))),

  product: (id: string): Promise<Product> => {
    const p = shopCatalog().find((x) => x.id === id);
    return p ? ok({ ...p }) : notFound("Product");
  },

  /** Same-category suggestions for the product detail page. */
  related: (id: string, limit = 4): Promise<Product[]> => {
    const p = db.products.find((x) => x.id === id);
    if (!p) return ok([]);
    return ok(
      shopCatalog()
        .filter((x) => x.id !== p.id && x.category === p.category && x.status === "active")
        .slice(0, limit)
        .map((x) => ({ ...x })),
    );
  },

  /* -------------------------------- orders -------------------------------- */
  /** A member's own purchases — online *and* anything rung up for them at the desk. */
  myOrders: (userId: string): Promise<PosOrder[]> =>
    ok(
      db.posOrders
        .filter((o) => o.customerId === userId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    ),

  myOrder: (userId: string, orderId: string): Promise<PosOrder> => {
    const o = db.posOrders.find((x) => x.id === orderId && x.customerId === userId);
    return o ? ok(o) : notFound("Order");
  },

  /** Orders still to collect — drives the "ready for pickup" nudge in the portal. */
  activePickups: (userId: string): Promise<PosOrder[]> =>
    ok(
      db.posOrders
        .filter(
          (o) =>
            o.customerId === userId &&
            o.status === "completed" &&
            (o.fulfillment?.status === "preparing" || o.fulfillment?.status === "ready"),
        )
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    ),

  /**
   * Rebuild a past basket at today's prices & stock. Never silently drops
   * items — the caller shows exactly what changed.
   */
  reorder: (orderId: string): Promise<ReorderResult> => {
    const order = db.posOrders.find((o) => o.id === orderId);
    if (!order) return notFound("Order");

    const lineItems: PosLineItem[] = [];
    const unavailable: string[] = [];
    const adjusted: string[] = [];

    for (const line of order.lineItems) {
      if (line.kind !== "product" || !line.refId) continue; // services aren't re-orderable online
      const p = db.products.find((x) => x.id === line.refId);
      if (!p || p.status === "archived" || !SHOP_CATEGORIES.includes(p.category)) {
        unavailable.push(line.name);
        continue;
      }
      const available = p.trackInventory ? p.stock : line.quantity;
      if (available <= 0) {
        unavailable.push(p.name);
        continue;
      }
      const quantity = Math.min(line.quantity, available);
      if (quantity < line.quantity) adjusted.push(p.name);
      lineItems.push({
        id: `re_${++reorderSeq}`,
        kind: "product",
        refId: p.id,
        name: p.name,
        category: p.category,
        sku: p.sku,
        emoji: p.emoji,
        imageUrl: p.imageUrl,
        unitPrice: p.price, // today's price, not the historical one
        quantity,
        taxRate: p.taxRate,
        discount: 0,
      });
    }

    if (!lineItems.length) {
      throw new ApiError(409, "Nothing from that order is available right now.");
    }
    return ok({ lineItems, unavailable, adjusted }, 380);
  },

  /* ------------------------------- checkout ------------------------------- */
  /** Member self-checkout — same ledger, same stock rules as the register. */
  placeOrder: (input: PlaceShopOrderInput): Promise<PosOrder> => {
    // Charge exactly what the shared money math says is owed.
    const { total } = computeTotals(input.lineItems);
    return ok(
      placeCommerceOrder({
        channel: "online",
        lineItems: input.lineItems,
        payments: [
          { method: input.payment.method, amount: total, reference: input.payment.reference },
        ],
        cashierId: input.userId,
        cashierName: `${input.userName} · online`,
        customerId: input.userId,
        customerName: input.userName,
        pickup: input.pickup,
        reservationId: input.reservationId,
        note: input.note,
      }),
      520,
    );
  },
};
