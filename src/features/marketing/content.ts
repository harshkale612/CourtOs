import type { Sport } from "@/types";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Validated Unsplash assets (IDs confirmed reachable). */
export const MARKETING_IMAGES = {
  heroAtmosphere: img("1542144582-1ba00456b5e3", 1600),
  sports: {
    tennis: img("1530915365347-e35b749a0381"),
    pickleball: img("1611251135345-18c56206b863"),
    padel: img("1593766827228-8737b4534aa6"),
    badminton: img("1521587760476-6c12a4b040da"),
    squash: img("1558365849-6ebd8b0454b2"),
  } as Record<Sport, string>,
  blog: [
    img("1431324155629-1a6deb1dec8d", 900),
    img("1499951360447-b19be8fe80f5", 900),
    img("1517649763962-0c623066013b", 900),
  ],
};

export interface Feature {
  icon: string;
  title: string;
  description: string;
  accent: string;
}

export const FEATURES: Feature[] = [
  {
    icon: "calendar-plus",
    title: "Live court-grid booking",
    description:
      "A real-time canvas — not a form. Members see every court and slot at a glance and book in two taps.",
    accent: "var(--accent-blue)",
  },
  {
    icon: "zap",
    title: "Smart waitlist & auto-rebook",
    description:
      "When a slot frees up, the next member is offered it instantly with a one-tap claim and a live countdown.",
    accent: "var(--accent-orange)",
  },
  {
    icon: "badge-check",
    title: "Memberships that sell themselves",
    description:
      "Beautiful plan tiers, included credits, guest passes, and automatic renewals — all configurable.",
    accent: "var(--accent-emerald)",
  },
  {
    icon: "trophy",
    title: "Events, leagues & clinics",
    description:
      "Spin up open play, ladders, and tournaments with capacity, skill levels, and instant registration.",
    accent: "var(--accent-pink)",
  },
  {
    icon: "bar-chart-3",
    title: "Analytics that tell a story",
    description:
      "Utilization heatmaps, revenue trends, and peak-demand insights — pricing decisions made obvious.",
    accent: "var(--accent-purple)",
  },
  {
    icon: "credit-card",
    title: "Payments, done right",
    description:
      "Saved cards, automatic invoicing, refunds, and revenue tracking — no spreadsheets required.",
    accent: "var(--accent-cyan)",
  },
];

/** Long-form storytelling blocks (features page + home). */
export const FEATURE_STORIES = [
  {
    eyebrow: "Booking",
    title: "Booking so good, members open the app just to use it.",
    body: "The live court grid shows availability across every court and sport in real time. Drag to pick a slot, see the price update instantly, and confirm with optimistic UI that feels native. No reloads. No friction.",
    bullets: ["Real-time availability", "Two-tap booking", "Reschedule by drag", "Guest invites"],
    accent: "var(--accent-blue)",
  },
  {
    eyebrow: "Operations",
    title: "Run the whole club from one beautiful console.",
    body: "Courts, reservations, members, coaches, pricing rules, and events — managed from an admin dashboard that's actually a pleasure to use. Sensible defaults, guided setup, and zero training calls.",
    bullets: ["Drag-to-reschedule", "Dynamic pricing rules", "Member CRM", "Coach scheduling"],
    accent: "var(--accent-emerald)",
  },
  {
    eyebrow: "Growth",
    title: "Insights that turn courts into revenue.",
    body: "See exactly when your courts sit empty and when demand spikes. CourtOS surfaces utilization heatmaps and revenue trends so you can price peak hours right and fill the off-peak.",
    bullets: ["Utilization heatmaps", "Revenue forecasting", "Churn signals", "Peak-demand pricing"],
    accent: "var(--accent-purple)",
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  club: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We switched from a clunky legacy system and our booking volume jumped 28% in the first month. Members constantly tell us how good it feels.",
    name: "Maria Alvarez",
    role: "General Manager",
    club: "Lakeside Tennis & Padel",
    rating: 5,
  },
  {
    quote:
      "The analytics alone paid for CourtOS. We finally price peak hours correctly and our courts are full when they used to sit empty.",
    name: "David Chen",
    role: "Owner",
    club: "Metro Pickleball Club",
    rating: 5,
  },
  {
    quote:
      "Onboarding took an afternoon, not a quarter. The admin dashboard is the first one my staff didn't need training to use.",
    name: "Priya Nair",
    role: "Operations Lead",
    club: "Court 9 Racquet Center",
    rating: 5,
  },
  {
    quote:
      "The waitlist auto-rebook is magic. Cancellations used to mean empty courts — now they refill themselves in seconds.",
    name: "Tom Becker",
    role: "Director",
    club: "Harbor Squash Academy",
    rating: 5,
  },
  {
    quote:
      "It just looks expensive. Prospective members tour the club, see the app, and sign up on the spot. It sells the brand for us.",
    name: "Sofia Romano",
    role: "Founder",
    club: "Ace Badminton Collective",
    rating: 5,
  },
  {
    quote:
      "Events used to be a spreadsheet nightmare. Now I launch a clinic in two minutes and it fills before I close my laptop.",
    name: "James Whitfield",
    role: "Head Coach",
    club: "Riverside Racquet Club",
    rating: 5,
  },
];

export const STATS = [
  { label: "Bookings processed", value: 2_400_000, suffix: "+" },
  { label: "Clubs powered", value: 1_200, suffix: "+" },
  { label: "Avg. utilization lift", value: 31, suffix: "%" },
  { label: "Member satisfaction", value: 98, suffix: "%" },
];

export const LOGOS = [
  "Lakeside",
  "Metro Club",
  "Court 9",
  "Harbor",
  "Ace Collective",
  "Baseline",
];

export const FAQS = [
  {
    q: "Can I manage multiple sports and locations?",
    a: "Yes. CourtOS is built multi-sport and multi-facility from day one — tennis, pickleball, padel, badminton, and squash, each with its own theming and court layouts.",
  },
  {
    q: "How long does setup take?",
    a: "Most clubs are live within a day. Our guided onboarding wizard imports your courts, plans, and members with sensible defaults you can tweak anytime.",
  },
  {
    q: "Do members need to download an app?",
    a: "No. CourtOS is a fast, installable web app that works beautifully on any device — no app store friction for your members.",
  },
  {
    q: "Can I migrate from CourtReserve or another system?",
    a: "Absolutely. We provide guided imports for courts, members, and memberships so you can switch without losing history.",
  },
];

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  readingTime: string;
  date: string;
  cover: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "fill-your-off-peak-courts",
    title: "How to fill your off-peak courts (without discounting to zero)",
    excerpt:
      "Five data-backed tactics that turn dead afternoon hours into reliable, profitable bookings.",
    category: "Growth",
    author: "Maria Alvarez",
    readingTime: "6 min read",
    date: "2026-06-12",
    cover: MARKETING_IMAGES.blog[0],
  },
  {
    slug: "designing-a-booking-flow-members-love",
    title: "Designing a booking flow members actually love",
    excerpt:
      "The difference between a form and a canvas — and why it changes member behavior.",
    category: "Product",
    author: "David Chen",
    readingTime: "5 min read",
    date: "2026-05-28",
    cover: MARKETING_IMAGES.blog[1],
  },
  {
    slug: "the-economics-of-peak-pricing",
    title: "The economics of peak pricing for racquet clubs",
    excerpt:
      "A practical framework for pricing prime time without alienating your regulars.",
    category: "Operations",
    author: "Priya Nair",
    readingTime: "8 min read",
    date: "2026-05-09",
    cover: MARKETING_IMAGES.blog[2],
  },
];
