"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { SPORT_LIST } from "@/lib/constants/sports";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { MeshBackground } from "@/components/brand/mesh-background";
import { GradientText } from "@/components/brand/gradient-text";
import { ProductPreview } from "./product-preview";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36 lg:pb-32 lg:pt-44">
      <MeshBackground />

      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div {...fade(0)}>
            <Link
              href="/features"
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-white/[0.03] py-1 pl-1.5 pr-3 text-xs font-medium text-ink-secondary backdrop-blur transition-colors hover:border-[var(--border-strong)]"
            >
              <span className="rounded-full bg-grad-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                New
              </span>
              Multi-sport, multi-court, one platform
              <Icon name="arrow-right" className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <motion.h1
            {...fade(0.08)}
            className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            The premium OS for <GradientText>racquet clubs</GradientText>.
          </motion.h1>

          <motion.p
            {...fade(0.16)}
            className="mt-5 max-w-xl text-pretty text-lg text-ink-secondary"
          >
            {siteConfig.name} unifies booking, memberships, events, and analytics into one
            beautiful platform — so your courts stay full and your members stay delighted.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/demo">
                Book a demo <Icon name="arrow-right" className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/app">Explore the product</Link>
            </Button>
          </motion.div>

          <motion.div {...fade(0.32)} className="mt-8 flex flex-col items-center gap-3 lg:items-start">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {SPORT_LIST.map((s) => (
                  <span
                    key={s.id}
                    title={s.label}
                    className="flex size-8 items-center justify-center rounded-full border-2 border-[var(--bg-canvas)] text-sm"
                    style={{ background: `color-mix(in oklab, ${s.color} 22%, var(--bg-raised))` }}
                  >
                    {s.emoji}
                  </span>
                ))}
              </div>
              <p className="text-sm text-ink-secondary">
                Tennis · Pickleball · Padel · Badminton · Squash
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-ink-tertiary">
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" className="size-3.5 fill-warning text-warning" />
                ))}
              </span>
              Loved by 1,200+ clubs
            </div>
          </motion.div>
        </div>

        <div className="[perspective:1200px]">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
