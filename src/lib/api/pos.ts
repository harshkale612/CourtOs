import { format } from "date-fns";
import type {
  PosLineItem,
  PosOrder,
  PosPayment,
  Product,
  ProductCategory,
  StockAdjustment,
  StockAdjustmentReason,
} from "@/types";
import { db } from "@/lib/mock/data";
import { ANCHOR_DATE, addDays } from "@/lib/mock/prng";
import { PRODUCT_CATEGORIES } from "@/lib/constants/pos";
import {
  computeTotals,
  derivedProductStatus,
  inventoryValueAt,
  paymentsTotal,
  round2,
} from "@/lib/utils/pos";
import { ApiError, notFound, ok } from "./client";

/* ------------------------------- report shapes --------------------------- */
export interface PosKpi {
  key: string;
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  delta: number;
  accent: string;
  icon: string;
}

export interface SalesSummary {
  revenueToday: number;
  ordersToday: number;
  productsSoldToday: number;
  revenueWeek: number;
  ordersWeek: number;
  retailRevenue: number; // product-line revenue, period (pre-tax)
  serviceRevenue: number; // non-retail line revenue, period (pre-tax)
  avgOrderValue: number; // period AOV (gross)
  lowStockCount: number;
  inventoryValue: number;
}

export interface SalesPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface BestSeller {
  productId: string;
  name: string;
  emoji?: string;
  category: ProductCategory;
  quantity: number;
  revenue: number;
}

export interface CategoryRevenue {
  category: ProductCategory;
  label: string;
  color: string;
  revenue: number;
  quantity: number;
}

export interface InventoryValue {
  total: number;
  unitsInStock: number;
  skus: number;
  byCategory: { category: ProductCategory; label: string; color: string; value: number }[];
}

export interface CreateOrderInput {
  lineItems: PosLineItem[];
  payments: PosPayment[];
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  note?: string;
}

/* ------------------------------- helpers --------------------------------- */
const PERIOD_DAYS = 30;
const onAnchorDay = (iso: string) => new Date(iso).toDateString() === ANCHOR_DATE.toDateString();
const periodStart = addDays(ANCHOR_DATE, -PERIOD_DAYS);
const weekStart = addDays(ANCHOR_DATE, -6);

const completedOrders = () => db.posOrders.filter((o) => o.status === "completed");
const inWindow = (iso: string, from: Date) => {
  const t = +new Date(iso);
  return t >= +from && t <= +ANCHOR_DATE + 24 * 3600 * 1000;
};

function productLines(orders: PosOrder[]): PosLineItem[] {
  return orders.flatMap((o) => o.lineItems.filter((l) => l.kind === "product"));
}

/** Refresh a product's derived status after a stock change. */
function syncStatus(p: Product) {
  p.status = derivedProductStatus(p);
}

let runtimeOrders = 0;
let runtimeAdj = 0;
let runtimeProduct = 0;

export const posApi = {
  /* --------------------------------- catalog ----------------------------- */
  products: (): Promise<Product[]> => ok(db.products.map((p) => ({ ...p }))),

  product: (id: string): Promise<Product> => {
    const p = db.products.find((x) => x.id === id);
    return p ? ok({ ...p }) : notFound("Product");
  },

  createProduct: (input: Omit<Product, "id" | "orgId" | "status"> & { status?: Product["status"] }): Promise<Product> => {
    const product: Product = {
      ...input,
      id: `prod_new_${++runtimeProduct}`,
      orgId: db.org.id,
      status: "active",
    };
    syncStatus(product);
    db.products.push(product);
    return ok({ ...product }, 360);
  },

  updateProduct: (id: string, patch: Partial<Product>): Promise<Product> => {
    const p = db.products.find((x) => x.id === id);
    if (!p) return notFound("Product");
    Object.assign(p, patch);
    if (patch.status !== "archived") syncStatus(p);
    return ok({ ...p }, 320);
  },

  /* ------------------------------- inventory ----------------------------- */
  adjustStock: (input: {
    productId: string;
    delta: number;
    reason: StockAdjustmentReason;
    note?: string;
    by: string;
  }): Promise<Product> => {
    const p = db.products.find((x) => x.id === input.productId);
    if (!p) return notFound("Product");
    if (p.stock + input.delta < 0) {
      throw new ApiError(409, "That adjustment would drop stock below zero.");
    }
    p.stock += input.delta;
    syncStatus(p);
    const adj: StockAdjustment = {
      id: `adj_new_${++runtimeAdj}`,
      productId: p.id,
      delta: input.delta,
      reason: input.reason,
      note: input.note,
      by: input.by,
      createdAt: ANCHOR_DATE.toISOString(),
    };
    db.stockAdjustments.unshift(adj);
    return ok({ ...p }, 320);
  },

  stockAdjustments: (productId?: string): Promise<StockAdjustment[]> =>
    ok(
      (productId
        ? db.stockAdjustments.filter((a) => a.productId === productId)
        : db.stockAdjustments
      ).slice(0, 60),
    ),

  lowStock: (): Promise<Product[]> =>
    ok(
      db.products
        .filter((p) => p.trackInventory && p.status !== "archived" && p.stock <= p.lowStockThreshold)
        .sort((a, b) => a.stock - b.stock)
        .map((p) => ({ ...p })),
    ),

  /* --------------------------------- orders ------------------------------ */
  orders: (opts?: { limit?: number; dateISO?: string }): Promise<PosOrder[]> => {
    let rows = db.posOrders;
    if (opts?.dateISO) {
      const day = new Date(opts.dateISO).toDateString();
      rows = rows.filter((o) => new Date(o.createdAt).toDateString() === day);
    }
    const sorted = [...rows].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return ok(opts?.limit ? sorted.slice(0, opts.limit) : sorted);
  },

  order: (id: string): Promise<PosOrder> => {
    const o = db.posOrders.find((x) => x.id === id);
    return o ? ok(o) : notFound("Order");
  },

  creditBalance: (userId?: string): Promise<number> =>
    ok(userId ? db.clubCredit[userId] ?? 0 : 0),

  /** Checkout — the core POS mutation. Deducts stock, records the sale, and
   *  folds a Transaction into the shared ledger. */
  createOrder: (input: CreateOrderInput): Promise<PosOrder> => {
    if (!input.lineItems.length) throw new ApiError(400, "Cart is empty.");

    const totals = computeTotals(input.lineItems);
    const tendered = paymentsTotal(input.payments);
    if (tendered + 0.01 < totals.total) {
      throw new ApiError(402, "Payment doesn't cover the order total.");
    }

    // Club credit must be attached to a member and can't exceed their balance.
    const creditPay = input.payments.filter((p) => p.method === "club_credit");
    const creditAmount = round2(creditPay.reduce((s, p) => s + p.amount, 0));
    if (creditAmount > 0) {
      if (!input.customerId) throw new ApiError(409, "Attach a member to pay with club credit.");
      const balance = db.clubCredit[input.customerId] ?? 0;
      if (creditAmount > balance + 0.01) throw new ApiError(409, "Insufficient club credit.");
    }

    // Validate stock for tracked products before mutating anything.
    for (const line of input.lineItems) {
      if (line.kind !== "product" || !line.refId) continue;
      const p = db.products.find((x) => x.id === line.refId);
      if (p?.trackInventory && p.stock < line.quantity) {
        throw new ApiError(409, `Not enough stock for ${p.name} (${p.stock} left).`);
      }
    }

    // Commit: deduct stock, log sale adjustments.
    for (const line of input.lineItems) {
      if (line.kind !== "product" || !line.refId) continue;
      const p = db.products.find((x) => x.id === line.refId);
      if (!p || !p.trackInventory) continue;
      p.stock -= line.quantity;
      syncStatus(p);
      db.stockAdjustments.unshift({
        id: `adj_new_${++runtimeAdj}`,
        productId: p.id,
        delta: -line.quantity,
        reason: "sale",
        note: `Sold on POS`,
        by: input.cashierName,
        createdAt: ANCHOR_DATE.toISOString(),
      });
    }

    if (creditAmount > 0 && input.customerId) {
      db.clubCredit[input.customerId] = round2((db.clubCredit[input.customerId] ?? 0) - creditAmount);
    }

    const order: PosOrder = {
      id: `pos_new_${++runtimeOrders}`,
      orgId: db.org.id,
      number: `POS-${5000 + runtimeOrders}`,
      cashierId: input.cashierId,
      cashierName: input.cashierName,
      customerId: input.customerId,
      customerName: input.customerName ?? "Walk-in",
      lineItems: input.lineItems,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      tax: totals.tax,
      total: totals.total,
      payments: input.payments,
      status: "completed",
      createdAt: ANCHOR_DATE.toISOString(),
      note: input.note,
    };
    db.posOrders.unshift(order);
    db.transactions.unshift({
      id: `txn_${order.id}`,
      orgId: db.org.id,
      userId: input.customerId ?? db.currentUser.id,
      amount: order.total,
      type: "pos",
      status: "paid",
      method: order.payments.length > 1 ? "Split payment" : (order.payments[0]?.reference ?? "Card"),
      createdAt: order.createdAt,
    });
    return ok(order, 480);
  },

  /* --------------------------------- reports ----------------------------- */
  salesSummary: (): Promise<SalesSummary> => {
    const completed = completedOrders();
    const today = completed.filter((o) => onAnchorDay(o.createdAt));
    const week = completed.filter((o) => inWindow(o.createdAt, weekStart));
    const period = completed.filter((o) => inWindow(o.createdAt, periodStart));

    const revenueToday = round2(today.reduce((s, o) => s + o.total, 0));
    const productsSoldToday = productLines(today).reduce((s, l) => s + l.quantity, 0);
    const revenueWeek = round2(week.reduce((s, o) => s + o.total, 0));

    const retailRevenue = round2(
      productLines(period).reduce((s, l) => s + (l.unitPrice * l.quantity - l.discount), 0),
    );
    const serviceRevenue = round2(
      period
        .flatMap((o) => o.lineItems.filter((l) => l.kind !== "product"))
        .reduce((s, l) => s + (l.unitPrice * l.quantity - l.discount), 0),
    );
    const avgOrderValue = period.length ? round2(period.reduce((s, o) => s + o.total, 0) / period.length) : 0;

    const tracked = db.products.filter((p) => p.trackInventory && p.status !== "archived");
    const lowStockCount = tracked.filter((p) => p.stock <= p.lowStockThreshold).length;
    const inventoryValue = round2(db.products.reduce((s, p) => s + inventoryValueAt(p), 0));

    return ok({
      revenueToday,
      ordersToday: today.length,
      productsSoldToday,
      revenueWeek,
      ordersWeek: week.length,
      retailRevenue,
      serviceRevenue,
      avgOrderValue,
      lowStockCount,
      inventoryValue,
    });
  },

  posKpis: (): Promise<PosKpi[]> => {
    const completed = completedOrders();
    const today = completed.filter((o) => onAnchorDay(o.createdAt));
    const period = completed.filter((o) => inWindow(o.createdAt, periodStart));
    const revenueToday = round2(today.reduce((s, o) => s + o.total, 0));
    const productsSoldToday = productLines(today).reduce((s, l) => s + l.quantity, 0);
    const retailRevenue = round2(
      productLines(period).reduce((s, l) => s + (l.unitPrice * l.quantity - l.discount), 0),
    );
    const aov = period.length ? round2(period.reduce((s, o) => s + o.total, 0) / period.length) : 0;
    const tracked = db.products.filter((p) => p.trackInventory && p.status !== "archived");
    const lowStock = tracked.filter((p) => p.stock <= p.lowStockThreshold).length;

    return ok([
      { key: "posRevenueToday", label: "POS revenue today", value: revenueToday, format: "currency", delta: 14.2, accent: "var(--accent-emerald)", icon: "banknote" },
      { key: "productsSoldToday", label: "Products sold today", value: productsSoldToday, format: "number", delta: 9.6, accent: "var(--accent-cyan)", icon: "shopping-bag" },
      { key: "retailRevenue", label: "Retail revenue (30d)", value: retailRevenue, format: "currency", delta: 11.3, accent: "var(--accent-blue)", icon: "store" },
      { key: "avgOrderValue", label: "Avg. order value", value: aov, format: "currency", delta: 3.4, accent: "var(--accent-purple)", icon: "receipt" },
      { key: "lowStock", label: "Low-stock products", value: lowStock, format: "number", delta: lowStock > 3 ? 6.5 : -2.1, accent: "var(--accent-orange)", icon: "triangle-alert" },
      { key: "ordersToday", label: "Orders today", value: today.length, format: "number", delta: 7.8, accent: "var(--accent-pink)", icon: "shopping-cart" },
    ]);
  },

  /** Daily sales for the last `days` days (oldest → newest). */
  salesSeries: (days = 14): Promise<SalesPoint[]> => {
    const completed = completedOrders();
    const out: SalesPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = addDays(ANCHOR_DATE, -i);
      const key = date.toDateString();
      const rows = completed.filter((o) => new Date(o.createdAt).toDateString() === key);
      out.push({
        label: format(date, "MMM d"),
        revenue: round2(rows.reduce((s, o) => s + o.total, 0)),
        orders: rows.length,
      });
    }
    return ok(out);
  },

  bestSellers: (limit = 8): Promise<BestSeller[]> => {
    const agg = new Map<string, BestSeller>();
    for (const l of productLines(completedOrders())) {
      if (!l.refId) continue;
      const cur = agg.get(l.refId) ?? {
        productId: l.refId,
        name: l.name,
        emoji: l.emoji,
        category: (l.category ?? "merch") as ProductCategory,
        quantity: 0,
        revenue: 0,
      };
      cur.quantity += l.quantity;
      cur.revenue = round2(cur.revenue + (l.unitPrice * l.quantity - l.discount));
      agg.set(l.refId, cur);
    }
    return ok([...agg.values()].sort((a, b) => b.quantity - a.quantity).slice(0, limit));
  },

  revenueByCategory: (): Promise<CategoryRevenue[]> => {
    const agg = new Map<ProductCategory, CategoryRevenue>();
    for (const l of productLines(completedOrders())) {
      const cat = (l.category ?? "merch") as ProductCategory;
      const cfg = PRODUCT_CATEGORIES[cat];
      const cur = agg.get(cat) ?? { category: cat, label: cfg.label, color: cfg.color, revenue: 0, quantity: 0 };
      cur.revenue = round2(cur.revenue + (l.unitPrice * l.quantity - l.discount));
      cur.quantity += l.quantity;
      agg.set(cat, cur);
    }
    return ok([...agg.values()].sort((a, b) => b.revenue - a.revenue));
  },

  inventoryValue: (): Promise<InventoryValue> => {
    const tracked = db.products.filter((p) => p.trackInventory && p.status !== "archived");
    const byCat = new Map<ProductCategory, number>();
    let unitsInStock = 0;
    for (const p of tracked) {
      byCat.set(p.category, round2((byCat.get(p.category) ?? 0) + inventoryValueAt(p)));
      unitsInStock += p.stock;
    }
    const byCategory = [...byCat.entries()]
      .map(([category, value]) => ({
        category,
        label: PRODUCT_CATEGORIES[category].label,
        color: PRODUCT_CATEGORIES[category].color,
        value,
      }))
      .sort((a, b) => b.value - a.value);
    return ok({
      total: round2(byCategory.reduce((s, c) => s + c.value, 0)),
      unitsInStock,
      skus: tracked.length,
      byCategory,
    });
  },

  anchorDate: () => ok(ANCHOR_DATE.toISOString()),
};
