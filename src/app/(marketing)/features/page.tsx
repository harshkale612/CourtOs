import type { Metadata } from "next";
import { PageHeader } from "@/features/marketing/page-header";
import { Section } from "@/features/marketing/section";
import { FeaturesGrid } from "@/features/marketing/features-grid";
import { FeatureStories } from "@/features/marketing/feature-story";
import { SportsShowcase } from "@/features/marketing/sports-showcase";
import { CtaSection } from "@/features/marketing/cta-section";

export const metadata: Metadata = {
  title: "Features",
  description: "Booking, memberships, events, payments, and analytics — beautifully unified.",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Features"
        title="One platform to run your"
        highlight="entire club"
        subtitle="From the first booking to the year-end report, CourtOS handles it — without the spreadsheets, the duct tape, or the training calls."
      />

      <Section className="!pt-4">
        <FeaturesGrid />
      </Section>

      <Section>
        <FeatureStories />
      </Section>

      <Section
        eyebrow="Multi-sport"
        title="First-class for every sport"
        subtitle="Tennis, pickleball, padel, badminton, and squash — each with tailored court layouts and theming."
      >
        <SportsShowcase />
      </Section>

      <CtaSection />
    </>
  );
}
