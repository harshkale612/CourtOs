import type { PosLineItem, PosPayment, Product } from "@/types";

/**
 * POS money math — one implementation shared by the seed generator, the mock
 * API, the cart store, and the receipt, so totals never disagree.
 * All amounts are CAD; results are rounded to cents.
 */

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Line total before tax, after its line discount: unitPrice·qty − discount. */
export function lineNet(item: Pick<PosLineItem, "unitPrice" | "quantity" | "discount">): number {
  return Math.max(0, item.unitPrice * item.quantity - (item.discount || 0));
}

/** Tax charged on a single line (on the discounted amount). */
export function lineTax(item: Pick<PosLineItem, "unitPrice" | "quantity" | "discount" | "taxRate">): number {
  return lineNet(item) * (item.taxRate || 0);
}

export interface OrderTotals {
  subtotal: number; // Σ unitPrice·qty (pre-discount)
  discountTotal: number; // Σ line discounts
  tax: number; // Σ per-line tax on discounted amounts
  total: number; // subtotal − discountTotal + tax
  itemCount: number; // Σ quantities
}

export function computeTotals(items: PosLineItem[]): OrderTotals {
  let subtotal = 0;
  let discountTotal = 0;
  let tax = 0;
  let itemCount = 0;
  for (const it of items) {
    subtotal += it.unitPrice * it.quantity;
    discountTotal += it.discount || 0;
    tax += lineTax(it);
    itemCount += it.quantity;
  }
  const rSubtotal = round2(subtotal);
  const rDiscount = round2(discountTotal);
  const rTax = round2(tax);
  return {
    subtotal: rSubtotal,
    discountTotal: rDiscount,
    tax: rTax,
    total: round2(rSubtotal - rDiscount + rTax),
    itemCount,
  };
}

/** Sum of tender amounts already applied to an order. */
export function paymentsTotal(payments: PosPayment[]): number {
  return round2(payments.reduce((s, p) => s + (p.amount || 0), 0));
}

/** Live, derived status for a stock-tracked product. */
export function derivedProductStatus(product: Product): Product["status"] {
  if (product.status === "archived") return "archived";
  if (product.trackInventory && product.stock <= 0) return "out_of_stock";
  return "active";
}

/** True when a tracked product is at or below its low-stock threshold (and not empty). */
export function isLowStock(product: Product): boolean {
  return (
    product.trackInventory &&
    product.stock > 0 &&
    product.stock <= product.lowStockThreshold
  );
}

/** Inventory valuation for a single tracked product (at cost). */
export function inventoryValueAt(product: Product): number {
  if (!product.trackInventory) return 0;
  return round2(product.stock * (product.cost ?? 0));
}
