import type { Metadata } from "next";
import { PageHeader } from "@/features/marketing/page-header";
import { Section } from "@/features/marketing/section";
import { TestimonialsSection } from "@/features/marketing/testimonials-section";
import { StatsBand } from "@/features/marketing/stats-band";
import { CtaSection } from "@/features/marketing/cta-section";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Loved by 1,200+ clubs and the players they serve.",
};

export default function TestimonialsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Testimonials"
        title="Loved by clubs and"
        highlight="players alike"
        subtitle="The teams running the world's best racquet clubs on what changed after CourtOS."
      />

      <StatsBand />

      <Section className="!pt-6">
        <TestimonialsSection />
      </Section>

      <CtaSection />
    </>
  );
}
