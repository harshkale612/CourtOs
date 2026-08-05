import type {
  BookingScope,
  Coach,
  Court,
  CourtSection,
  EventRegistration,
  Facility,
  FulfillmentStatus,
  Invoice,
  Membership,
  MembershipPlan,
  Notification,
  Organization,
  PaymentMethod,
  PickupMethod,
  PosLineItem,
  PosOrder,
  PosPayment,
  Product,
  ProductCategory,
  Reservation,
  SkillLevel,
  Sport,
  SportEvent,
  StockAdjustment,
  Transaction,
  User,
  WaitlistEntry,
} from "@/types";
import { SPORT_LIST } from "@/lib/constants/sports";
import { DEFAULT_TAX_RATE } from "@/lib/constants/pos";
import { PICKUP_METHODS, SHOP_CATEGORIES } from "@/lib/constants/commerce";
import { computeTotals, round2 } from "@/lib/utils/pos";
import { PRODUCT_SPECS } from "./pos-catalog";
import { addDays, ANCHOR_DATE, atTime, createRng, rngHelpers } from "./prng";
import { hasConflict } from "./availability";
import { avatarPortrait, courtImage, eventImage } from "./images";

/* -------------------------------------------------------------------------- */
/*  Deterministic database build                                              */
/* -------------------------------------------------------------------------- */

const rng = createRng(20260626);
const h = rngHelpers(rng);

const FIRST = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Jacob", "Sophia", "William", "Chloe",
  "Ethan", "Maya", "Lucas", "Zoe", "Benjamin", "Aisha", "Mateo", "Priya", "Owen", "Léa", "Ryan",
];
const LAST = [
  "Tremblay", "Smith", "Nguyen", "Patel", "Roy", "Wong", "Gagnon", "Brown", "Singh",
  "Martin", "Lee", "Chen", "Bouchard", "Kaur", "Anderson", "Côté", "Ali", "Fortin", "Reyes", "MacDonald",
];

/* ---- Organization & facilities ---- */
export const org: Organization = {
  id: "org_courtos",
  name: "Baseline Racquet Club",
  slug: "baseline",
  timezone: "America/Toronto",
  currency: "CAD",
  sports: SPORT_LIST.map((s) => s.id),
};

export const facilities: Facility[] = [
  { id: "fac_main", orgId: org.id, name: "Main Pavilion", address: "120 Lakeshore Blvd, Toronto", environmentDefault: "indoor" },
  { id: "fac_garden", orgId: org.id, name: "Garden Courts", address: "120 Lakeshore Blvd, Toronto (East)", environmentDefault: "outdoor" },
];

/* -------------------------------------------------------------------------- */
/*  Physical Courts                                                            */
/*  Whole courts are numbered (Court 1…); shareable courts are lettered        */
/*  (Court A…), each divided into independently-priced sections.               */
/* -------------------------------------------------------------------------- */

interface WholeSpec {
  id: string;
  name: string;
  sport: Sport;
  surface: Court["surface"];
  environment: Court["environment"];
  facilityId: string;
  rate: number;
}

interface ShareableSpec {
  id: string;
  name: string;
  sport: Sport;
  surface: Court["surface"];
  environment: Court["environment"];
  facilityId: string;
  wholeRate: number;
  sections: { label: string; price: number }[];
}

// Realistic Canadian racquet-club rates (CAD/hour).
const WHOLE_COURTS: WholeSpec[] = [
  { id: "court_1", name: "Court 1", sport: "tennis", surface: "hard", environment: "outdoor", facilityId: "fac_garden", rate: 52 },
  { id: "court_2", name: "Court 2", sport: "tennis", surface: "clay", environment: "outdoor", facilityId: "fac_garden", rate: 58 },
  { id: "court_3", name: "Court 3", sport: "tennis", surface: "hard", environment: "indoor", facilityId: "fac_main", rate: 46 },
  { id: "court_4", name: "Court 4", sport: "pickleball", surface: "acrylic", environment: "indoor", facilityId: "fac_main", rate: 38 },
  { id: "court_5", name: "Court 5", sport: "padel", surface: "turf", environment: "outdoor", facilityId: "fac_garden", rate: 64 },
  { id: "court_6", name: "Court 6", sport: "padel", surface: "turf", environment: "indoor", facilityId: "fac_main", rate: 60 },
  { id: "court_7", name: "Court 7", sport: "squash", surface: "wood", environment: "indoor", facilityId: "fac_main", rate: 34 },
  { id: "court_8", name: "Court 8", sport: "squash", surface: "wood", environment: "indoor", facilityId: "fac_main", rate: 36 },
];

const SHAREABLE_COURTS: ShareableSpec[] = [
  {
    id: "court_a", name: "Court A", sport: "badminton", surface: "wood", environment: "indoor", facilityId: "fac_main",
    wholeRate: 72,
    sections: [{ label: "A", price: 26 }, { label: "B", price: 30 }, { label: "C", price: 22 }],
  },
  {
    id: "court_b", name: "Court B", sport: "pickleball", surface: "acrylic", environment: "indoor", facilityId: "fac_main",
    wholeRate: 80,
    sections: [{ label: "A", price: 30 }, { label: "B", price: 28 }],
  },
  {
    id: "court_c", name: "Court C", sport: "badminton", surface: "wood", environment: "indoor", facilityId: "fac_main",
    wholeRate: 68,
    sections: [{ label: "A", price: 24 }, { label: "B", price: 26 }, { label: "C", price: 24 }],
  },
  {
    id: "court_d", name: "Court D", sport: "tennis", surface: "hard", environment: "outdoor", facilityId: "fac_garden",
    wholeRate: 88,
    sections: [{ label: "A", price: 34 }, { label: "B", price: 34 }],
  },
];

function buildCourts(): Court[] {
  const whole: Court[] = WHOLE_COURTS.map((c, i) => ({
    id: c.id,
    facilityId: c.facilityId,
    name: c.name,
    sport: c.sport,
    surface: c.surface,
    environment: c.environment,
    isActive: true,
    openTime: "06:00",
    closeTime: "23:00",
    type: "whole",
    hourlyRate: c.rate,
    imageUrl: courtImage(c.sport, i),
  }));

  const shareable: Court[] = SHAREABLE_COURTS.map((c, i) => {
    const sections: CourtSection[] = c.sections.map((s) => ({
      id: `${c.id}_sec_${s.label.toLowerCase()}`,
      courtId: c.id,
      name: `Section ${s.label}`,
      shortLabel: s.label,
      hourlyPrice: s.price,
      isActive: true,
    }));
    return {
      id: c.id,
      facilityId: c.facilityId,
      name: c.name,
      sport: c.sport,
      surface: c.surface,
      environment: c.environment,
      isActive: true,
      openTime: "06:00",
      closeTime: "23:00",
      type: "shareable",
      hourlyRate: c.wholeRate, // price to book the ENTIRE court
      sections,
      imageUrl: courtImage(c.sport, i),
    };
  });

  return [...whole, ...shareable];
}
export const courts = buildCourts();

/** Flat list of every section across all shareable courts (for lookups/analytics). */
export const sections: CourtSection[] = courts.flatMap((c) => c.sections ?? []);

/* ---- Users ---- */
export const currentUser: User = {
  id: "user_anna",
  orgId: org.id,
  role: "member",
  name: "Ava Tremblay",
  email: "ava@example.com",
  avatarUrl: avatarPortrait("Ava Tremblay"),
  phone: "+1 (416) 555-0142",
  joinedAt: addDays(ANCHOR_DATE, -420).toISOString(),
};

function buildMembers(n: number): User[] {
  const out: User[] = [currentUser];
  for (let i = 0; i < n; i++) {
    const name = `${h.pick(FIRST)} ${h.pick(LAST)}`;
    out.push({
      id: `user_${i + 1}`,
      orgId: org.id,
      role: "member",
      name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@example.com`,
      avatarUrl: avatarPortrait(name + i),
      phone: `+1 (${h.pick([416, 604, 514, 403, 613])}) 555-${h.int(1000, 9999)}`,
      joinedAt: addDays(ANCHOR_DATE, -h.int(10, 700)).toISOString(),
    });
  }
  return out;
}
export const members = buildMembers(48);

/* ---- Coaches ---- */
function buildCoaches(n: number): Coach[] {
  const out: Coach[] = [];
  for (let i = 0; i < n; i++) {
    const name = `${h.pick(FIRST)} ${h.pick(LAST)}`;
    out.push({
      id: `coach_${i + 1}`,
      orgId: org.id,
      role: "coach",
      name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@baseline.club`,
      avatarUrl: avatarPortrait("coach" + name),
      phone: `+1 (${h.pick([416, 604, 514, 403, 613])}) 555-${h.int(1000, 9999)}`,
      joinedAt: addDays(ANCHOR_DATE, -h.int(200, 1200)).toISOString(),
      specialties: h.sample(SPORT_LIST.map((s) => s.id), h.int(1, 2)),
      bio: "Certified coach with a decade of competitive and teaching experience.",
      rating: Number(h.float(4.3, 5).toFixed(1)),
      hourlyRate: h.pick([55, 70, 85, 100, 120]),
      availability: [
        { dayOfWeek: 1, startTime: "08:00", endTime: "16:00" },
        { dayOfWeek: 3, startTime: "10:00", endTime: "18:00" },
        { dayOfWeek: 5, startTime: "07:00", endTime: "14:00" },
      ],
    });
  }
  return out;
}
export const coaches = buildCoaches(6);

/* ---- Membership plans ---- */
export const plans: MembershipPlan[] = [
  {
    id: "plan_social", orgId: org.id, name: "Social", description: "Casual play, pay-as-you-go perks.",
    price: 49, interval: "monthly", includedBookings: 4, accentColor: "#06b6d4", popular: false,
    perks: ["4 included bookings / mo", "Member booking rates", "Event access"],
  },
  {
    id: "plan_premier", orgId: org.id, name: "Premier", description: "For regulars who play every week.",
    price: 129, interval: "monthly", includedBookings: 16, accentColor: "#6366f1", popular: true,
    perks: ["16 included bookings / mo", "7-day advance booking", "Guest passes", "Priority waitlist", "Free clinics"],
  },
  {
    id: "plan_elite", orgId: org.id, name: "Elite", description: "Unlimited everything, white-glove.",
    price: 229, interval: "monthly", includedBookings: -1, accentColor: "#8b5cf6", popular: false,
    perks: ["Unlimited bookings", "14-day advance booking", "Unlimited guests", "Dedicated concierge", "Free coaching credits"],
  },
];

export const memberships: Membership[] = members.map((m) => ({
  id: `mem_${m.id}`,
  userId: m.id,
  planId: m.id === currentUser.id ? "plan_premier" : h.pick(plans).id,
  status: h.chance(0.9) ? "active" : h.pick(["paused", "expired"] as const),
  startedAt: addDays(ANCHOR_DATE, -h.int(30, 400)).toISOString(),
  renewsAt: addDays(ANCHOR_DATE, h.int(1, 30)).toISOString(),
  autoRenew: h.chance(0.8),
}));

/* -------------------------------------------------------------------------- */
/*  Reservations                                                               */
/*  Built through the SAME conflict engine the app uses, so the seed data is   */
/*  self-consistent: no whole booking ever coexists with a section booking on  */
/*  the same court/time, and sibling sections book in parallel freely.         */
/* -------------------------------------------------------------------------- */

function buildReservations(): Reservation[] {
  const out: Reservation[] = [];
  let n = 0;

  const push = (
    court: Court,
    sectionId: string | undefined,
    date: Date,
    hour: number,
    status: Reservation["status"],
  ): boolean => {
    const start = atTime(date, hour);
    const end = atTime(date, hour + 1);
    const startISO = start.toISOString();
    const endISO = end.toISOString();
    // Only enforce conflicts among slot-holding (non-cancelled) reservations.
    if (status !== "cancelled" && hasConflict(out, court.id, sectionId, startISO, endISO)) {
      return false;
    }
    const bookingType: BookingScope = sectionId ? "section" : "whole";
    const section = sectionId ? court.sections?.find((s) => s.id === sectionId) : undefined;
    const user = h.pick(members);
    out.push({
      id: `res_${++n}`,
      courtId: court.id,
      sectionId,
      bookingType,
      userId: user.id,
      sport: court.sport,
      start: startISO,
      end: endISO,
      status,
      price: section ? section.hourlyPrice : court.hourlyRate,
      participants: [user.name, ...h.sample(members.map((m) => m.name), h.int(0, 3))],
      createdVia: h.pick(["web", "mobile", "admin"] as const),
    });
    return true;
  };

  /* --- Hand-placed demonstrative scenarios on "today" (anchor date) --- */
  const byId = (id: string) => courts.find((c) => c.id === id)!;
  const courtA = byId("court_a"); // badminton shareable
  const courtB = byId("court_b"); // pickleball shareable
  const courtD = byId("court_d"); // tennis shareable
  const court1 = byId("court_1"); // tennis whole
  // Whole booking overrides all sections (Court A @ 18:00)
  push(courtA, undefined, ANCHOR_DATE, 18, "confirmed");
  // Section booking blocks the whole court but leaves siblings free (Court B · Section A @ 19:00)
  push(courtB, courtB.sections![0].id, ANCHOR_DATE, 19, "confirmed");
  // Two sibling sections booked in parallel (Court D · Section A & B @ 10:00) — on the default tennis tab
  push(courtD, courtD.sections![0].id, ANCHOR_DATE, 10, "confirmed");
  push(courtD, courtD.sections![1].id, ANCHOR_DATE, 10, "confirmed");
  // A plain whole-court booking (Court 1 @ 09:00)
  push(court1, undefined, ANCHOR_DATE, 9, "confirmed");

  /* --- Volume: 14 days back → 10 days forward --- */
  for (let day = -14; day <= 10; day++) {
    const date = addDays(ANCHOR_DATE, day);
    const attempts = h.int(18, 30);
    for (let i = 0; i < attempts; i++) {
      const court = h.pick(courts);
      let sectionId: string | undefined;
      if (court.type === "shareable" && court.sections?.length) {
        // Bias toward section bookings so the two modes are both well-represented.
        if (h.chance(0.6)) sectionId = h.pick(court.sections).id;
      }
      const hour = h.int(6, 21);
      const isPast = day < 0;
      const status = isPast
        ? h.pick(["completed", "completed", "completed", "cancelled", "no_show"] as const)
        : day === 0
          ? h.pick(["confirmed", "confirmed", "pending"] as const)
          : h.pick(["confirmed", "confirmed", "confirmed", "pending"] as const);
      push(court, sectionId, date, hour, status);
    }
  }
  return out;
}
export const reservations = buildReservations();

/* ---- Waitlist ---- */
export const waitlist: WaitlistEntry[] = Array.from({ length: 6 }).map((_, i) => {
  const court = h.pick(courts);
  const date = addDays(ANCHOR_DATE, h.int(0, 3));
  const hour = h.int(17, 20);
  return {
    id: `wait_${i + 1}`,
    courtId: court.id,
    userId: h.pick(members).id,
    requestedStart: atTime(date, hour).toISOString(),
    requestedEnd: atTime(date, hour + 1).toISOString(),
    status: h.pick(["waiting", "waiting", "offered"] as const),
    position: i + 1,
    offerExpiresAt: i === 0 ? atTime(ANCHOR_DATE, 12).toISOString() : undefined,
  };
});

/* ---- Events ---- */
function buildEvents(n: number): SportEvent[] {
  const titles = [
    "Sunrise Cardio Tennis", "Pickleball Open Play", "Padel Doubles League",
    "Juniors Academy Clinic", "Friday Night Mixer", "Squash Ladder Night",
    "Badminton Skills Lab", "Weekend Round Robin", "Pro-Am Showcase", "Beginner Bootcamp",
  ];
  const types = ["clinic", "league", "tournament", "open_play", "lesson"] as const;
  const skills: SkillLevel[] = ["beginner", "intermediate", "advanced", "all"];
  return Array.from({ length: n }).map((_, i) => {
    const sport = h.pick(SPORT_LIST).id;
    const date = addDays(ANCHOR_DATE, h.int(1, 21));
    const hour = h.int(7, 19);
    const capacity = h.pick([8, 12, 16, 20, 24]);
    const sportCourts = courts.filter((c) => c.sport === sport);
    return {
      id: `event_${i + 1}`,
      orgId: org.id,
      type: h.pick(types),
      sport,
      title: titles[i % titles.length],
      coverUrl: eventImage(i),
      description:
        "Join fellow members for a high-energy session led by our certified pros. All equipment provided.",
      coachId: h.pick(coaches).id,
      courtId: (sportCourts.length ? h.pick(sportCourts) : h.pick(courts)).id,
      start: atTime(date, hour).toISOString(),
      end: atTime(date, hour + 2).toISOString(),
      capacity,
      registeredCount: h.int(2, capacity),
      price: h.pick([0, 20, 30, 45, 60]),
      skillLevel: h.pick(skills),
    };
  });
}
export const events = buildEvents(10);

export const eventRegistrations: EventRegistration[] = events.slice(0, 4).map((e, i) => ({
  id: `reg_${i + 1}`,
  eventId: e.id,
  userId: currentUser.id,
  status: "registered",
  registeredAt: addDays(ANCHOR_DATE, -h.int(1, 8)).toISOString(),
}));

/* ---- Payments ---- */
export const paymentMethods: PaymentMethod[] = [
  { id: "pm_1", userId: currentUser.id, brand: "visa", last4: "4242", expMonth: 8, expYear: 2028, isDefault: true },
  { id: "pm_2", userId: currentUser.id, brand: "mastercard", last4: "5318", expMonth: 3, expYear: 2027, isDefault: false },
];

export const invoices: Invoice[] = Array.from({ length: 8 }).map((_, i) => {
  const paid = i > 0;
  const amount = h.pick([49, 129, 229, 26, 34, 60]);
  return {
    id: `inv_${1000 + i}`,
    orgId: org.id,
    userId: currentUser.id,
    amount,
    status: paid ? "paid" : "due",
    dueAt: addDays(ANCHOR_DATE, paid ? -i * 30 : 5).toISOString(),
    paidAt: paid ? addDays(ANCHOR_DATE, -i * 30 + 1).toISOString() : undefined,
    lineItems: [{ label: i === 0 ? "Premier membership" : "Monthly membership", amount }],
  };
});

export const transactions: Transaction[] = Array.from({ length: 40 }).map((_, i) => {
  const user = h.pick(members);
  return {
    id: `txn_${5000 + i}`,
    orgId: org.id,
    userId: user.id,
    amount: h.pick([52, 58, 38, 49, 129, 229, 26, 34, 30]),
    type: h.pick(["booking", "membership", "event", "booking", "booking"] as const),
    status: h.pick(["paid", "paid", "paid", "refunded"] as const),
    method: h.pick(["Visa •4242", "Mastercard •5318", "Amex •0005"]),
    createdAt: addDays(ANCHOR_DATE, -h.int(0, 60)).toISOString(),
  };
});

/* ---- Notifications ---- */
export const notifications: Notification[] = [
  {
    id: "ntf_1", userId: currentUser.id, type: "waitlist",
    title: "A section just opened up", body: "Court B · Section B is free at 6:00 PM today. Claim it before it's gone.",
    read: false, createdAt: addDays(ANCHOR_DATE, 0).toISOString(), href: "/app/booking",
  },
  {
    id: "ntf_2", userId: currentUser.id, type: "booking",
    title: "Booking confirmed", body: "Court A · Section A · Tomorrow, 7:00 PM is all set.",
    read: false, createdAt: addDays(ANCHOR_DATE, 0).toISOString(), href: "/app/reservations",
  },
  {
    id: "ntf_3", userId: currentUser.id, type: "event",
    title: "Spot reserved", body: "You're in for Friday Night Mixer. See you on court!",
    read: true, createdAt: addDays(ANCHOR_DATE, -1).toISOString(), href: "/app/events",
  },
  {
    id: "ntf_4", userId: currentUser.id, type: "payment",
    title: "Payment received", body: "Your Premier membership renewed successfully.",
    read: true, createdAt: addDays(ANCHOR_DATE, -3).toISOString(), href: "/app/payments",
  },
];

/* -------------------------------------------------------------------------- */
/*  Point of Sale — catalog, orders, stock ledger & club credit               */
/*  Retail + club services on one order. Every completed sale also writes a    */
/*  Transaction (type "pos") into the shared ledger so Billing stays unified.  */
/* -------------------------------------------------------------------------- */

const CATEGORY_SKU_PREFIX: Record<ProductCategory, string> = {
  beverages: "BEV",
  snacks: "SNK",
  equipment: "EQP",
  apparel: "APP",
  merch: "MRC",
  coaching: "COA",
  passes: "PAS",
};

function buildProducts(): Product[] {
  const counters: Record<string, number> = {};
  return PRODUCT_SPECS.map((s, i) => {
    const prefix = CATEGORY_SKU_PREFIX[s.category];
    counters[prefix] = (counters[prefix] ?? 0) + 1;
    const sku = `${prefix}-${String(counters[prefix]).padStart(3, "0")}`;
    const track = s.track !== false;
    const status = s.status ?? (track && s.stock <= 0 ? "out_of_stock" : "active");
    const barcode = track ? `754${String(100000000 + i * 811731).slice(-9)}` : undefined;
    return {
      id: `prod_${i + 1}`,
      orgId: org.id,
      name: s.name,
      description: s.description,
      category: s.category,
      sku,
      barcode,
      price: s.price,
      taxRate: s.taxRate ?? DEFAULT_TAX_RATE,
      cost: s.cost,
      stock: s.stock,
      lowStockThreshold: s.low,
      trackInventory: track,
      status,
      emoji: s.emoji,
      sport: s.sport,
    };
  });
}
export const products = buildProducts();

/** Desk staff who ring sales (POS-only identities). */
export const POS_CASHIERS = [
  { id: "staff_jordan", name: "Jordan Blake" },
  { id: "staff_mia", name: "Mia Fortin" },
  { id: "staff_devon", name: "Devon Clarke" },
];

/** Prepaid club-credit balances (CAD), keyed by user id. */
function buildClubCredit(): Record<string, number> {
  const out: Record<string, number> = { [currentUser.id]: 75 };
  for (const m of members) {
    if (m.id === currentUser.id) continue;
    if (h.chance(0.3)) out[m.id] = h.pick([15, 20, 25, 40, 50, 75, 100, 150]);
  }
  return out;
}
export const clubCredit = buildClubCredit();

const CARD_REFS = ["Visa •4242", "Mastercard •5318", "Amex •0005", "Interac Debit"];

/**
 * Commerce orders across BOTH channels:
 *  - `pos`    — rung at the desk by staff, handed over at the counter.
 *  - `online` — placed by a member in the portal Shop (or as a booking add-on),
 *               collected at Reception / the Pro Shop / after their session.
 * Every order folds a Transaction into the shared ledger so Billing, Analytics
 * and the member's payment history all agree.
 */
function buildCommerceOrders(): { orders: PosOrder[]; txns: Transaction[] } {
  const orders: PosOrder[] = [];
  const txns: Transaction[] = [];
  let n = 0; // POS receipt counter
  let s = 0; // Shop receipt counter
  let li = 0;
  const sellable = products.filter(
    (p) => p.status !== "archived" && (!p.trackInventory || p.stock > 0),
  );
  const retail = sellable.filter((p) => SHOP_CATEGORIES.includes(p.category));
  const paidEvents = events.filter((e) => e.price > 0);

  /** Basket of 1–maxLines retail/service products. */
  const basket = (pool: Product[], maxLines: number, allowDiscount: boolean): PosLineItem[] => {
    const lines: PosLineItem[] = [];
    for (let j = 0; j < h.int(1, maxLines); j++) {
      const p = h.pick(pool);
      lines.push({
        id: `li_${++li}`,
        kind: "product",
        refId: p.id,
        name: p.name,
        category: p.category,
        sku: p.sku,
        emoji: p.emoji,
        unitPrice: p.price,
        quantity: p.price > 40 ? 1 : h.int(1, 3),
        taxRate: p.taxRate,
        discount: allowDiscount && h.chance(0.12) ? h.pick([1, 2, 5]) : 0,
      });
    }
    return lines;
  };

  const record = (order: PosOrder, refunded: boolean) => {
    orders.push(order);
    txns.push({
      id: `txn_${order.id}`,
      orgId: org.id,
      userId: order.customerId ?? currentUser.id,
      amount: refunded ? -order.total : order.total,
      type: refunded ? "refund" : order.channel === "online" ? "shop" : "pos",
      status: refunded ? "refunded" : "paid",
      method:
        order.payments.length > 1 ? "Split payment" : (order.payments[0]?.reference ?? "Card"),
      createdAt: order.createdAt,
    });
  };

  /* ------------------------------ POS channel ----------------------------- */
  for (let day = -30; day <= 0; day++) {
    const date = addDays(ANCHOR_DATE, day);
    const count = day === 0 ? h.int(7, 11) : h.int(1, 4);
    for (let k = 0; k < count; k++) {
      const lineItems = basket(sellable, 4, true);
      // ~22% of desk sales bundle a club service — the "unified transaction" story.
      if (h.chance(0.22)) {
        const svc = h.pick(["membership", "booking", "event"] as const);
        if (svc === "membership") {
          const plan = h.pick(plans);
          lineItems.push({ id: `li_${++li}`, kind: "membership", refId: plan.id, name: `${plan.name} Membership`, emoji: "🏅", unitPrice: plan.price, quantity: 1, taxRate: DEFAULT_TAX_RATE, discount: 0 });
        } else if (svc === "booking") {
          const court = h.pick(courts);
          lineItems.push({ id: `li_${++li}`, kind: "booking", refId: court.id, name: `${court.name} · 1 hr`, emoji: "🎾", unitPrice: court.hourlyRate, quantity: 1, taxRate: DEFAULT_TAX_RATE, discount: 0 });
        } else if (paidEvents.length) {
          const e = h.pick(paidEvents);
          lineItems.push({ id: `li_${++li}`, kind: "event", refId: e.id, name: e.title, emoji: "🏆", unitPrice: e.price, quantity: 1, taxRate: DEFAULT_TAX_RATE, discount: 0 });
        }
      }

      const totals = computeTotals(lineItems);
      const member = h.chance(0.55) ? h.pick(members) : undefined;

      // Tender: mostly single, occasional split (card + cash).
      const payments: PosPayment[] = [];
      if (h.chance(0.1) && totals.total > 20) {
        const first = round2(totals.total / 2);
        const rest = round2(totals.total - first);
        payments.push({ method: "card", amount: first, reference: h.pick(CARD_REFS) });
        payments.push({ method: "cash", amount: rest, reference: "Cash", tendered: Math.ceil(rest / 5) * 5 });
      } else {
        const method = h.pick(["cash", "card", "card", "club_credit"] as const);
        if (method === "cash") payments.push({ method: "cash", amount: totals.total, reference: "Cash", tendered: Math.ceil(totals.total / 5) * 5 });
        else if (method === "card") payments.push({ method: "card", amount: totals.total, reference: h.pick(CARD_REFS) });
        else payments.push({ method: "club_credit", amount: totals.total, reference: "Club credit" });
      }

      const cashier = h.pick(POS_CASHIERS);
      const createdAt = atTime(date, h.int(7, 21), h.pick([0, 15, 30, 45])).toISOString();
      const refunded = day < -1 && h.chance(0.04);
      const hasGoods = lineItems.some((l) => l.kind === "product");
      record(
        {
          id: `pos_${++n}`,
          orgId: org.id,
          number: `POS-${1000 + n}`,
          channel: "pos",
          cashierId: cashier.id,
          cashierName: cashier.name,
          customerId: member?.id,
          customerName: member?.name ?? "Walk-in",
          // Desk sales leave with the customer — recorded as collected at the till.
          fulfillment: hasGoods
            ? {
                method: "reception",
                status: "picked_up",
                location: "Front desk · handed over at the register",
                pickedUpAt: createdAt,
              }
            : undefined,
          lineItems,
          subtotal: totals.subtotal,
          discountTotal: totals.discountTotal,
          tax: totals.tax,
          total: totals.total,
          payments,
          status: refunded ? "refunded" : "completed",
          createdAt,
        },
        refunded,
      );
    }
  }

  /* ----------------------------- Online channel ---------------------------- */
  /** Reservations a member can attach a courtside pickup to. */
  const upcomingFor = (userId: string) =>
    reservations.filter(
      (r) => r.userId === userId && r.status !== "cancelled" && +new Date(r.start) >= +ANCHOR_DATE,
    );

  const placeOnline = (
    member: User,
    date: Date,
    hour: number,
    opts: {
      method: PickupMethod;
      status: FulfillmentStatus;
      reservationId?: string;
      readyAt?: string;
      lines?: PosLineItem[];
      note?: string;
    },
  ) => {
    const lineItems = opts.lines ?? basket(retail, 3, false);
    const totals = computeTotals(lineItems);
    const createdAt = atTime(date, hour, h.pick([0, 10, 20, 35, 50])).toISOString();
    const cfg = PICKUP_METHODS[opts.method];
    const useCredit = (clubCredit[member.id] ?? 0) >= totals.total && h.chance(0.25);
    record(
      {
        id: `shp_${++s}`,
        orgId: org.id,
        number: `SHP-${2000 + s}`,
        channel: "online",
        // Online checkout is self-serve: the member is their own cashier.
        cashierId: member.id,
        cashierName: `${member.name} · online`,
        customerId: member.id,
        customerName: member.name,
        reservationId: opts.reservationId,
        fulfillment: {
          method: opts.method,
          status: opts.status,
          location: cfg.location,
          reservationId: opts.reservationId,
          readyAt: opts.readyAt,
          pickedUpAt: opts.status === "picked_up" ? createdAt : undefined,
          note: opts.note,
        },
        lineItems,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        tax: totals.tax,
        total: totals.total,
        payments: [
          useCredit
            ? { method: "club_credit", amount: totals.total, reference: "Club credit" }
            : { method: "card", amount: totals.total, reference: h.pick(CARD_REFS) },
        ],
        status: "completed",
        createdAt,
      },
      false,
    );
  };

  // Club-wide online volume across the last 30 days.
  for (let day = -30; day <= 0; day++) {
    const date = addDays(ANCHOR_DATE, day);
    const count = day === 0 ? h.int(3, 5) : h.int(1, 3);
    for (let k = 0; k < count; k++) {
      const member = h.pick(members);
      const method = h.pick(["reception", "reception", "pro_shop", "after_booking"] as const);
      const upcoming = method === "after_booking" ? upcomingFor(member.id) : [];
      const reservation = upcoming.length ? h.pick(upcoming) : undefined;
      const status: FulfillmentStatus =
        day < -1
          ? h.chance(0.04)
            ? "cancelled"
            : "picked_up"
          : h.pick(["preparing", "ready", "ready", "picked_up"] as const);
      placeOnline(member, date, h.int(7, 20), {
        method: reservation ? "after_booking" : method === "after_booking" ? "reception" : method,
        status,
        reservationId: reservation?.id,
        readyAt: reservation ? reservation.end : undefined,
      });
    }
  }

  /* --- Hand-placed orders for the demo member, one per pickup state --- */
  const demoUpcoming = upcomingFor(currentUser.id);
  const byName = (name: string) => products.find((p) => p.name === name)!;
  const line = (p: Product, quantity: number): PosLineItem => ({
    id: `li_${++li}`,
    kind: "product",
    refId: p.id,
    name: p.name,
    category: p.category,
    sku: p.sku,
    emoji: p.emoji,
    unitPrice: p.price,
    quantity,
    taxRate: p.taxRate,
    discount: 0,
  });

  // Being packed right now — Pro Shop.
  placeOnline(currentUser, ANCHOR_DATE, 8, {
    method: "pro_shop",
    status: "preparing",
    lines: [line(byName("Babolat Boost Racquet"), 1), line(byName("Tourna Overgrip (3-pack)"), 2)],
    note: "Grip 3 please",
  });
  // Waiting at Reception.
  placeOnline(currentUser, ANCHOR_DATE, 7, {
    method: "reception",
    status: "ready",
    readyAt: atTime(ANCHOR_DATE, 9).toISOString(),
    lines: [line(byName("Baseline Club Cap"), 1), line(byName("Court Socks (2-pack)"), 1)],
  });
  // Courtside with an upcoming session.
  if (demoUpcoming.length) {
    const res = demoUpcoming[0];
    placeOnline(currentUser, addDays(ANCHOR_DATE, -1), 19, {
      method: "after_booking",
      status: "preparing",
      reservationId: res.id,
      readyAt: res.end,
      lines: [line(byName("Gatorade Cool Blue"), 2), line(byName("Wilson US Open Balls (3-can)"), 1)],
    });
  }
  // Collected history — gives "Reorder" something worth repeating.
  placeOnline(currentUser, addDays(ANCHOR_DATE, -6), 17, {
    method: "reception",
    status: "picked_up",
    lines: [line(byName("Smartwater 600 mL"), 2), line(byName("Clif Energy Bar"), 2)],
  });
  placeOnline(currentUser, addDays(ANCHOR_DATE, -18), 12, {
    method: "pro_shop",
    status: "picked_up",
    lines: [line(byName("Baseline Performance Tee"), 1), line(byName("Baseline Water Bottle"), 1)],
  });

  orders.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return { orders, txns };
}
const posBuild = buildCommerceOrders();
export const posOrders = posBuild.orders;
// Fold commerce sales into the shared transaction ledger (Billing/Analytics).
transactions.push(...posBuild.txns);

function buildStockAdjustments(): StockAdjustment[] {
  const out: StockAdjustment[] = [];
  let n = 0;
  const tracked = products.filter((p) => p.trackInventory);
  for (const p of tracked) {
    if (h.chance(0.7)) {
      out.push({
        id: `adj_${++n}`,
        productId: p.id,
        delta: h.pick([12, 24, 24, 36, 48]),
        reason: "restock",
        note: "Weekly replenishment",
        by: h.pick(POS_CASHIERS).name,
        createdAt: addDays(ANCHOR_DATE, -h.int(4, 21)).toISOString(),
      });
    }
  }
  for (const p of h.sample(tracked, 3)) {
    out.push({
      id: `adj_${++n}`,
      productId: p.id,
      delta: -h.int(1, 3),
      reason: h.pick(["damage", "correction"] as const),
      note: h.pick(["Damaged in storage", "Cycle-count correction"]),
      by: h.pick(POS_CASHIERS).name,
      createdAt: addDays(ANCHOR_DATE, -h.int(1, 10)).toISOString(),
    });
  }
  return out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
export const stockAdjustments = buildStockAdjustments();

/* -------------------------------------------------------------------------- */

/** The single in-memory mock database. Mutated by mock mutations at runtime. */
export const db = {
  org,
  facilities,
  courts,
  sections,
  members,
  coaches,
  currentUser,
  plans,
  memberships,
  reservations,
  waitlist,
  events,
  eventRegistrations,
  paymentMethods,
  invoices,
  transactions,
  notifications,
  products,
  posOrders,
  stockAdjustments,
  clubCredit,
};

export type MockDB = typeof db;
