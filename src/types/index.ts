/**
 * CourtOS — Domain types (single source of truth).
 * Mirrors the data model in docs/00-ARCHITECTURE.md §4.
 * Consumed by the mock API, query layer, and all feature modules.
 */

/* ----------------------------- Enums / unions ----------------------------- */

export type Sport = "tennis" | "pickleball" | "padel" | "badminton" | "squash";

export type Role = "owner" | "admin" | "coach" | "member";

export type CourtSurface = "hard" | "clay" | "grass" | "turf" | "acrylic" | "wood";

export type CourtEnvironment = "indoor" | "outdoor";

export type BookingStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed"
  | "no_show";

/**
 * A physical court is either booked whole, or divided into independently
 * bookable sections. This drives pricing, availability, and conflict rules.
 */
export type CourtType = "whole" | "shareable";

/** What a single reservation targets: the entire court, or one section. */
export type BookingScope = "whole" | "section";

/** Live status of a bookable lane (section or whole court) at a point in time. */
export type SectionStatus = "available" | "occupied";

/**
 * Why a slot is unavailable — powers precise, honest UI messaging.
 * - `self`     — this exact lane already has a reservation
 * - `whole`    — a whole-court booking is overriding this section
 * - `section`  — a section booking is blocking the whole-court lane
 */
export type BlockReason = "self" | "whole" | "section";

export type WaitlistStatus = "waiting" | "offered" | "claimed" | "expired";

export type PlanInterval = "monthly" | "quarterly" | "annual";

export type PaymentStatus = "paid" | "due" | "failed" | "refunded";

export type EventType = "clinic" | "league" | "tournament" | "open_play" | "lesson";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "all";

export type BookingChannel = "web" | "mobile" | "admin" | "kiosk";

export type TransactionType =
  | "booking"
  | "membership"
  | "event"
  | "pos"
  | "shop"
  | "refund"
  | "other";

/* --------------------------------- Branded IDs ---------------------------- */
// Plain strings at runtime; named for readability in signatures.
export type ID = string;

/* --------------------------------- Org / Facility ------------------------- */

export interface Organization {
  id: ID;
  name: string;
  slug: string;
  logoUrl?: string;
  timezone: string;
  currency: string; // ISO 4217, e.g. "CAD"
  sports: Sport[];
}

export interface Facility {
  id: ID;
  orgId: ID;
  name: string;
  address: string;
  environmentDefault: CourtEnvironment;
}

/**
 * A divisible, independently-bookable section of a SHAREABLE court.
 * Each section has its own price, availability, and reservation schedule.
 */
export interface CourtSection {
  id: ID;
  courtId: ID; // parent physical court
  name: string; // "Section A"
  shortLabel: string; // "A" — compact grid/badge label
  hourlyPrice: number;
  isActive: boolean;
}

/**
 * A Physical Court — the primary facility entity.
 *
 * - `type: "whole"`     → booked as a single unit; `hourlyRate` is its price.
 * - `type: "shareable"` → can be booked whole OR by section. `hourlyRate` is the
 *   price to book the ENTIRE court (the "whole court price"); `sections` carry
 *   their own independent prices.
 *
 * `hourlyRate` is therefore always "the price to book the entire physical court"
 * — see `wholeCourtPrice()` in lib/utils/pricing for the named accessor.
 */
export interface Court {
  id: ID;
  facilityId: ID;
  name: string;
  sport: Sport;
  surface: CourtSurface;
  environment: CourtEnvironment;
  isActive: boolean;
  openTime: string; // "06:00"
  closeTime: string; // "23:00"
  type: CourtType;
  hourlyRate: number; // whole-court hourly price (a.k.a. wholeCourtPrice)
  sections?: CourtSection[]; // SHAREABLE only
  imageUrl?: string;
}

/* --------------------------------- People --------------------------------- */

export interface User {
  id: ID;
  orgId: ID;
  role: Role;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  joinedAt: string; // ISO date
}

export interface TimeBlock {
  dayOfWeek: number; // 0 (Sun) – 6 (Sat)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface Coach extends User {
  role: "coach";
  specialties: Sport[];
  bio: string;
  rating: number; // 0–5
  hourlyRate: number;
  availability: TimeBlock[];
}

/* --------------------------------- Membership ----------------------------- */

export interface MembershipPlan {
  id: ID;
  orgId: ID;
  name: string;
  description: string;
  price: number;
  interval: PlanInterval;
  perks: string[];
  includedBookings: number; // -1 = unlimited
  accentColor: string;
  popular?: boolean;
}

export interface Membership {
  id: ID;
  userId: ID;
  planId: ID;
  status: "active" | "paused" | "cancelled" | "expired";
  startedAt: string;
  renewsAt: string;
  autoRenew: boolean;
}

/* --------------------------------- Reservations --------------------------- */

export interface Reservation {
  id: ID;
  courtId: ID; // physical court
  sectionId?: ID; // set when a single section was booked
  bookingType: BookingScope; // "whole" | "section"
  userId: ID;
  sport: Sport;
  start: string; // ISO datetime
  end: string; // ISO datetime
  status: BookingStatus;
  price: number; // resolved from the whole-court or section price
  participants: string[]; // names or user ids
  notes?: string;
  createdVia: BookingChannel;
}

export interface WaitlistEntry {
  id: ID;
  courtId: ID;
  userId: ID;
  requestedStart: string;
  requestedEnd: string;
  status: WaitlistStatus;
  position: number;
  offerExpiresAt?: string;
}

export interface PricingRule {
  id: ID;
  orgId: ID;
  scopeType: "sport" | "court";
  scopeId: string; // sport name or court id
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  multiplier?: number;
  flatRate?: number;
  memberTier?: string;
}

/* --------------------------------- Events --------------------------------- */

export interface SportEvent {
  id: ID;
  orgId: ID;
  type: EventType;
  sport: Sport;
  title: string;
  coverUrl?: string;
  description: string;
  coachId?: ID;
  courtId?: ID;
  start: string;
  end: string;
  capacity: number;
  registeredCount: number;
  price: number;
  skillLevel: SkillLevel;
}

export interface EventRegistration {
  id: ID;
  eventId: ID;
  userId: ID;
  status: "registered" | "waitlisted" | "cancelled";
  registeredAt: string;
}

/* --------------------------------- Payments ------------------------------- */

export interface PaymentMethod {
  id: ID;
  userId: ID;
  brand: "visa" | "mastercard" | "amex" | "discover";
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface InvoiceLineItem {
  label: string;
  amount: number;
}

export interface Invoice {
  id: ID;
  orgId: ID;
  userId: ID;
  amount: number;
  status: PaymentStatus;
  dueAt: string;
  paidAt?: string;
  lineItems: InvoiceLineItem[];
}

export interface Transaction {
  id: ID;
  orgId: ID;
  userId: ID;
  amount: number;
  type: TransactionType;
  status: PaymentStatus;
  method: string;
  createdAt: string;
}

/* --------------------------------- Notifications -------------------------- */

export interface Notification {
  id: ID;
  userId: ID;
  type: "booking" | "waitlist" | "payment" | "event" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

/* --------------------------------- API helpers ---------------------------- */

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SlotAvailability {
  courtId: ID;
  sectionId?: ID; // present for section lanes
  bookingType: BookingScope; // which lane this slot belongs to
  start: string;
  end: string;
  available: boolean;
  price: number;
  reservationId?: ID;
  blockedBy?: BlockReason; // why unavailable (for honest UI messaging)
}

/* --------------------------------- Point of Sale -------------------------- */
/**
 * The POS module lets reception staff sell retail goods AND club services
 * (bookings, memberships, events, coaching, guest passes) on ONE order.
 * It reads the same courts/plans/events/coaches as the rest of the platform,
 * and every completed sale writes a `Transaction` (type "pos") into the shared
 * ledger so Billing & Analytics stay unified.
 */

/** Retail product families sold at the desk. */
export type ProductCategory =
  | "beverages"
  | "snacks"
  | "equipment"
  | "apparel"
  | "merch"
  | "coaching"
  | "passes";

/** Catalog lifecycle. `out_of_stock` is derived but persisted for fast filters. */
export type ProductStatus = "active" | "archived" | "out_of_stock";

export interface Product {
  id: ID;
  orgId: ID;
  name: string;
  description?: string;
  category: ProductCategory;
  sku: string;
  barcode?: string;
  price: number; // CAD, pre-tax unit price
  taxRate: number; // e.g. 0.13 (Ontario HST). 0 = tax-exempt.
  cost?: number; // unit cost — powers margin & inventory valuation
  stock: number; // quantity on hand
  lowStockThreshold: number; // warn at or below this
  trackInventory: boolean; // services (coaching/passes) don't deplete stock
  status: ProductStatus;
  imageUrl?: string; // optional photo; UI falls back to a category tile
  emoji?: string; // display flair on the product tile
  sport?: Sport; // optional link for sport-specific equipment
}

/** What a single order line represents — retail or a club service. */
export type PosLineItemKind =
  | "product"
  | "booking"
  | "membership"
  | "event"
  | "coaching"
  | "guest_pass";

/** Tender types. `split` is a UI mode; persisted payments are the concrete ones. */
export type PaymentMethodKind = "cash" | "card" | "club_credit";

/**
 * Where an order was rung up.
 * - `pos`    — staff sold it at the desk (register)
 * - `online` — a member bought it themselves in the portal Shop, or as a
 *   booking add-on. Both channels write the same `PosOrder` + `Transaction`.
 */
export type OrderChannel = "pos" | "online";

/** How the customer collects a physical order. */
export type PickupMethod = "reception" | "pro_shop" | "after_booking";

/** Lifecycle of a pickup, shown to members as a progress trail. */
export type FulfillmentStatus = "preparing" | "ready" | "picked_up" | "cancelled";

/**
 * Pickup instructions + live status for an order.
 * Orders rung at the register are handed over immediately (`picked_up`);
 * online orders start as `preparing` until the pro shop stages them.
 */
export interface OrderFulfillment {
  method: PickupMethod;
  status: FulfillmentStatus;
  /** Human location label, e.g. "Reception desk · main lobby". */
  location: string;
  /** Set when the pickup is tied to a court booking (`after_booking`). */
  reservationId?: ID;
  /** ISO — when the order becomes collectable (booking start, or staged time). */
  readyAt?: string;
  pickedUpAt?: string;
  note?: string;
}

export interface PosLineItem {
  id: ID; // line id (cart-local, persisted on the order)
  kind: PosLineItemKind;
  refId?: ID; // productId / courtId / planId / eventId / coachId
  name: string;
  category?: ProductCategory;
  sku?: string;
  emoji?: string;
  imageUrl?: string;
  unitPrice: number; // pre-tax
  quantity: number;
  taxRate: number; // per-line so mixed tax rates coexist on one invoice
  discount: number; // absolute CAD off this line (post-quantity)
  note?: string;
}

export interface PosPayment {
  method: PaymentMethodKind;
  amount: number; // CAD applied via this tender
  reference?: string; // "Visa •4242", "Cash", "Club credit"
  tendered?: number; // cash given (for change calc)
}

export type PosOrderStatus = "completed" | "refunded" | "void";

/**
 * A completed commerce order — one shape for both channels.
 * `channel: "pos"` is a register sale (cashier = staff); `channel: "online"`
 * is a member self-serve purchase from the Shop or a booking add-on, where the
 * cashier fields carry the member's own identity.
 */
export interface PosOrder {
  id: ID;
  orgId: ID;
  number: string; // human receipt no. — "POS-1042" / "SHP-2043"
  channel: OrderChannel;
  cashierId: ID; // staff who rang the sale (or the member, online)
  cashierName: string;
  customerId?: ID; // member, when attached
  customerName?: string; // member or walk-in label
  /** Pickup instructions & status. Absent for service-only orders. */
  fulfillment?: OrderFulfillment;
  /** Set when this order was paid alongside a court booking. */
  reservationId?: ID;
  lineItems: PosLineItem[];
  subtotal: number; // Σ(unitPrice·qty) before discounts
  discountTotal: number; // Σ line discounts
  tax: number; // Σ per-line tax on discounted amounts
  total: number; // subtotal − discountTotal + tax
  payments: PosPayment[]; // ≥1; multiple = split payment
  status: PosOrderStatus;
  createdAt: string; // ISO
  note?: string; // order-level note
}

export type StockAdjustmentReason =
  | "restock"
  | "sale"
  | "correction"
  | "damage"
  | "return";

export interface StockAdjustment {
  id: ID;
  productId: ID;
  delta: number; // signed change to stock
  reason: StockAdjustmentReason;
  note?: string;
  by: string; // staff name
  createdAt: string;
}
