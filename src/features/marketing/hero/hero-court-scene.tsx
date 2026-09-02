"use client";

import { useRef } from "react";
import { motion, useInView, useTransform, type MotionValue } from "framer-motion";
import {
  PREVIEW_BOOKINGS,
  PREVIEW_COURTS,
  PREVIEW_HOURS,
  type PreviewBooking,
} from "../preview-data";
import { useIdleProgress } from "../use-idle-progress";
import { EASE_OUT as EASE, EASE_OUT_FN as EASE_FN } from "./ease";

/* --------------------------------------------------------------------------
 * The signature interaction: a court that becomes the schedule.
 *
 * The geometry is chosen so the transformation is literal rather than a swap.
 * A tennis court's own markings already *are* a grid — its doubles sidelines,
 * singles sidelines and centre service line sit exactly where four court
 * columns divide, and its service lines sit exactly on two of the five hour
 * rows. Scrolling only adds the lines that were missing, then fills them with
 * real bookings. The net doesn't disappear either: it becomes the now-line.
 * -------------------------------------------------------------------------- */

const X = [60, 280, 500, 720, 940]; // court verticals === booking columns
const COURT_ROWS = [30, 122, 398, 490]; // baselines + service lines
const GRID_ROWS = [214, 306]; // the two rows the court was missing
const NET_Y = 260;
const ROW_H = 92;
const COL_W = 220;

/** Fallback tier: each group fades in on its own beat, once, in view. */
const group = {
  hidden: { opacity: 0 },
  show: (delay: number) => ({ opacity: 1, transition: { duration: 0.55, delay, ease: EASE } }),
};

const blockIn = {
  hidden: { opacity: 0, y: 10 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: EASE } }),
};

export function HeroCourtScene({
  p,
  mx,
  my,
}: {
  p: MotionValue<number> | null;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const drive = useIdleProgress(p);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const driven = p !== null;

  // The court tilts into perspective as it becomes a plane of data.
  const rotateX = useTransform(drive, [0.1, 0.44], [0, 16], { ease: EASE_FN });
  // The handoff to the dashboard is a short, eased dissolve rather than a
  // long double-exposure: the two grids never fully align, so keeping them
  // both crisp and at high opacity for long reads as a rendering glitch. A
  // brief defocus sells it as an intentional cut instead.
  const sceneOpacity = useTransform(drive, [0, 0.06, 0.58, 0.66], [0.9, 1, 1, 0], { ease: EASE_FN });
  const sceneScale = useTransform(drive, [0.06, 0.44, 0.66], [1.04, 1, 0.96], { ease: EASE_FN });
  const sceneBlur = useTransform(drive, [0.54, 0.66], [0, 10]);
  const sceneFilter = useTransform(sceneBlur, (v) => `blur(${v}px)`);
  const parallaxX = useTransform(mx, [-1, 1], [-12, 12]);
  const parallaxY = useTransform(my, [-1, 1], [-8, 8]);

  const courtOpacity = useTransform(drive, [0, 0.12, 0.32, 0.6], [0.16, 0.42, 0.85, 0.5], { ease: EASE_FN });
  const gridOpacity = useTransform(drive, [0.3, 0.46], [0, 0.75], { ease: EASE_FN });
  const ticksOpacity = useTransform(drive, [0.38, 0.5], [0, 1], { ease: EASE_FN });
  const ticksX = useTransform(drive, [0.38, 0.5], [-34, 0], { ease: EASE_FN });
  const headersOpacity = useTransform(drive, [0.4, 0.52], [0, 1], { ease: EASE_FN });
  const netOpacity = useTransform(drive, [0, 0.34, 0.46], [0.55, 0.55, 0], { ease: EASE_FN });
  const nowOpacity = useTransform(drive, [0.44, 0.56], [0, 1], { ease: EASE_FN });

  const play = driven ? undefined : inView ? "show" : "hidden";

  return (
    <div ref={ref} className="w-full [perspective:1400px]">
      <motion.div
        initial={driven ? false : { opacity: 0, y: 28 }}
        animate={driven ? undefined : inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: EASE }}
        style={
          driven
            ? {
                rotateX,
                opacity: sceneOpacity,
                scale: sceneScale,
                filter: sceneFilter,
                x: parallaxX,
                y: parallaxY,
                transformStyle: "preserve-3d",
                willChange: "transform",
              }
            : undefined
        }
        className="mx-auto w-full max-w-[1120px]"
      >
        <motion.svg
          aria-hidden
          viewBox="-96 -64 1176 632"
          className="h-auto w-full overflow-visible"
          initial={driven ? false : "hidden"}
          animate={play}
        >
          <defs>
            <linearGradient id="hero-court-surface" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Playing surface */}
          <motion.rect
            x={X[0]}
            y={COURT_ROWS[0]}
            width={X[4] - X[0]}
            height={COURT_ROWS[3] - COURT_ROWS[0]}
            rx="14"
            fill="url(#hero-court-surface)"
            variants={driven ? undefined : group}
            custom={0}
            style={driven ? { opacity: courtOpacity } : undefined}
          />

          {/* Court markings — the lines the grid is already made of */}
          <motion.g
            stroke="var(--text-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            variants={driven ? undefined : group}
            custom={0.1}
            style={driven ? { opacity: courtOpacity } : undefined}
          >
            {X.map((x) => (
              <line key={`v${x}`} x1={x} y1={COURT_ROWS[0]} x2={x} y2={COURT_ROWS[3]} />
            ))}
            {COURT_ROWS.map((y) => (
              <line key={`h${y}`} x1={X[0]} y1={y} x2={X[4]} y2={y} />
            ))}
          </motion.g>

          {/* The rows the court was missing — the schedule completing itself */}
          <motion.g
            stroke="var(--text-secondary)"
            strokeWidth="1"
            strokeDasharray="5 7"
            fill="none"
            variants={driven ? undefined : group}
            custom={0.45}
            style={driven ? { opacity: gridOpacity } : undefined}
          >
            {GRID_ROWS.map((y) => (
              <line key={`g${y}`} x1={X[0]} y1={y} x2={X[4]} y2={y} />
            ))}
          </motion.g>

          {/* Hour axis */}
          <motion.g
            fill="var(--text-tertiary)"
            fontSize="15"
            fontWeight="600"
            textAnchor="end"
            variants={driven ? undefined : group}
            custom={0.6}
            style={driven ? { opacity: ticksOpacity, x: ticksX } : undefined}
          >
            {PREVIEW_HOURS.map((label, i) => (
              <text key={label} x={X[0] - 22} y={COURT_ROWS[0] + i * ROW_H + 6}>
                {label}
              </text>
            ))}
          </motion.g>

          {/* Court headers */}
          <motion.g
            textAnchor="middle"
            variants={driven ? undefined : group}
            custom={0.7}
            style={driven ? { opacity: headersOpacity } : undefined}
          >
            {PREVIEW_COURTS.map((court, i) => {
              const cx = X[0] + i * COL_W + COL_W / 2;
              return (
                <g key={court.name}>
                  <text
                    x={cx}
                    y={-2}
                    fill="var(--text-primary)"
                    fontSize="15"
                    fontWeight="700"
                    letterSpacing="0.08em"
                  >
                    {court.name.toUpperCase()}
                  </text>
                  <text x={cx} y={18} fill={court.sport.color} fontSize="12" fontWeight="600">
                    {court.sport.label}
                  </text>
                </g>
              );
            })}
          </motion.g>

          {/* Bookings */}
          <g>
            {PREVIEW_BOOKINGS.map((b, i) => {
              const x = X[0] + b.col * COL_W + 8;
              const y = COURT_ROWS[0] + b.from * ROW_H + 6;
              const w = COL_W - 16;
              const h = (b.to - b.from) * ROW_H - 12;
              return (
                <HeroBookingBlock
                  key={`${b.col}-${b.from}`}
                  block={b}
                  x={x}
                  y={y}
                  w={w}
                  h={h}
                  drive={drive}
                  driven={driven}
                  index={i}
                />
              );
            })}
          </g>

          {/* The net becomes the now-line */}
          <motion.line
            x1={X[0]}
            y1={NET_Y}
            x2={X[4]}
            y2={NET_Y}
            stroke="var(--text-primary)"
            strokeWidth="3"
            variants={driven ? undefined : group}
            custom={0.2}
            style={driven ? { opacity: netOpacity } : undefined}
          />
          <motion.g
            variants={driven ? undefined : group}
            custom={1.15}
            style={driven ? { opacity: nowOpacity } : undefined}
          >
            <line
              x1={X[0]}
              y1={NET_Y}
              x2={X[4]}
              y2={NET_Y}
              stroke="var(--danger)"
              strokeWidth="2"
            />
            <rect x={X[0] - 66} y={NET_Y - 13} width="58" height="26" rx="7" fill="var(--danger)" />
            <text
              x={X[0] - 37}
              y={NET_Y + 5}
              textAnchor="middle"
              fill="#fff"
              fontSize="13"
              fontWeight="700"
            >
              10:24
            </text>
          </motion.g>
        </motion.svg>
      </motion.div>
    </div>
  );
}

function HeroBookingBlock({
  block,
  x,
  y,
  w,
  h,
  drive,
  driven,
  index,
}: {
  block: PreviewBooking;
  x: number;
  y: number;
  w: number;
  h: number;
  drive: MotionValue<number>;
  driven: boolean;
  index: number;
}) {
  const start = 0.5 + index * 0.035;
  const opacity = useTransform(drive, [start, start + 0.09], [0, 1], { ease: EASE_FN });
  const yOffset = useTransform(drive, [start, start + 0.09], [14, 0], { ease: EASE_FN });

  return (
    <motion.g
      variants={driven ? undefined : blockIn}
      custom={0.85 + index * 0.07}
      style={driven ? { opacity, y: yOffset } : undefined}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        fill={block.color}
        fillOpacity="0.14"
        stroke={block.color}
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <rect x={x} y={y + 8} width="3" height={h - 16} rx="1.5" fill={block.color} />
      <text x={x + 16} y={y + 27} fill="var(--text-primary)" fontSize="15" fontWeight="650">
        {block.title}
      </text>
      <text x={x + 16} y={y + 47} fill="var(--text-tertiary)" fontSize="12.5" fontWeight="500">
        {block.sub}
      </text>
    </motion.g>
  );
}
