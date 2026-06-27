import type { Metadata } from "next";
import { AuthSplit } from "@/features/auth/auth-split";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthSplit>
      <LoginForm />
    </AuthSplit>
  );
}
