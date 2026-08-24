"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { MeshBackground } from "@/components/brand/mesh-background";
import { ProductPreview } from "./product-preview";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-32 lg:pb-32 lg:pt-40">
      <MeshBackground />

      <div className="mx-auto flex max-w-[850px] flex-col items-center text-center">
        {/* Eyebrow */}
        <motion.div {...fade(0)}>
          <div className="inline-flex items-center gap-2 rounded-full border border-(--border-default) bg-fill-2 py-1 pl-1.5 pr-3 text-[11px] font-semibold uppercase tracking-widest text-ink-secondary backdrop-blur transition-colors hover:border-(--border-strong)">
            <span className="flex size-5 items-center justify-center rounded-full bg-grad-brand-soft">
              <span className="size-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--brand)]" />
            </span>
            The operating system for sports clubs
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fade(0.1)}
          className="mt-6 text-balance text-4xl font-[800] leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[72px]"
        >
          Run Your Club.<br />
          <span 
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #10B981 100%)" }}
          >
            Not Your Spreadsheet.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          {...fade(0.2)}
          className="mt-6 max-w-[680px] text-pretty text-base text-ink-secondary md:text-lg leading-relaxed"
        >
          Manage courts, bookings, memberships, events, payments,
          and your entire club operation from one beautifully connected
          platform.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fade(0.3)} className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <Button size="lg" className="w-full rounded-xl px-8 text-base shadow-[0_8px_32px_-6px_rgba(59,130,246,0.5)] hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.7)] sm:w-auto sm:h-[52px]" asChild>
            <Link href="/register">
              Start Free
            </Link>
          </Button>
          <Button size="lg" variant="secondary" className="w-full rounded-xl border border-(--border-default) bg-glass px-8 text-base backdrop-blur-xl hover:bg-fill-3 sm:w-auto sm:h-[52px]" asChild>
            <Link href="/demo">
              Book a Demo
            </Link>
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div {...fade(0.4)} className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-ink-tertiary sm:gap-6">
          <span className="flex items-center gap-1.5">
            <Icon name="check" className="size-4 text-success" /> Court management
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="check" className="size-4 text-success" /> Member management
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="check" className="size-4 text-success" /> Payments
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="check" className="size-4 text-success" /> POS
          </span>
        </motion.div>
      </div>

      {/* Product Visualization */}
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        className="mx-auto mt-16 max-w-6xl perspective-[1200px] md:mt-24"
      >
        <ProductPreview />
      </motion.div>
    </section>
  );
}
