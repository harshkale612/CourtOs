# Phase 1 — Product Architecture

> Status: **AWAITING APPROVAL** · Frontend-only MVP · Next.js App Router + TypeScript
> Working brand name (placeholder, swappable): **Volley**

---

## 0. Pre-Phase Strategy

### 0.1 Competitor weaknesses (CourtReserve)

CourtReserve is feature-complete and entrenched, but it is beatable on experience. Honest category critique:

| Weakness | Why it hurts | Our wedge |
|---|---|---|
| **Dated, dense UI** | Looks like 2014 enterprise software; tables-on-tables, gray-on-gray. | Premium dark-mode, spacious, motion-rich UI. First-5-seconds wow. |
| **Steep admin learning curve** | Owners need onboarding calls; settings are buried. | Guided onboarding wizard, progressive disclosure, sane defaults. |
| **Clunky booking flow** | Multi-step, page reloads, poor mobile ergonomics. | Single-surface booking with live court grid, optimistic UI, ≤3 taps. |
| **Mediocre mobile experience** | Member app feels like a wrapped web view. | Mobile-first, thumb-reachable booking, native-feeling transitions. |
| **Visually flat analytics** | Data is present but not insightful or beautiful. | Colorful, narrative dashboards — utilization heatmaps, revenue trends. |
| **One-size UI across sports** | Tennis-centric; padel/pickleball feel bolted on. | Sport-aware theming and court visuals per sport. |
| **Utilitarian brand** | No emotional pull; feels like a utility bill. | Strong brand identity, delight, "club concierge" tone. |

**Strategic read:** We do *not* win by matching their feature breadth in an MVP. We win by making the **80% of daily actions** (find a court → book → pay → manage) feel effortless and premium, and by making the admin feel *in control* rather than buried.

### 0.2 Product improvements we should ship

1. **Live court grid booking** — a real-time timeline/grid (rows = courts, columns = time) instead of a form. This is the single most important UX bet. CourtReserve's booking is a form; ours is a *canvas*.
2. **Sport-aware experience** — each sport (tennis/pickleball/padel/badminton/squash) gets its own accent color, court geometry, and iconography. Multi-sport clubs feel first-class.
3. **Smart waitlist + auto-rebook** — if a slot frees, the next waitlisted member is offered it with a one-tap claim and a countdown. Turns frustration into delight.
4. **Frictionless reschedule** — drag a reservation to a new slot (admin) / two-tap reschedule (member) instead of cancel-and-rebook.
5. **Insightful analytics, not just charts** — utilization heatmap (day×hour), revenue per court, peak-demand pricing suggestions, member churn risk.
6. **Concierge tone + delight** — animated counters, celebratory confirmations, empty states with personality. The product should feel like a premium club, not a SaaS form.
7. **Speed as a feature** — optimistic mutations, skeletons, prefetch on hover. Perceived instant.

### 0.3 Visual brand identity proposal

**Name:** I recommend a real brand over "Court-Reserve-2." Proposed primary: **Volley** — short, energetic, works across all racquet sports, brandable, premium. Alternates: *Baseline, Rally, Ace, Deuce*. (Final call is yours; the design system is name-agnostic.)

**Brand essence:** *The premium operating system for racquet clubs.* Confident, athletic, luxurious, alive.

**Logo direction:** A minimal mark — an abstracted ball/arc in motion forming a "V," rendered in the blue→purple gradient with a soft glow. Monoline, scales to favicon.

**Mood:** Luxury dark mode + vibrant athletic energy. Think Linear's restraint × Stripe's polish × a courtside floodlight at night.

**Core palette (locked for Phase 2):**

- Backgrounds: `#080B14` (canvas) → `#0B0F19` (surface) → `#111827` (raised)
- Brand gradient: Blue `#3B82F6` → Indigo `#6366F1` → Purple `#8B5CF6`
- Accents: Emerald `#10B981`, Cyan `#06B6D4`, Orange `#F59E0B`, Pink `#EC4899`
- **Sport accents** (a differentiator): Tennis `#A3E635` (lime), Pickleball `#F59E0B` (orange), Padel `#06B6D4` (cyan), Badminton `#8B5CF6` (purple), Squash `#EC4899` (pink)

**Surface language:** layered radial mesh-gradient backgrounds with floating glow blobs, glassmorphic raised cards, hairline (1px) gradient borders on hero/important cards, neon-edged CTA buttons.

**Typography:** Geist (or Inter) — oversized bold display headlines, tight tracking; calm, high-legibility body.

---

## 1. Architecture overview

**Pattern:** A single Next.js App Router application hosting **three apps via route groups**, sharing one design system and data layer.

**Why one app, not three repos:**
- Shared design system, types, and mock API — zero duplication.
- Instant cross-app linking (marketing → signup → portal).
- Simpler MVP ops; we can split to subdomains later via middleware without rewriting code.

**Route-group boundaries:**
- `(marketing)` — public, SEO/marketing, light layout.
- `(portal)` — authenticated member experience, app shell with sidebar.
- `(admin)` — authenticated B2B dashboard, denser app shell.
- `(auth)` — login/signup/onboarding, minimal centered layout.

> **Decision I'm flagging:** For the MVP we use **route groups + a mock auth/role gate**, not real subdomains or middleware-enforced auth. It's faster, fully demoable, and the seam (a single `requireRole` guard + layout) is where we'd later insert real auth. Calling this out so we don't over-engineer Phase 3.

---

## 2. Route structure

```
/                                  → Marketing home
/features                          → Features
/pricing                           → Pricing
/testimonials                      → Testimonials
/blog                              → Blog index
/blog/[slug]                       → Blog post
/demo                              → Demo booking
/contact                           → Contact

/login                             → Login
/signup                            → Signup
/forgot-password                   → Forgot password
/onboarding                        → Role selection + setup wizard

/app                               → Member dashboard
/app/booking                       → Court booking (live grid) ★ flagship
/app/reservations                  → My reservations (upcoming/past)
/app/events                        → Events / clinics / leagues
/app/events/[id]                   → Event detail + registration
/app/membership                    → Membership management
/app/payments                      → Payment methods + history
/app/notifications                 → Notifications
/app/profile                       → Profile
/app/settings                      → Member settings

/admin                             → Admin dashboard (KPIs)
/admin/courts                      → Court management
/admin/reservations                → Reservation management (calendar/grid)
/admin/members                     → Members directory
/admin/coaches                     → Coaches
/admin/plans                       → Membership plans
/admin/events                      → Events management
/admin/billing                     → Billing & revenue
/admin/analytics                   → Analytics (heatmaps, trends)
/admin/settings                    → Org settings
```

---

## 3. Folder tree

```
court-reserve/
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/            # public site + its layout.tsx
│  │  ├─ (auth)/                 # login/signup/onboarding + minimal layout
│  │  ├─ (portal)/app/           # member portal + app-shell layout
│  │  ├─ (admin)/admin/          # admin dashboard + dashboard-shell layout
│  │  ├─ layout.tsx              # root: fonts, providers, <html>
│  │  └─ globals.css             # tailwind + design tokens (CSS vars)
│  │
│  ├─ components/
│  │  ├─ ui/                     # design-system primitives (Phase 4)
│  │  │                          #   button, card, input, dialog, table,
│  │  │                          #   sheet, tabs, badge, skeleton, toast…
│  │  ├─ shell/                  # sidebar, topbar, nav, mobile-nav
│  │  ├─ charts/                 # recharts wrappers (area, bar, heatmap, donut)
│  │  ├─ motion/                 # reveal, stagger, counter, page-transition
│  │  └─ brand/                  # logo, glow-blob, mesh-bg, gradient-text
│  │
│  ├─ features/                  # feature modules (vertical slices)
│  │  ├─ booking/                #   components, hooks, grid logic, store
│  │  ├─ reservations/
│  │  ├─ events/
│  │  ├─ membership/
│  │  ├─ payments/
│  │  ├─ courts/                 # admin court mgmt
│  │  ├─ members/
│  │  ├─ coaches/
│  │  ├─ plans/
│  │  ├─ billing/
│  │  ├─ analytics/
│  │  └─ marketing/              # hero, feature sections, pricing table…
│  │
│  ├─ lib/
│  │  ├─ api/                    # mock API: client + endpoint modules
│  │  ├─ mock/                   # seed data + generators (faker-style)
│  │  ├─ query/                  # TanStack Query keys, client, hooks helpers
│  │  ├─ utils/                  # cn(), date, currency, formatting
│  │  └─ constants/              # sports, roles, statuses, nav config
│  │
│  ├─ stores/                    # zustand: ui, booking-draft, auth-mock, filters
│  ├─ types/                     # shared domain types (Section 4)
│  ├─ hooks/                     # cross-feature hooks (useMediaQuery, etc.)
│  ├─ providers/                 # QueryProvider, ThemeProvider, ToastProvider
│  └─ config/                    # site config, design tokens (TS mirror)
│
├─ public/                       # static assets, og images
├─ docs/                         # architecture, design system docs
└─ <config files>                # next, tailwind, ts, eslint, prettier
```

**Conventions**
- **Feature-first**: each feature owns its components/hooks/store/types. Cross-feature reuse promotes to `components/ui` or `lib`.
- **Server state** lives in TanStack Query; **client/UI state** in Zustand. Never duplicate.
- Domain types are centralized in `types/` (single source of truth for mock + UI).

---

## 4. Data models (domain types)

Multi-tenant by `Organization`. All IDs are branded strings in code.

```ts
// Core enums
Sport        = 'tennis' | 'pickleball' | 'padel' | 'badminton' | 'squash'
Role         = 'owner' | 'admin' | 'coach' | 'member'
CourtSurface = 'hard' | 'clay' | 'grass' | 'turf' | 'acrylic' | 'wood'
Environment  = 'indoor' | 'outdoor'
BookingStatus= 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show'
WaitStatus   = 'waiting' | 'offered' | 'claimed' | 'expired'
PlanInterval = 'monthly' | 'quarterly' | 'annual'
PayStatus    = 'paid' | 'due' | 'failed' | 'refunded'
EventType    = 'clinic' | 'league' | 'tournament' | 'open_play' | 'lesson'

Organization { id, name, slug, logoUrl, timezone, currency, sports[] }
Facility     { id, orgId, name, address, environmentDefault }
Court        { id, facilityId, name, sport, surface, environment,
               isActive, openTime, closeTime, hourlyRate, imageUrl }

User         { id, orgId, role, name, email, avatarUrl, phone, joinedAt }
Coach        { id (User), specialties: Sport[], bio, rating, hourlyRate,
               availability: TimeBlock[] }

MembershipPlan { id, orgId, name, description, price, interval,
                 perks[], includedBookings, accentColor, popular }
Membership     { id, userId, planId, status, startedAt, renewsAt, autoRenew }

Reservation  { id, courtId, userId, sport, start, end, status, price,
               participants[], notes, createdVia }
WaitlistEntry{ id, courtId, userId, requestedStart, requestedEnd,
               status, position, offerExpiresAt }
PricingRule  { id, orgId, scope(sport|court), dayOfWeek[], startTime,
               endTime, multiplier|flatRate, memberTier? }

Event        { id, orgId, type, sport, title, coverUrl, description,
               coachId?, courtId?, start, end, capacity, price,
               skillLevel, registeredCount }
EventRegistration { id, eventId, userId, status, registeredAt }

PaymentMethod{ id, userId, brand, last4, expMonth, expYear, isDefault }
Invoice      { id, orgId, userId, amount, status, dueAt, paidAt, lineItems[] }
Transaction  { id, orgId, userId, amount, type, status, method, createdAt }

Notification { id, userId, type, title, body, read, createdAt, href? }
```

**Relationships (text ERD):**
`Organization 1─* Facility 1─* Court 1─* Reservation *─1 User`
`Court 1─* WaitlistEntry *─1 User` · `User 1─1 Membership *─1 MembershipPlan`
`Event 1─* EventRegistration *─1 User` · `User 1─* Invoice 1─* Transaction`
`Coach (is-a User) 1─* Event` · `PricingRule *─1 Organization`

---

## 5. Feature boundaries

| Module | Owns | Consumes | App |
|---|---|---|---|
| `booking` | court grid, slot selection, draft store, availability | courts, pricing, reservations API | portal |
| `reservations` | upcoming/past lists, cancel, reschedule | booking, reservations API | portal |
| `events` | listing, detail, registration | events API | portal/admin |
| `membership` | plan compare, current plan, upgrade | plans, payments | portal |
| `payments` | methods, history, invoices | payments API | portal |
| `courts` | CRUD, availability, pricing | courts/pricing API | admin |
| `members` | directory, profiles, membership status | users/membership API | admin |
| `coaches` | roster, availability, assignment | coaches API | admin |
| `plans` | plan CRUD, perks, pricing | plans API | admin |
| `billing` | revenue, invoices, payouts | transactions API | admin |
| `analytics` | KPIs, heatmaps, trends | aggregated read API | admin |
| `marketing` | hero, sections, pricing table, CTA | static/config | marketing |

**Rule:** features never import each other's internals — only their public `index.ts` or shared `lib/api`. Prevents the spaghetti that makes CourtReserve hard to evolve.

---

## 6. Dependency graph (layers)

```
                ┌────────────────────────────────────────┐
                │  App routes  (app/(group)/…/page.tsx)   │
                └───────────────┬────────────────────────┘
                                │ compose
                ┌───────────────▼────────────────────────┐
                │  Feature modules (features/*)           │
                │  components · hooks · feature stores     │
                └──────┬───────────────┬──────────┬──────┘
                       │               │          │
        ┌──────────────▼───┐  ┌────────▼─────┐  ┌─▼──────────────┐
        │ UI primitives    │  │ Data hooks   │  │ Client stores  │
        │ components/ui    │  │ TanStack Q   │  │ zustand        │
        │ charts · motion  │  │ (server      │  │ (UI/draft/     │
        │ brand · shell    │  │  state)      │  │  filters)      │
        └──────────┬───────┘  └──────┬───────┘  └────────────────┘
                   │                 │
                   │          ┌──────▼───────┐
                   │          │ lib/api      │  ← mock client (latency,
                   │          │ (services)   │     errors, pagination)
                   │          └──────┬───────┘
                   │          ┌──────▼───────┐
                   │          │ lib/mock     │  ← seed data + generators
                   │          └──────────────┘
        ┌──────────▼──────────────────────────────────┐
        │ Foundations: types · lib/utils · config ·    │
        │ design tokens (globals.css + TS mirror)      │
        └──────────────────────────────────────────────┘
```

**Direction is strictly downward.** Routes → features → (ui | data | stores) → lib/api → mock → foundations. No upward or sideways feature imports. This is the contract that keeps velocity high through Phases 5–9.

---

## 7. Build order & where I'd push back

- Phases 5–9 each consume Phase 2–4 outputs; if the design system or primitives are weak, every later screen inherits it. **So Phase 2 (tokens) and Phase 4 (primitives) get extra rigor.**
- **Booking (Phase 7) is the flagship.** I propose we budget the most effort there and treat it as the demo centerpiece, even if it means trimming polish elsewhere in the MVP.
- **Pushback on scope:** building all 3 apps to equal fidelity is a lot. My recommendation: marketing home + booking + admin analytics are the three "wow" surfaces that win demos; the rest should be high-quality but not gold-plated. Flagging now so we spend effort where it converts.

---

## 8. Tech-stack role assignment (confirming the seams)

| Tool | Role |
|---|---|
| Next.js App Router | routing, layouts, RSC-where-static |
| TypeScript | domain types as source of truth |
| Tailwind + shadcn/ui | styling + accessible primitive base |
| **TanStack Query** | **all server state** (reads, mutations, cache) |
| **Zustand** | **client/UI state only** (booking draft, filters, modals) |
| Framer Motion | motion system (reveal, transitions, micro-interactions) |
| React Hook Form + Zod | forms + validation (auth, admin CRUD, demo booking) |
| Recharts | analytics/charts (+ custom heatmap) |
| Lucide | icon set |

Clean separation of TanStack Query (server cache) vs Zustand (ephemeral UI) is deliberate — it's the most common source of state bugs and we're designing it out up front.
