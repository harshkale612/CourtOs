import type {
  Coach,
  Court,
  CourtSurface,
  EventRegistration,
  Facility,
  Invoice,
  Membership,
  MembershipPlan,
  Notification,
  Organization,
  PaymentMethod,
  Reservation,
  SkillLevel,
  Sport,
  SportEvent,
  Transaction,
  User,
  WaitlistEntry,
} from "@/types";
import { SPORT_LIST } from "@/lib/constants/sports";
import { addDays, ANCHOR_DATE, atTime, createRng, rngHelpers } from "./prng";
import { avatarPortrait, courtImage, eventImage } from "./images";

/* -------------------------------------------------------------------------- */
/*  Deterministic database build                                              */
/* -------------------------------------------------------------------------- */

const rng = createRng(20260626);
const h = rngHelpers(rng);

const FIRST = [
  "Anna", "Marcus", "Sofia", "Liam", "Olivia", "Noah", "Emma", "Ethan", "Maya",
  "Lucas", "Isla", "Leo", "Aria", "Kai", "Zoe", "Theo", "Nina", "Owen", "Ivy", "Jude",
];
const LAST = [
  "Lee", "Carter", "Reyes", "Novak", "Bennett", "Hayes", "Flores", "Whit", "Stone",
  "Park", "Sato", "Okafor", "Cruz", "Morgan", "Patel", "Nguyen", "Brooks", "Ali",
];

const SURFACES: Record<Sport, CourtSurface[]> = {
  tennis: ["hard", "clay", "grass"],
  pickleball: ["acrylic", "hard"],
  padel: ["turf", "acrylic"],
  badminton: ["wood"],
  squash: ["wood", "acrylic"],
};

/* ---- Organization & facilities ---- */
export const org: Organization = {
  id: "org_volley",
  name: "Riverside Racquet Club",
  slug: "riverside",
  timezone: "America/New_York",
  currency: "USD",
  sports: SPORT_LIST.map((s) => s.id),
};

export const facilities: Facility[] = [
  { id: "fac_main", orgId: org.id, name: "Main Pavilion", address: "120 Riverside Dr", environmentDefault: "indoor" },
  { id: "fac_garden", orgId: org.id, name: "Garden Courts", address: "120 Riverside Dr (East)", environmentDefault: "outdoor" },
];

/* ---- Courts ---- */
function buildCourts(): Court[] {
  const courts: Court[] = [];
  const layout: { sport: Sport; count: number }[] = [
    { sport: "tennis", count: 4 },
    { sport: "pickleball", count: 4 },
    { sport: "padel", count: 2 },
    { sport: "badminton", count: 2 },
    { sport: "squash", count: 2 },
  ];
  for (const { sport, count } of layout) {
    for (let i = 0; i < count; i++) {
      const env = h.pick(["indoor", "outdoor"] as const);
      courts.push({
        id: `court_${sport}_${i + 1}`,
        facilityId: env === "indoor" ? "fac_main" : "fac_garden",
        name: `${capitalize(sport)} ${i + 1}`,
        sport,
        surface: h.pick(SURFACES[sport]),
        environment: env,
        isActive: h.chance(0.94),
        openTime: "06:00",
        closeTime: "23:00",
        hourlyRate: h.pick([24, 28, 32, 36, 40, 48]),
        imageUrl: courtImage(sport, i),
      });
    }
  }
  return courts;
}
export const courts = buildCourts();

/* ---- Users ---- */
export const currentUser: User = {
  id: "user_anna",
  orgId: org.id,
  role: "member",
  name: "Anna Lee",
  email: "anna@example.com",
  avatarUrl: avatarPortrait("Anna Lee"),
  phone: "+1 (555) 014-2231",
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
      phone: `+1 (555) ${h.int(100, 999)}-${h.int(1000, 9999)}`,
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
      email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@riverside.club`,
      avatarUrl: avatarPortrait("coach" + name),
      phone: `+1 (555) ${h.int(100, 999)}-${h.int(1000, 9999)}`,
      joinedAt: addDays(ANCHOR_DATE, -h.int(200, 1200)).toISOString(),
      specialties: h.sample(SPORT_LIST.map((s) => s.id), h.int(1, 2)),
      bio: "Certified coach with a decade of competitive and teaching experience.",
      rating: Number(h.float(4.3, 5).toFixed(1)),
      hourlyRate: h.pick([60, 70, 80, 90, 110]),
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
    price: 29, interval: "monthly", includedBookings: 4, accentColor: "#06b6d4", popular: false,
    perks: ["4 included bookings / mo", "Member booking rates", "Event access"],
  },
  {
    id: "plan_premier", orgId: org.id, name: "Premier", description: "For regulars who play every week.",
    price: 79, interval: "monthly", includedBookings: 16, accentColor: "#6366f1", popular: true,
    perks: ["16 included bookings / mo", "7-day advance booking", "Guest passes", "Priority waitlist", "Free clinics"],
  },
  {
    id: "plan_elite", orgId: org.id, name: "Elite", description: "Unlimited everything, white-glove.",
    price: 149, interval: "monthly", includedBookings: -1, accentColor: "#8b5cf6", popular: false,
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

/* ---- Reservations (around the anchor date) ---- */
function buildReservations(): Reservation[] {
  const out: Reservation[] = [];
  let n = 0;
  // span: 14 days back -> 10 days forward
  for (let day = -14; day <= 10; day++) {
    const date = addDays(ANCHOR_DATE, day);
    const perDay = h.int(8, 22);
    for (let i = 0; i < perDay; i++) {
      const court = h.pick(courts);
      const hour = h.int(6, 21);
      const start = atTime(date, hour);
      const end = atTime(date, hour + 1);
      const user = h.pick(members);
      const isPast = day < 0;
      const status = isPast
        ? h.pick(["completed", "completed", "completed", "cancelled", "no_show"] as const)
        : day === 0
          ? h.pick(["confirmed", "confirmed", "pending"] as const)
          : h.pick(["confirmed", "confirmed", "confirmed", "pending"] as const);
      out.push({
        id: `res_${++n}`,
        courtId: court.id,
        userId: user.id,
        sport: court.sport,
        start: start.toISOString(),
        end: end.toISOString(),
        status,
        price: court.hourlyRate,
        participants: [user.name, ...h.sample(members.map((m) => m.name), h.int(0, 3))],
        createdVia: h.pick(["web", "mobile", "admin"] as const),
      });
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
      courtId: h.pick(courts.filter((c) => c.sport === sport)).id,
      start: atTime(date, hour).toISOString(),
      end: atTime(date, hour + 2).toISOString(),
      capacity,
      registeredCount: h.int(2, capacity),
      price: h.pick([0, 15, 20, 25, 35]),
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
  const amount = h.pick([29, 79, 149, 20, 35, 56]);
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
    amount: h.pick([24, 28, 32, 29, 79, 149, 20, 35]),
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
    title: "A court just opened up", body: "Tennis 2 is free at 6:00 PM today. Claim it before it's gone.",
    read: false, createdAt: addDays(ANCHOR_DATE, 0).toISOString(), href: "/app/booking",
  },
  {
    id: "ntf_2", userId: currentUser.id, type: "booking",
    title: "Booking confirmed", body: "Padel 1 · Tomorrow, 7:00 PM is all set.",
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
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The single in-memory mock database. Mutated by mock mutations at runtime. */
export const db = {
  org,
  facilities,
  courts,
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
};

export type MockDB = typeof db;
