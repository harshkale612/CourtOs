"use client";

import { useState } from "react";
import Link from "next/link";
import { plans } from "@/lib/mock/data";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="space-y-10">
      {/* billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={cn("text-sm", !annual ? "text-foreground" : "text-ink-tertiary")}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual((v) => !v)}
          className={cn(
            "relative h-7 w-12 rounded-full border border-transparent transition-colors",
            annual ? "bg-grad-brand" : "bg-white/10",
          )}
          aria-label="Toggle annual billing"
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
              annual ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
        <span className={cn("text-sm", annual ? "text-foreground" : "text-ink-tertiary")}>
          Annual
        </span>
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
          Save 20%
        </span>
      </div>

      <StaggerContainer className="grid items-stretch gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const monthly = annual ? Math.round(plan.price * 0.8) : plan.price;
          const popular = plan.popular;
          return (
            <StaggerItem key={plan.id} className="h-full">
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-3xl p-7 transition-all duration-300",
                  popular
                    ? "glow-border bg-raised shadow-[var(--glow-brand)]"
                    : "border border-[var(--border-subtle)] bg-raised hover:border-[var(--border-strong)]",
                )}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-grad-brand px-3 py-1 text-xs font-semibold text-white shadow-[var(--glow-brand)]">
                    Most popular
                  </span>
                )}
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex size-9 items-center justify-center rounded-xl"
                    style={{ background: `color-mix(in oklab, ${plan.accentColor} 18%, transparent)`, color: plan.accentColor }}
                  >
                    <Icon name="badge-check" className="size-4" />
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                </div>
                <p className="mt-3 text-sm text-ink-secondary">{plan.description}</p>
                <div className="mt-6 flex items-end gap-1">
                  <span className="tnum text-4xl font-bold tracking-tight">
                    {formatCurrency(monthly)}
                  </span>
                  <span className="mb-1 text-sm text-ink-tertiary">/mo</span>
                </div>
                {annual && (
                  <p className="mt-1 text-xs text-ink-tertiary">
                    Billed {formatCurrency(monthly * 12)} yearly
                  </p>
                )}
                <Button
                  className="mt-6 w-full"
                  variant={popular ? "primary" : "secondary"}
                  asChild
                >
                  <Link href="/signup">Get started</Link>
                </Button>
                <ul className="mt-7 space-y-3">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                      <Icon name="check-circle" className="mt-0.5 size-4 shrink-0 text-brand" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
