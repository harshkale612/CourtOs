"use client";

import { ProductFrame } from "./product-frame";
import { ProductCard } from "./product-card";
import { PREVIEW_CARDS } from "./preview-data";
import { cn } from "@/lib/utils/cn";

/**
 * Settled, self-contained product snapshot — the dashboard frame with its
 * interface cards alongside. The hero drives the same pieces from scroll
 * instead (see hero/); this is the drop-in version for any other surface.
 */
export function ProductPreview({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-6xl", className)}>
      <ProductFrame />

      <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 lg:pointer-events-none lg:absolute lg:inset-0 lg:mt-0 lg:max-w-none">
        <ProductCard
          card={PREVIEW_CARDS[0]}
          className="lg:absolute lg:-left-10 lg:top-[28%] lg:w-[248px]"
        />
        <ProductCard
          card={PREVIEW_CARDS[1]}
          className="lg:absolute lg:-right-10 lg:top-[16%] lg:w-[248px]"
        />
        <ProductCard
          card={PREVIEW_CARDS[2]}
          className="lg:absolute lg:-right-4 lg:bottom-[14%] lg:w-[248px]"
        />
      </div>
    </div>
  );
}
