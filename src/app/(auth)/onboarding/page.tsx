import type { Metadata } from "next";
import { OnboardingWizard } from "@/features/auth/onboarding/onboarding-wizard";

export const metadata: Metadata = { title: "Get started" };

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
