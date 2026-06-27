import type { Metadata } from "next";
import { DemoForm } from "@/features/marketing/demo-form";
import { GradientText } from "@/components/brand/gradient-text";
import { GlowBlob } from "@/components/brand/glow-blob";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "Book a Demo",
  description: "See CourtOS in action with a personalized 20-minute walkthrough.",
};

const BENEFITS = [
  { icon: "calendar-check", title: "A 20-minute personalized tour", body: "Tailored to your sports, courts, and goals." },
  { icon: "zap", title: "See the live booking grid", body: "Watch how members book in two taps." },
  { icon: "bar-chart-3", title: "Your numbers, modeled", body: "We'll show the revenue impact for a club your size." },
  { icon: "badge-check", title: "Migration walkthrough", body: "Switching from another tool? We'll map the path." },
];

export default function DemoPage() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36 lg:pt-44">
      <GlowBlob color="var(--accent-blue)" size={500} opacity={0.2} className="-left-20 top-10" />
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            <span className="size-1.5 rounded-full bg-grad-brand" /> Book a demo
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            See your club in a <GradientText>whole new light</GradientText>
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-lg text-ink-secondary">
            Tell us a little about your club and we&apos;ll set up a walkthrough tailored to exactly
            how you operate.
          </p>
          <ul className="mt-8 space-y-5">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-grad-brand-soft text-brand">
                  <Icon name={b.icon} className="size-5" />
                </span>
                <div>
                  <p className="font-medium text-foreground">{b.title}</p>
                  <p className="text-sm text-ink-secondary">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <DemoForm />
      </div>
    </section>
  );
}
