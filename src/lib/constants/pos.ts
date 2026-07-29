import type {
  PaymentMethodKind,
  PosLineItemKind,
  PosOrderStatus,
  ProductCategory,
  ProductStatus,
} from "@/types";
import type { StatusTone } from "./statuses";

/**
 * Point-of-Sale display metadata & pricing constants.
 * Kept out of components (same idiom as SPORTS / COURT_TYPE / BOOKING_SCOPE)
 * so catalog, register, checkout, and reports all read one source of truth.
 */

/* --------------------------------- Tax ----------------------------------- */
/** Org is Toronto → Ontario HST. Products carry their own rate; this is default. */
export const DEFAULT_TAX_RATE = 0.13;
export const TAX_LABEL = "HST";
export const TAX_REGION = "ON";

/* ----------------------------- Categories -------------------------------- */
export interface ProductCategoryConfig {
  id: ProductCategory;
  label: string;
  /** Compact noun for dense chips. */
  short: string;
  icon: string; // lucide key
  color: string; // hex — tile gradient + chart accent
  emoji: string; // fallback tile flair
}

export const PRODUCT_CATEGORIES: Record<ProductCategory, ProductCategoryConfig> = {
  beverages: { id: "beverages", label: "Beverages", short: "Drinks", icon: "cup-soda", color: "#06b6d4", emoji: "🥤" },
  snacks: { id: "snacks", label: "Snacks", short: "Snacks", icon: "cookie", color: "#f59e0b", emoji: "🍫" },
  equipment: { id: "equipment", label: "Equipment", short: "Gear", icon: "dumbbell", color: "#3b82f6", emoji: "🎾" },
  apparel: { id: "apparel", label: "Apparel", short: "Apparel", icon: "shirt", color: "#8b5cf6", emoji: "👕" },
  merch: { id: "merch", label: "Merch", short: "Merch", icon: "gift", color: "#ec4899", emoji: "🧢" },
  coaching: { id: "coaching", label: "Coaching", short: "Coaching", icon: "graduation-cap", color: "#10b981", emoji: "🎓" },
  passes: { id: "passes", label: "Guest Passes", short: "Passes", icon: "ticket", color: "#6366f1", emoji: "🎟️" },
};

export const CATEGORY_LIST: ProductCategoryConfig[] = Object.values(PRODUCT_CATEGORIES);

/** Physical/retail categories shown as tiles on the register. */
export const RETAIL_CATEGORIES: ProductCategory[] = [
  "beverages",
  "snacks",
  "equipment",
  "apparel",
  "merch",
];

export const RETAIL_CATEGORY_LIST: ProductCategoryConfig[] = RETAIL_CATEGORIES.map(
  (c) => PRODUCT_CATEGORIES[c],
);

export function categoryConfig(id: ProductCategory): ProductCategoryConfig {
  return PRODUCT_CATEGORIES[id];
}

/* ---------------------------- Product status ----------------------------- */
export const PRODUCT_STATUS: Record<ProductStatus, { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "success" },
  archived: { label: "Archived", tone: "neutral" },
  out_of_stock: { label: "Out of stock", tone: "danger" },
};

/* ---------------------------- Payment methods ---------------------------- */
export interface PaymentMethodConfig {
  id: PaymentMethodKind;
  label: string;
  icon: string;
  color: string;
}

export const POS_PAYMENT_METHODS: Record<PaymentMethodKind, PaymentMethodConfig> = {
  cash: { id: "cash", label: "Cash", icon: "banknote", color: "#10b981" },
  card: { id: "card", label: "Card", icon: "credit-card", color: "#3b82f6" },
  club_credit: { id: "club_credit", label: "Club Credit", icon: "wallet", color: "#8b5cf6" },
};

export const PAYMENT_METHOD_LIST: PaymentMethodConfig[] = Object.values(POS_PAYMENT_METHODS);

/* ---------------------------- Line-item kinds ---------------------------- */
/** Non-retail services that can be sold on the same order as products. */
export interface LineItemKindConfig {
  id: PosLineItemKind;
  label: string;
  icon: string;
  color: string;
}

export const LINE_ITEM_KINDS: Record<PosLineItemKind, LineItemKindConfig> = {
  product: { id: "product", label: "Retail", icon: "shopping-bag", color: "#ec4899" },
  booking: { id: "booking", label: "Court Booking", icon: "calendar-check", color: "#3b82f6" },
  membership: { id: "membership", label: "Membership", icon: "badge-check", color: "#8b5cf6" },
  event: { id: "event", label: "Event", icon: "trophy", color: "#f59e0b" },
  coaching: { id: "coaching", label: "Coaching", icon: "graduation-cap", color: "#10b981" },
  guest_pass: { id: "guest_pass", label: "Guest Pass", icon: "ticket", color: "#06b6d4" },
};

/** The service kinds addable via the register's "Add service" flow. */
export const SERVICE_KINDS: PosLineItemKind[] = ["booking", "membership", "event", "coaching", "guest_pass"];

/* ----------------------------- Order status ------------------------------ */
export const ORDER_STATUS: Record<PosOrderStatus, { label: string; tone: StatusTone }> = {
  completed: { label: "Completed", tone: "success" },
  refunded: { label: "Refunded", tone: "info" },
  void: { label: "Void", tone: "neutral" },
};

/* --------------------------- Stock-adjust reasons ------------------------ */
export const STOCK_REASONS: { id: string; label: string; icon: string }[] = [
  { id: "restock", label: "Restock", icon: "package-open" },
  { id: "correction", label: "Correction", icon: "pencil" },
  { id: "damage", label: "Damage / loss", icon: "triangle-alert" },
  { id: "return", label: "Customer return", icon: "arrow-right" },
];
