import { FEATURES } from "./content";
import { Icon } from "@/components/ui/icon";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

export function FeaturesGrid() {
  return (
    <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((feature) => (
        <StaggerItem key={feature.title}>
          <div className="group relative h-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-raised p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--sh-3)]">
            {/* hover glow */}
            <div
              className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
              style={{ background: feature.accent }}
            />
            <span
              className="relative flex size-12 items-center justify-center rounded-xl"
              style={{
                background: `color-mix(in oklab, ${feature.accent} 16%, transparent)`,
                color: feature.accent,
              }}
            >
              <Icon name={feature.icon} className="size-5" />
            </span>
            <h3 className="relative mt-5 text-lg font-semibold tracking-tight">{feature.title}</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-ink-secondary">
              {feature.description}
            </p>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
