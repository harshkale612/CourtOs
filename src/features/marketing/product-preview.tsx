"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

export function ProductPreview() {
  return (
    <div className="relative mx-auto w-full">
      {/* Glow behind the window */}
      <div className="absolute inset-0 -z-10 scale-90 rounded-[2rem] bg-grad-brand opacity-20 blur-[80px]" />

      <div
        className="glow-border relative z-10 w-full overflow-hidden rounded-[20px] bg-raised/90 shadow-sh-4 backdrop-blur-xl transition-all sm:rounded-[24px]"
        style={{ transform: "rotateX(2deg) translateY(-4px)", transformStyle: "preserve-3d" }}
      >
        {/* Browser Chrome */}
        <div className="flex h-12 items-center justify-between border-b border-(--border-subtle) bg-fill-1 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-danger/80" />
            <div className="size-3 rounded-full bg-warning/80" />
            <div className="size-3 rounded-full bg-success/80" />
          </div>
          <div className="flex h-6 w-48 items-center justify-center rounded-md border border-(--border-default) bg-fill-2 text-[11px] font-medium text-ink-tertiary sm:w-64">
            <Icon name="lock" className="mr-1.5 size-3" />
            app.courtos.com
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>

        {/* Dashboard Mockup - Main Body */}
        <div className="flex h-[450px] sm:h-[550px] lg:h-[650px]">
          {/* Sidebar */}
          <div className="hidden w-60 flex-col border-r border-(--border-subtle) bg-fill-1/50 p-4 lg:flex">
            <div className="mb-8 flex items-center gap-2 font-semibold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-grad-brand text-white shadow-glow-brand">
                C
              </span>
              CourtOS
            </div>
            
            <div className="flex flex-col gap-1 text-sm font-medium text-ink-secondary">
              <div className="flex items-center gap-3 rounded-lg bg-fill-4 px-3 py-2 text-foreground">
                <Icon name="layout-dashboard" className="size-4 text-brand" /> Dashboard
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-fill-2">
                <Icon name="calendar-days" className="size-4 text-ink-tertiary" /> Bookings
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-fill-2">
                <Icon name="users" className="size-4 text-ink-tertiary" /> Members
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-fill-2">
                <Icon name="credit-card" className="size-4 text-ink-tertiary" /> Payments
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-fill-2">
                <Icon name="monitor-smartphone" className="size-4 text-ink-tertiary" /> POS
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-surface p-3 shadow-sm">
                <div className="size-8 rounded-full bg-fill-3"></div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">Admin User</span>
                  <span className="text-[10px] text-ink-tertiary">Club Manager</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden bg-canvas/30 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Overview</h2>
                <p className="text-sm text-ink-tertiary">Today&apos;s activity across all facilities.</p>
              </div>
              <div className="hidden h-9 items-center justify-center rounded-lg border border-(--border-default) bg-surface px-4 text-sm font-medium shadow-sh-1 sm:flex">
                <Icon name="calendar" className="mr-2 size-4 text-ink-secondary" />
                Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* Top Stats Row */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Today's Revenue", value: "$4,820", suffix: " CAD", change: "+12.4%", trend: "up" },
                { label: "Bookings", value: "142", suffix: "", change: "+8.1%", trend: "up" },
                { label: "Court Utilization", value: "86", suffix: "%", change: "+2.4%", trend: "up" },
                { label: "POS Sales", value: "$840", suffix: " CAD", change: "-4.2%", trend: "down" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col justify-center rounded-xl border border-(--border-subtle) bg-surface p-4 shadow-sh-1">
                  <p className="text-xs font-medium text-ink-tertiary">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tnum">
                    {stat.value}<span className="text-sm font-medium text-ink-secondary">{stat.suffix}</span>
                  </p>
                  <div className={cn("mt-2 flex items-center text-xs font-medium", stat.trend === 'up' ? "text-success" : "text-danger")}>
                    <Icon name={stat.trend === 'up' ? "trending-up" : "trending-down"} className="mr-1 size-3" />
                    {stat.change} vs yesterday
                  </div>
                </div>
              ))}
            </div>

            {/* Schedule View Preview */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-(--border-subtle) bg-surface shadow-sh-1">
              <div className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">Court Schedule</h3>
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded-md bg-fill-2"></div>
                  <div className="h-6 w-20 rounded-md bg-fill-2"></div>
                </div>
              </div>
              <div className="relative flex-1 overflow-hidden p-4">
                {/* Fake Schedule Grid */}
                <div className="grid h-full grid-cols-[50px_1fr] gap-4 sm:grid-cols-[60px_1fr]">
                  <div className="flex flex-col justify-between py-2 text-[11px] font-medium text-ink-tertiary">
                    <span>9 AM</span>
                    <span>10 AM</span>
                    <span>11 AM</span>
                    <span>12 PM</span>
                    <span>1 PM</span>
                  </div>
                  <div className="relative w-full border-l border-(--border-subtle) pl-4">
                    {/* Horizontal grid lines */}
                    <div className="absolute top-[0%] w-full border-b border-(--border-subtle)/50 border-dashed"></div>
                    <div className="absolute top-[25%] w-full border-b border-(--border-subtle)/50 border-dashed"></div>
                    <div className="absolute top-[50%] w-full border-b border-(--border-subtle)/50 border-dashed"></div>
                    <div className="absolute top-[75%] w-full border-b border-(--border-subtle)/50 border-dashed"></div>
                    <div className="absolute top-[100%] w-full border-b border-(--border-subtle)/50 border-dashed"></div>
                    
                    {/* Booking Blocks */}
                    <div className="absolute left-2 top-[5%] h-[20%] w-[45%] rounded-md border border-brand/30 bg-brand/10 p-2 text-xs backdrop-blur-sm sm:left-4 sm:w-[40%]">
                      <p className="font-medium text-brand">Tennis 1 • Singles</p>
                      <p className="mt-0.5 text-[10px] text-ink-tertiary">Sarah Jenkins</p>
                    </div>
                    <div className="absolute left-[50%] top-[10%] h-[30%] w-[45%] rounded-md border-emerald-500/30 bg-emerald-500/10 p-2 text-xs backdrop-blur-sm sm:w-[40%]">
                      <p className="font-medium text-emerald-500">Padel 2 • Clinic</p>
                      <p className="mt-0.5 text-[10px] text-ink-tertiary">Coach Mike</p>
                    </div>
                    <div className="absolute left-2 top-[30%] h-[20%] w-[45%] rounded-md border-cyan-500/30 bg-cyan-500/10 p-2 text-xs backdrop-blur-sm sm:left-4 sm:w-[40%]">
                      <p className="font-medium text-cyan-500">Pickleball 3 • Doubles</p>
                      <p className="mt-0.5 text-[10px] text-ink-tertiary">David Kim</p>
                    </div>
                    <div className="absolute left-[50%] top-[45%] h-[25%] w-[45%] rounded-md border-purple-500/30 bg-purple-500/10 p-2 text-xs backdrop-blur-sm sm:w-[40%]">
                      <p className="font-medium text-purple-500">Squash 1 • League</p>
                      <p className="mt-0.5 text-[10px] text-ink-tertiary">Div A Match</p>
                    </div>
                    
                    {/* Current Time Indicator */}
                    <div className="absolute left-0 top-[35%] z-10 w-full border-b-2 border-danger">
                       <div className="absolute -left-[32px] -top-[7px] rounded bg-danger px-1.5 py-0.5 text-[9px] font-bold text-white">
                         10:24
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Cards (Stacked on mobile, floating on desktop) */}
      <div className="mx-auto mt-8 flex max-w-sm flex-col gap-4 sm:max-w-md lg:absolute lg:inset-0 lg:mx-0 lg:mt-0 lg:max-w-none lg:pointer-events-none">
        {/* Floating Card 1: Court Availability */}
        <motion.div
          initial={{ opacity: 0, x: -30, y: 20 }}
          animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
          transition={{ 
            opacity: { delay: 0.9, duration: 0.5 }, 
            x: { delay: 0.9, duration: 0.5, ease: "easeOut" },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 } 
          }}
          className="z-20 w-full lg:absolute lg:-left-12 lg:bottom-12 lg:w-auto lg:pointer-events-auto"
        >
          <div className="glass flex w-full flex-col gap-2 rounded-2xl p-4 shadow-sh-4 backdrop-blur-xl lg:w-[220px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-ink-secondary">COURT 01</span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-success">
                <span className="size-1.5 rounded-full bg-success"></span> Available
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-fill-3">🎾</div>
              <div>
                <p className="text-sm font-semibold text-foreground">Tennis</p>
                <p className="text-[10px] text-ink-tertiary">Whole Court</p>
              </div>
            </div>
            <div className="mt-1 border-t border-(--border-subtle) pt-2.5">
              <p className="font-mono text-sm font-bold text-foreground">$45 CAD <span className="font-sans text-[10px] font-medium text-ink-tertiary">/ hour</span></p>
            </div>
          </div>
        </motion.div>

        {/* Floating Card 2: Pickleball / Shared Court */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: -20 }}
          animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
          transition={{ 
            opacity: { delay: 1.1, duration: 0.5 }, 
            x: { delay: 1.1, duration: 0.5, ease: "easeOut" },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 } 
          }}
          className="z-20 w-full lg:absolute lg:-right-12 lg:top-24 lg:w-auto lg:pointer-events-auto"
        >
          <div className="glass flex w-full flex-col gap-2 rounded-2xl p-4 shadow-sh-4 backdrop-blur-xl lg:w-[220px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-ink-secondary">COURT 03</span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-warning">
                3 / 4 players
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-fill-3">🏓</div>
              <div>
                <p className="text-sm font-semibold text-foreground">Pickleball</p>
                <p className="text-[10px] text-ink-tertiary">Shared Court</p>
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-(--border-subtle) pt-2.5">
              <p className="font-mono text-sm font-bold text-foreground">$15 CAD <span className="font-sans text-[10px] font-medium text-ink-tertiary">/ player</span></p>
              <div className="flex -space-x-1.5">
                 <div className="size-5 rounded-full border border-surface bg-brand/80"></div>
                 <div className="size-5 rounded-full border border-surface bg-cyan-500/80"></div>
                 <div className="size-5 rounded-full border border-surface bg-emerald-500/80"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Card 3: POS Sale */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{ 
            opacity: { delay: 1.3, duration: 0.5 }, 
            y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 } 
          }}
          className="z-20 w-full lg:absolute lg:-right-4 lg:bottom-24 lg:w-auto lg:pointer-events-auto"
        >
          <div className="glass flex w-full items-center gap-3 rounded-2xl p-3 shadow-sh-4 backdrop-blur-xl">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-500">
              <Icon name="shopping-cart" className="size-4" />
            </div>
            <div className="pr-2">
              <p className="text-[11px] font-semibold text-foreground">New POS Sale</p>
              <p className="text-[10px] text-ink-tertiary">Pro Shop • $124.50 CAD</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
