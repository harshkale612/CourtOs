import type { Metadata } from "next";
import { AuthSplit } from "@/features/auth/auth-split";
import { ForgotForm } from "@/features/auth/forgot-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthSplit>
      <ForgotForm />
    </AuthSplit>
  );
}
