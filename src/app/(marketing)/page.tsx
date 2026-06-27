import { Hero } from "@/features/marketing/hero";
import { LogoCloud } from "@/features/marketing/logo-cloud";
import { Section } from "@/features/marketing/section";
import { FeatureStories } from "@/features/marketing/feature-story";
import { FeaturesGrid } from "@/features/marketing/features-grid";
import { SportsShowcase } from "@/features/marketing/sports-showcase";
import { StatsBand } from "@/features/marketing/stats-band";
import { TestimonialsSection } from "@/features/marketing/testimonials-section";
import { PricingSection } from "@/features/marketing/pricing-section";
import { CtaSection } from "@/features/marketing/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoCloud />

      <Section className="!py-12">
        <FeatureStories />
      </Section>

      <Section
        eyebrow="Platform"
        title="Everything your club needs, beautifully unified"
        subtitle="One platform replaces the booking tool, the spreadsheet, the payment processor, and the guesswork."
      >
        <FeaturesGrid />
      </Section>

      <Section
        eyebrow="Multi-sport"
        title="Built for every racquet on the court"
        subtitle="Each sport gets its own theming, court layouts, and booking rules — no compromises for multi-sport clubs."
      >
        <SportsShowcase />
      </Section>

      <StatsBand />

      <Section
        eyebrow="Loved by clubs"
        title="Don't take our word for it"
        subtitle="Owners, managers, and coaches on what changed after switching to CourtOS."
      >
        <TestimonialsSection />
      </Section>

      <Section
        id="pricing"
        eyebrow="Pricing"
        title="Simple plans that scale with you"
        subtitle="Start free, upgrade when you're ready. Every plan includes the full premium experience."
      >
        <PricingSection />
      </Section>

      <CtaSection />
    </>
  );
}
