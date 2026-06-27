import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { GlowBlob } from "@/components/brand/glow-blob";
import { GradientText } from "@/components/brand/gradient-text";
import { Reveal } from "@/components/motion/reveal";

export function CtaSection() {
  return (
    <section className="px-6 py-20 lg:py-28">
      <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--border-default)] bg-raised px-6 py-16 text-center sm:px-12">
        <GlowBlob color="var(--accent-blue)" size={420} opacity={0.3} className="-left-20 -top-24" />
        <GlowBlob color="var(--accent-purple)" size={420} opacity={0.3} className="-bottom-24 -right-20" />
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Ready to make your club feel <GradientText>world-class</GradientText>?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-ink-secondary sm:text-lg">
          Join 1,200+ clubs running on CourtOS. Book a 20-minute demo and see your courts in a
          whole new light.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/demo">
              Book a demo <Icon name="arrow-right" className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
        <p className="mt-5 text-xs text-ink-tertiary">No credit card required · Setup in a day</p>
      </Reveal>
    </section>
  );
}
