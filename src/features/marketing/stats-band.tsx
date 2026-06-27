"use client";

import { STATS } from "./content";
import { Counter } from "@/components/motion/counter";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { formatCompact } from "@/lib/utils/format";

export function StatsBand() {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-grad-brand-soft">
        <StaggerContainer className="grid grid-cols-2 divide-x divide-y divide-[var(--border-subtle)] sm:grid-cols-4 sm:divide-y-0">
          {STATS.map((stat) => (
            <StaggerItem key={stat.label} className="flex flex-col items-center gap-1 px-4 py-10 text-center">
              <span className="text-3xl font-bold tracking-tight sm:text-4xl">
                <Counter
                  value={stat.value}
                  format={(n) => (stat.value >= 1000 ? formatCompact(n) : Math.round(n).toString())}
                />
                {stat.suffix}
              </span>
              <span className="text-sm text-ink-secondary">{stat.label}</span>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
