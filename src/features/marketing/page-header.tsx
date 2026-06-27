import { GradientText } from "@/components/brand/gradient-text";
import { GlowBlob } from "@/components/brand/glow-blob";

export function PageHeader({
  eyebrow,
  title,
  highlight,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
}) {
  return (
    <header className="relative overflow-hidden px-6 pb-12 pt-36 text-center lg:pt-44">
      <GlowBlob color="var(--accent-purple)" size={480} opacity={0.22} className="left-1/2 top-0 -translate-x-1/2" />
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
          <span className="size-1.5 rounded-full bg-grad-brand" />
          {eyebrow}
        </span>
      )}
      <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        {title} {highlight && <GradientText>{highlight}</GradientText>}
      </h1>
      {subtitle && (
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-ink-secondary">{subtitle}</p>
      )}
    </header>
  );
}
