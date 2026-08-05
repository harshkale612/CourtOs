import type {
  FulfillmentStatus,
  OrderChannel,
  PickupMethod,
  ProductCategory,
} from "@/types";
import type { StatusTone } from "./statuses";
import { PRODUCT_CATEGORIES, type ProductCategoryConfig } from "./pos";

/**
 * Commerce display metadata shared by BOTH sales channels — the staff register
 * and the member Shop. Anything that describes *where* an order came from or
 * *how* it reaches the customer lives here; product/tax/tender metadata stays
 * in `constants/pos.ts`.
 */

/* ------------------------------- Channels -------------------------------- */
export interface OrderChannelConfig {
  id: OrderChannel;
  label: string;
  /** Compact label for dense tables & chips. */
  short: string;
  icon: string;
  color: string;
  description: string;
}

export const ORDER_CHANNELS: Record<OrderChannel, OrderChannelConfig> = {
  pos: {
    id: "pos",
    label: "POS order",
    short: "POS",
    icon: "store",
    color: "#f59e0b",
    description: "Rung up at the front desk",
  },
  online: {
    id: "online",
    label: "Online shop order",
    short: "Online",
    icon: "shopping-bag",
    color: "#6366f1",
    description: "Placed by a member in the portal",
  },
};

export const ORDER_CHANNEL_LIST: OrderChannelConfig[] = Object.values(ORDER_CHANNELS);

/* ------------------------------ Pickup modes ------------------------------ */
export interface PickupMethodConfig {
  id: PickupMethod;
  label: string;
  /** Where staff stage the order — printed on the receipt & shown to members. */
  location: string;
  blurb: string;
  icon: string;
  color: string;
  /** Typical wait before the order is staged, in minutes (demo copy). */
  prepMinutes: number;
}

export const PICKUP_METHODS: Record<PickupMethod, PickupMethodConfig> = {
  reception: {
    id: "reception",
    label: "Pickup at Reception",
    location: "Reception desk · main lobby",
    blurb: "Grab it on your way in — we'll hold it at the front desk.",
    icon: "concierge-bell",
    color: "#3b82f6",
    prepMinutes: 15,
  },
  pro_shop: {
    id: "pro_shop",
    label: "Pickup at Pro Shop",
    location: "Pro Shop · court level",
    blurb: "Collect from the Pro Shop counter, open daily 7am–10pm.",
    icon: "store",
    color: "#8b5cf6",
    prepMinutes: 30,
  },
  after_booking: {
    id: "after_booking",
    label: "Pickup after booking",
    location: "Court side · after your session",
    blurb: "We'll have it courtside when your session wraps up.",
    icon: "calendar-check",
    color: "#10b981",
    prepMinutes: 0,
  },
};

export const PICKUP_METHOD_LIST: PickupMethodConfig[] = Object.values(PICKUP_METHODS);

/** Pickup options a member can choose in the Shop (booking pickup needs a booking). */
export const SHOP_PICKUP_METHODS: PickupMethodConfig[] = [
  PICKUP_METHODS.reception,
  PICKUP_METHODS.pro_shop,
];

export function pickupConfig(id: PickupMethod): PickupMethodConfig {
  return PICKUP_METHODS[id];
}

/* --------------------------- Fulfillment status --------------------------- */
export interface FulfillmentStatusConfig {
  id: FulfillmentStatus;
  label: string;
  /** Member-facing sentence under the badge. */
  hint: string;
  tone: StatusTone;
  icon: string;
  color: string;
}

export const FULFILLMENT_STATUS: Record<FulfillmentStatus, FulfillmentStatusConfig> = {
  preparing: {
    id: "preparing",
    label: "Preparing",
    hint: "We're packing your order.",
    tone: "warning",
    icon: "hourglass",
    color: "#f59e0b",
  },
  ready: {
    id: "ready",
    label: "Ready for pickup",
    hint: "Your order is staged and waiting.",
    tone: "info",
    icon: "package-check",
    color: "#3b82f6",
  },
  picked_up: {
    id: "picked_up",
    label: "Picked up",
    hint: "Collected — thanks!",
    tone: "success",
    icon: "check-circle",
    color: "#10b981",
  },
  cancelled: {
    id: "cancelled",
    label: "Cancelled",
    hint: "This pickup was cancelled.",
    tone: "neutral",
    icon: "x",
    color: "#94a3b8",
  },
};

/** The happy-path trail rendered as a member-facing progress timeline. */
export const FULFILLMENT_TRAIL: FulfillmentStatus[] = ["preparing", "ready", "picked_up"];

/* -------------------------------- Shop ----------------------------------- */
/** Categories a member can browse & buy online (services stay a desk sale). */
export const SHOP_CATEGORIES: ProductCategory[] = [
  "beverages",
  "snacks",
  "equipment",
  "apparel",
  "merch",
];

export const SHOP_CATEGORY_LIST: ProductCategoryConfig[] = SHOP_CATEGORIES.map(
  (c) => PRODUCT_CATEGORIES[c],
);

export type ShopSort = "featured" | "price_asc" | "price_desc" | "name";

export const SHOP_SORTS: { id: ShopSort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price_asc", label: "Price · low to high" },
  { id: "price_desc", label: "Price · high to low" },
  { id: "name", label: "Name · A to Z" },
];

/** Quick add-ons surfaced during court booking, in display order. */
export const BOOKING_ADDON_CATEGORIES: ProductCategory[] = ["beverages", "snacks", "equipment"];

/** How many add-on suggestions the booking drawer shows before "browse all". */
export const BOOKING_ADDON_LIMIT = 8;
