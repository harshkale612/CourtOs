import Image from "next/image";
import type { ProductCategory } from "@/types";
import { PRODUCT_CATEGORIES } from "@/lib/constants/pos";
import { cn } from "@/lib/utils/cn";

/**
 * Product visual — a category-tinted gradient tile with the product emoji.
 * Reliable everywhere (no external image dependency); falls back to a real
 * photo when `imageUrl` is provided.
 */
export function ProductThumb({
  category,
  emoji,
  imageUrl,
  name,
  className,
  emojiClassName,
}: {
  category: ProductCategory;
  emoji?: string;
  imageUrl?: string;
  name?: string;
  className?: string;
  emojiClassName?: string;
}) {
  const cfg = PRODUCT_CATEGORIES[category];
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{
        background: `linear-gradient(135deg, color-mix(in oklab, ${cfg.color} 26%, var(--bg-raised)), color-mix(in oklab, ${cfg.color} 6%, var(--bg-raised)))`,
      }}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={name ?? ""} fill sizes="200px" className="object-cover" />
      ) : (
        <span className={cn("select-none", emojiClassName ?? "text-4xl")} aria-hidden>
          {emoji ?? cfg.emoji}
        </span>
      )}
    </div>
  );
}
