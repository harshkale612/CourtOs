import { cn } from "@/lib/utils/cn";

/**
 * A soft, blurred radial glow — the atmosphere building block for heroes and
 * section backgrounds. Absolutely positioned; pass position via className.
 */
export function GlowBlob({
  color = "var(--brand)",
  size = 480,
  opacity = 0.35,
  className,
}: {
  color?: string;
  size?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute -z-10 rounded-full blur-[120px]", className)}
      style={{
        width: size,
        height: size,
        opacity,
        background: `radial-gradient(circle at center, ${color}, transparent 70%)`,
      }}
    />
  );
}
