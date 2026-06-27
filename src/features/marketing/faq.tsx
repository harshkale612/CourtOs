"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { FAQS } from "./content";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-raised">
      {FAQS.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-foreground">{faq.q}</span>
              <Icon
                name="chevron-down"
                className={cn(
                  "size-5 shrink-0 text-ink-secondary transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "grid overflow-hidden px-6 transition-all duration-300 ease-[var(--e-out)]",
                isOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <p className="min-h-0 text-sm leading-relaxed text-ink-secondary">{faq.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
