import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/motion/reveal";
import { FEATURE_STORIES } from "./content";

type Variant = "grid" | "console" | "chart";

function StoryVisual({ variant, accent }: { variant: Variant; accent: string }) {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 -z-10 scale-90 rounded-[2rem] opacity-30 blur-[70px]"
        style={{ background: accent }}
      />
      <div className="glow-border overflow-hidden rounded-3xl bg-raised/90 p-5 shadow-[var(--sh-3)] backdrop-blur-xl">
        {variant === "grid" && (
          <div className="space-y-1.5">
            {Array.from({ length: 4 }).map((_, r) => (
              <div key={r} className="grid grid-cols-6 gap-1.5">
                {Array.from({ length: 6 }).map((_, c) => {
                  const filled = (r * 7 + c * 3) % 5 < 2;
                  const selected = r === 1 && c === 3;
                  return (
                    <div
                      key={c}
                      className={cn("h-8 rounded-md border", !filled && "border-[var(--border-subtle)] bg-white/[0.02]")}
                      style={
                        selected
                          ? { background: "var(--grad-brand)", borderColor: "transparent" }
                          : filled
                            ? {
                                background: `color-mix(in oklab, ${accent} 22%, transparent)`,
                                borderColor: `color-mix(in oklab, ${accent} 40%, transparent)`,
                              }
                            : undefined
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {variant === "console" && (
          <div className="space-y-2.5">
            {["Tennis 1 · Anna Lee", "Padel 2 · Marcus C.", "Squash 1 · Sofia R.", "Pickle 3 · Leo P."].map(
              (row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-white/[0.02] px-3.5 py-2.5"
                >
                  <span className="text-sm text-ink-secondary">{row}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: `color-mix(in oklab, ${accent} 14%, transparent)`,
                      color: accent,
                    }}
                  >
                    {i % 2 === 0 ? "Confirmed" : "Pending"}
                  </span>
                </div>
              ),
            )}
          </div>
        )}

        {variant === "chart" && (
          <div className="flex h-44 items-end gap-2">
            {[40, 62, 48, 78, 56, 88, 70, 95].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md"
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(to top, ${accent}, color-mix(in oklab, ${accent} 30%, transparent))`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const VARIANTS: Variant[] = ["grid", "console", "chart"];

export function FeatureStories() {
  return (
    <div className="space-y-24 lg:space-y-32">
      {FEATURE_STORIES.map((story, i) => {
        const reversed = i % 2 === 1;
        return (
          <div
            key={story.title}
            className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
          >
            <Reveal className={cn(reversed && "lg:order-2")}>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: story.accent }}
              >
                {story.eyebrow}
              </span>
              <h3 className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                {story.title}
              </h3>
              <p className="mt-4 text-pretty text-base text-ink-secondary sm:text-lg">{story.body}</p>
              <ul className="mt-6 grid grid-cols-2 gap-3">
                {story.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2 text-sm text-foreground">
                    <span
                      className="flex size-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: `color-mix(in oklab, ${story.accent} 18%, transparent)`, color: story.accent }}
                    >
                      <Icon name="check" className="size-3" />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link
                href="/demo"
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-brand"
              >
                See it in a demo <Icon name="arrow-right" className="size-4" />
              </Link>
            </Reveal>

            <Reveal delay={0.1} className={cn(reversed && "lg:order-1")}>
              <StoryVisual variant={VARIANTS[i % VARIANTS.length]} accent={story.accent} />
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}
