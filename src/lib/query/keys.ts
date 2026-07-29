import type { Sport } from "@/types";

/** Centralized query keys — the contract for cache invalidation. */
export const queryKeys = {
  courts: {
    all: ["courts"] as const,
    list: (sport?: Sport) => ["courts", "list", sport ?? "all"] as const,
    detail: (id: string) => ["courts", "detail", id] as const,
    sectionStatuses: ["courts", "section-statuses"] as const,
    availability: (sport: Sport, dateISO: string) =>
      ["courts", "availability", sport, dateISO] as const,
  },
  reservations: {
    all: ["reservations"] as const,
    forUser: (userId: string) => ["reservations", "user", userId] as const,
    byDate: (dateISO: string) => ["reservations", "date", dateISO] as const,
    detail: (id: string) => ["reservations", "detail", id] as const,
  },
  members: {
    list: (page: number, query: string) => ["members", "list", page, query] as const,
    detail: (id: string) => ["members", "detail", id] as const,
    membership: (userId: string) => ["members", "membership", userId] as const,
  },
  coaches: { list: (sport?: Sport) => ["coaches", "list", sport ?? "all"] as const },
  events: {
    list: (sport?: Sport) => ["events", "list", sport ?? "all"] as const,
    detail: (id: string) => ["events", "detail", id] as const,
    registrations: (userId: string) => ["events", "registrations", userId] as const,
  },
  plans: { list: ["plans", "list"] as const },
  payments: {
    methods: (userId: string) => ["payments", "methods", userId] as const,
    invoices: (userId: string) => ["payments", "invoices", userId] as const,
    transactions: (userId?: string) => ["payments", "transactions", userId ?? "all"] as const,
  },
  notifications: {
    list: (userId: string) => ["notifications", "list", userId] as const,
    unread: (userId: string) => ["notifications", "unread", userId] as const,
  },
  pos: {
    products: ["pos", "products"] as const,
    product: (id: string) => ["pos", "product", id] as const,
    lowStock: ["pos", "low-stock"] as const,
    orders: (dateISO?: string, limit?: number) =>
      ["pos", "orders", dateISO ?? "all", limit ?? 0] as const,
    order: (id: string) => ["pos", "order", id] as const,
    stockAdjustments: (productId?: string) =>
      ["pos", "stock-adjustments", productId ?? "all"] as const,
    creditBalance: (userId?: string) => ["pos", "credit", userId ?? "none"] as const,
    kpis: ["pos", "kpis"] as const,
    summary: ["pos", "summary"] as const,
    salesSeries: (days: number) => ["pos", "sales-series", days] as const,
    bestSellers: (limit: number) => ["pos", "best-sellers", limit] as const,
    revenueByCategory: ["pos", "revenue-by-category"] as const,
    inventoryValue: ["pos", "inventory-value"] as const,
  },
  analytics: {
    kpis: ["analytics", "kpis"] as const,
    facility: ["analytics", "facility"] as const,
    revenue: ["analytics", "revenue"] as const,
    heatmap: ["analytics", "heatmap"] as const,
    sports: ["analytics", "sports"] as const,
    bookingTypes: ["analytics", "booking-types"] as const,
    revenueByCourt: ["analytics", "revenue-by-court"] as const,
    revenueBySection: ["analytics", "revenue-by-section"] as const,
    sectionUtil: ["analytics", "section-util"] as const,
    courtUtil: ["analytics", "court-util"] as const,
  },
} as const;
