import { cn } from "@/lib/utils/cn";
import { GradientText } from "@/components/brand/gradient-text";
import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
          <span className="size-1.5 rounded-full bg-grad-brand" />
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-2xl text-pretty text-base text-ink-secondary sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

export { GradientText };
