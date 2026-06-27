import { siteConfig } from "@/config/site";
import { SPORT_LIST } from "@/lib/constants/sports";
import { Logo } from "@/components/brand/logo";
import { GlowBlob } from "@/components/brand/glow-blob";
import { Icon } from "@/components/ui/icon";

/** Left brand panel for the auth split-screen (hidden on mobile). */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="mesh-bg absolute inset-0 -z-10" />
      <GlowBlob color="var(--accent-blue)" size={480} opacity={0.32} className="-left-24 top-10" />
      <GlowBlob color="var(--accent-purple)" size={460} opacity={0.3} className="-right-24 bottom-10" />

      <Logo />

      <div className="max-w-md">
        <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight">
          The premium operating system for racquet clubs.
        </h2>
        <p className="mt-4 text-pretty text-ink-secondary">
          Join 1,200+ clubs running booking, memberships, events, and analytics on {siteConfig.name}.
        </p>

        <figure className="mt-10 rounded-2xl border border-[var(--border-default)] bg-white/[0.03] p-5 backdrop-blur">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon key={i} name="star" className="size-4 fill-warning text-warning" />
            ))}
          </div>
          <blockquote className="mt-3 text-sm leading-relaxed text-foreground">
            “We switched and our booking volume jumped 28% in the first month. Members constantly
            tell us how good it feels.”
          </blockquote>
          <figcaption className="mt-3 text-xs text-ink-tertiary">
            Maria Alvarez · GM, Lakeside Tennis &amp; Padel
          </figcaption>
        </figure>
      </div>

      <div className="flex items-center gap-2 text-sm text-ink-tertiary">
        <div className="flex -space-x-2">
          {SPORT_LIST.map((s) => (
            <span
              key={s.id}
              className="flex size-7 items-center justify-center rounded-full border-2 border-[var(--bg-canvas)] text-xs"
              style={{ background: `color-mix(in oklab, ${s.color} 22%, var(--bg-raised))` }}
            >
              {s.emoji}
            </span>
          ))}
        </div>
        Built for every racquet sport
      </div>
    </div>
  );
}
