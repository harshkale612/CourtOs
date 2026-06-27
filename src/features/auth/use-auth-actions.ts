"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { Role } from "@/types";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { ROLES } from "@/lib/constants/roles";

/**
 * Mock auth actions — the seam where real auth plugs in later.
 * Login goes straight to the role's home; signup routes through onboarding.
 */
export function useAuthActions() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const login = useCallback(
    async (input: { email: string; password: string; role?: Role }) => {
      const user = await api.auth.login(input);
      setUser(user);
      router.push(ROLES[user.role].home);
      return user;
    },
    [router, setUser],
  );

  const signup = useCallback(
    async (input: { name: string; email: string; role: Role }) => {
      const user = await api.auth.signup(input);
      setUser(user);
      router.push("/onboarding");
      return user;
    },
    [router, setUser],
  );

  /** Quick demo entry — skips the form, drops straight into a role's app. */
  const quickDemo = useCallback(
    async (role: Role) => {
      const user = await api.auth.login({ email: `${role}@demo.club`, password: "demo", role });
      setUser(user);
      router.push(ROLES[role].home);
    },
    [router, setUser],
  );

  return { login, signup, quickDemo };
}
