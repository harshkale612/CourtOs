import type { Metadata } from "next";
import { PageHeader } from "@/features/marketing/page-header";
import { Section } from "@/features/marketing/section";
import { PricingSection } from "@/features/marketing/pricing-section";
import { Faq } from "@/features/marketing/faq";
import { CtaSection } from "@/features/marketing/cta-section";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, scalable plans for racquet clubs of every size.",
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Plans that scale"
        highlight="with you"
        subtitle="Every plan includes the full premium experience. Upgrade as your club grows — no surprises, no lock-in."
      />

      <Section className="!pt-4">
        <PricingSection />
      </Section>

      <Section eyebrow="FAQ" title="Questions, answered">
        <Faq />
      </Section>

      <CtaSection />
    </>
  );
}
