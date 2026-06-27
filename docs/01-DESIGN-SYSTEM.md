# Phase 2 — Design System ("Volley")

> Status: **AWAITING APPROVAL** · Source of truth = CSS custom properties; mirrored to Tailwind.
> Target: Tailwind v4 (CSS-first `@theme`) + shadcn/ui. Dark-mode-first.

The principle behind every token: **neutral, calm surfaces carry vibrant, purposeful accents.** Color is a spotlight, not wallpaper. We earn "premium" through restraint + a few high-impact glows, not rainbow everything.

---

## 1. Color tokens

### 1.1 Raw palette (primitives — never used directly in components)

```
--blue-500:#3B82F6  --indigo-500:#6366F1  --purple-500:#8B5CF6
--emerald-500:#10B981  --cyan-500:#06B6D4  --orange-500:#F59E0B
--pink-500:#EC4899     --rose-500:#F43F5E  --lime-400:#A3E635

--ink-950:#080B14  --ink-900:#0B0F19  --ink-850:#0E1320  --ink-800:#111827
--slate-50:#F8FAFC --slate-300:#CBD5E1 --slate-400:#94A3B8 --slate-500:#64748B
```

### 1.2 Semantic tokens (USE THESE)

```
/* Backgrounds (layered elevation) */
--bg-canvas:      #080B14   /* page base — the void */
--bg-surface:     #0B0F19   /* default panels/sections */
--bg-raised:      #111827   /* cards, inputs */
--bg-overlay:     rgba(8,11,20,.72)        /* modal scrim */
--bg-glass:       rgba(255,255,255,.04)    /* glass fill */

/* Borders (hairline system) */
--border-subtle:  rgba(255,255,255,.06)
--border-default: rgba(255,255,255,.10)
--border-strong:  rgba(255,255,255,.16)
--border-glow:    rgba(99,102,241,.45)     /* indigo edge on focus/important */

/* Text */
--text-primary:   #F8FAFC
--text-secondary: #94A3B8
--text-tertiary:  #64748B
--text-onAccent:  #FFFFFF
--text-disabled:  rgba(148,163,184,.45)

/* Brand */
--brand:          #6366F1                  /* solid fallback */
--brand-from:     #3B82F6
--brand-via:      #6366F1
--brand-to:       #8B5CF6

/* State */
--success:#10B981  --warning:#F59E0B  --danger:#F43F5E  --info:#06B6D4

/* Accents (focus/highlight only) */
--accent-emerald:#10B981 --accent-cyan:#06B6D4
--accent-orange:#F59E0B  --accent-pink:#EC4899
```

### 1.3 Sport accents (differentiator — drives per-sport theming)

```
--sport-tennis:#A3E635   --sport-pickleball:#F59E0B
--sport-padel:#06B6D4    --sport-badminton:#8B5CF6
--sport-squash:#EC4899
```
Each sport surface sets `--sport-accent` to one of these; court visuals, badges, and selection states read from `--sport-accent` so a screen re-themes by changing one variable.

### 1.4 Gradients & meshes (signature surfaces)

```
--grad-brand:   linear-gradient(135deg,#3B82F6 0%,#6366F1 50%,#8B5CF6 100%)
--grad-brand-soft: linear-gradient(135deg,rgba(59,130,246,.18),rgba(139,92,246,.18))
--grad-text:    linear-gradient(120deg,#fff 0%,#CBD5E1 60%,#8B5CF6 100%)
--grad-cta-glow: radial-gradient(60% 120% at 50% 0%,rgba(99,102,241,.55),transparent 70%)

/* Page mesh — three radial blobs over canvas */
--mesh-bg:
  radial-gradient(40% 50% at 15% 10%, rgba(59,130,246,.16), transparent 60%),
  radial-gradient(35% 45% at 85% 15%, rgba(139,92,246,.14), transparent 60%),
  radial-gradient(50% 60% at 50% 100%, rgba(6,182,212,.10), transparent 60%),
  var(--bg-canvas);
```

---

## 2. Spacing scale (4px base)

```
0=0  px=1  0.5=2  1=4  1.5=6  2=8  2.5=10  3=12  4=16  5=20
6=24  7=28  8=32  10=40  12=48  14=56  16=64  20=80  24=96  32=128
```
**Layout rhythm:** section padding `py-24` desktop / `py-16` mobile; card padding `p-6`; control gap `gap-3`; page gutter `px-6` mobile → `px-8` tablet → centered `max-w-7xl` desktop. Generous whitespace is a feature — it's how we read as premium vs CourtReserve's density.

---

## 3. Typography

**Display/UI font:** Geist (fallback Inter). **Mono:** Geist Mono (data, court times, codes).

```
Family:  --font-sans: 'Geist', Inter, system-ui;  --font-mono:'Geist Mono', ui-monospace

Scale (clamp = fluid responsive):
display   clamp(2.75rem,6vw,4.5rem)   weight 700  tracking -0.03em  leading 1.02
h1        clamp(2rem,4vw,3rem)        700  -0.02em  1.08
h2        clamp(1.5rem,3vw,2.25rem)   700  -0.02em  1.15
h3        1.5rem    600  -0.01em  1.25
h4        1.25rem   600   0       1.3
body-lg   1.125rem  400   0       1.6
body      1rem      400   0       1.6
body-sm   0.875rem  400   0       1.55
caption   0.8125rem 500   0.01em  1.4
overline  0.75rem   600   0.12em  1.4  UPPERCASE
```
**Rules:** display/h1 use `--grad-text` for headline pop; body uses `--text-secondary`; never put long body in pure white. Numerals in data use `tabular-nums`.

---

## 4. Radii

```
--r-sm:8  --r-md:12  --r-lg:16  --r-xl:20  --r-2xl:24  --r-3xl:32  --r-full:9999
```
Defaults: inputs/buttons `--r-md`→`--r-lg`; cards `--r-2xl`; modals `--r-3xl`; pills/avatars `--r-full`. Generous, consistent rounding = the "soft luxury" feel.

---

## 5. Shadows & glows

```
/* Elevation (cool-tinted, never pure black) */
--sh-1: 0 1px 2px rgba(2,6,18,.4)
--sh-2: 0 4px 16px -4px rgba(2,6,18,.5)
--sh-3: 0 12px 32px -8px rgba(2,6,18,.6)
--sh-4: 0 24px 64px -16px rgba(2,6,18,.7)

/* Glows (accent-tinted — for CTAs & focus) */
--glow-brand:  0 8px 32px -6px rgba(99,102,241,.55)
--glow-emerald:0 8px 32px -6px rgba(16,185,129,.5)
--glow-pink:   0 8px 32px -6px rgba(236,72,153,.5)

/* Glass recipe */
--glass: background:var(--bg-glass); backdrop-filter:blur(16px) saturate(140%);
         border:1px solid var(--border-default);
```
**Usage:** elevation for hierarchy; glow ONLY on primary CTAs, active selections, and important/featured cards. Glow everywhere = glow nowhere.

---

## 6. Motion tokens

```
Durations:  --d-fast:150ms  --d-base:220ms  --d-slow:320ms  --d-slower:520ms
Easings:    --e-out: cubic-bezier(.16,1,.3,1)        /* signature decelerate */
            --e-inout: cubic-bezier(.65,0,.35,1)
            --e-spring(framer): {type:'spring',stiffness:380,damping:30,mass:.8}

Framer presets (components/motion):
  reveal:    initial{opacity:0,y:16} animate{opacity:1,y:0} d:--d-slow e:--e-out
  stagger:   container staggerChildren:.06 delayChildren:.04
  hoverLift: whileHover{y:-4,scale:1.01} transition:spring
  press:     whileTap{scale:.97}
  pageX:     fade+8px y, d:--d-base
  counter:   animate number 0→value over 900ms ease-out
  shimmer:   skeleton sweep 1.4s linear infinite
```
**Discipline:** every interactive element animates on hover + press; reveals fire once on scroll-in (not on every re-render); respect `prefers-reduced-motion` (disable transforms, keep opacity). Motion should feel *expensive*, never busy.

---

## 7. Effects & layout primitives

```
--blur-glass:16px  --blur-overlay:8px
--z: dropdown 1000 · sticky 1100 · drawer 1200 · modal 1300 · toast 1400 · tooltip 1500
Breakpoints (Tailwind): sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536 · 3xl 1792(ultrawide)
Container: max-w-7xl (1280) content; max-w-[1600px] dashboards.
Focus ring: 2px var(--brand) + 2px offset (canvas-colored) — visible, premium, a11y-compliant.
```

Signature background components (specs for Phase 4):
- **`<MeshBackground/>`** — fixed `--mesh-bg`, optional animated blob drift (20s ease-in-out loop).
- **`<GlowBlob/>`** — absolutely-positioned blurred radial, configurable color/size/position; the building block of hero atmosphere.
- **`<GradientText/>`**, **`<GlassCard/>`**, **`<GlowBorder/>`** (1px gradient ring via mask).

---

## 8. Component design specs (drives Phase 4)

**Button**
| Variant | Look | Use |
|---|---|---|
| `primary` | `--grad-brand` fill, white text, `--glow-brand`, hover brightness+lift, press scale .97 | main CTA |
| `secondary` | glass fill, `--border-default`, hover border-strong | secondary |
| `ghost` | transparent, hover `bg-white/5` | tertiary/nav |
| `destructive` | rose fill + rose glow | delete |
| `sport` | `--sport-accent` tinted fill | book actions |

Sizes: sm(h-9) · md(h-10) · lg(h-12) · icon(square). All: `--r-lg`, `--font-sans` 600, `--e-out`, focus ring.

**Card** — base `bg-raised`, `--r-2xl`, `--border-subtle`, `--sh-2`. Variants: `glass` (glass recipe), `interactive` (hoverLift + border-strong + `--sh-3`), `featured` (GlowBorder + `--glow-brand`). Anatomy: `Header/Title/Description · Content · Footer`.

**Input/Textarea/Select** — `bg-surface`, `--border-default`, `--r-md`, h-10/11, placeholder `--text-tertiary`; focus → `--border-glow` + ring; error → rose border + helper text. Label `caption`. Built on RHF + Zod.

**Table** — `--r-2xl` container, sticky header (`bg-surface/80` + blur), spacious rows (h-14), zebra via `--border-subtle`, row hover `bg-white/[.03]`, status cells use Badge. Right-align numerics (`tabular-nums`).

**Badge/Chip** — pill, `--r-full`, tinted `bg-{accent}/12` + `text-{accent}` + `border-{accent}/20`. Status map: confirmed→emerald, pending→orange, cancelled→rose, completed→slate, waitlist→cyan.

**Modal/Sheet** — scrim `--bg-overlay`+blur; panel glass, `--r-3xl`, `--sh-4`, enter = reveal+spring; Sheet slides from right (mobile = bottom).

**Charts** — transparent bg, no gridlines except subtle horizontal `--border-subtle`; series use accent palette; area charts use gradient fill (accent→transparent); custom glass tooltip with `--sh-3`; animated draw-in on mount. **Heatmap** (utilization) = custom grid, cell color interpolates `--bg-raised`→`--brand`.

**Loaders** — `Skeleton` (shimmer sweep, matches final radius), `Spinner` (brand gradient conic), route-level `Suspense` fallbacks, optimistic UI on mutations.

**Shell** — Sidebar: `bg-surface`, glass top logo, nav items with active = `--grad-brand-soft` + left glow bar; collapsible to icons; mobile = bottom tab bar (portal) / drawer (admin). Topbar: glass, sticky, search + notifications + avatar menu.

**Empty states** — illustrated/iconographic, one line of personality + a primary CTA. Never a bare "No data."

---

## 9. Accessibility & quality bar (baked into tokens)

- Body text meets WCAG AA on dark surfaces (`--text-secondary` on `--bg-raised` ≥ 4.5:1).
- Visible focus ring on every interactive element; never `outline:none` without replacement.
- `prefers-reduced-motion` honored globally.
- Min tap target 44×44 on mobile controls.
- Color never the sole signal — pair with icon/label (status badges carry text).
