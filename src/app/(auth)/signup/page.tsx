import type { Metadata } from "next";
import { AuthSplit } from "@/features/auth/auth-split";
import { SignupForm } from "@/features/auth/signup-form";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <AuthSplit>
      <SignupForm />
    </AuthSplit>
  );
}
