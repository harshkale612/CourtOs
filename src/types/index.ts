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

export type WaitlistStatus = "waiting" | "offered" | "claimed" | "expired";

export type PlanInterval = "monthly" | "quarterly" | "annual";

export type PaymentStatus = "paid" | "due" | "failed" | "refunded";

export type EventType = "clinic" | "league" | "tournament" | "open_play" | "lesson";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "all";

export type BookingChannel = "web" | "mobile" | "admin" | "kiosk";

export type TransactionType = "booking" | "membership" | "event" | "refund" | "other";

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
  currency: string; // ISO 4217, e.g. "USD"
  sports: Sport[];
}

export interface Facility {
  id: ID;
  orgId: ID;
  name: string;
  address: string;
  environmentDefault: CourtEnvironment;
}

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
  hourlyRate: number;
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
  courtId: ID;
  userId: ID;
  sport: Sport;
  start: string; // ISO datetime
  end: string; // ISO datetime
  status: BookingStatus;
  price: number;
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
  start: string;
  end: string;
  available: boolean;
  price: number;
  reservationId?: ID;
}
