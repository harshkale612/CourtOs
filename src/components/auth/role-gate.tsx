"use client";

import { useEffect } from "react";
import type { Role } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { db } from "@/lib/mock/data";

/**
 * Auth seam (see docs/00-ARCHITECTURE.md §1).
 *
 * Phase 3 behavior: if no session exists, seed a mock user for the required
 * role so the portal/admin are demoable before the auth flow ships.
 *
 * Phase 6 will replace the seeding branch with a redirect to /login while
 * keeping this component's call sites unchanged.
 */
export function RoleGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (!user) {
      setUser(
        role === "member"
          ? db.currentUser
          : { ...db.currentUser, id: `user_${role}`, role, name: "Sam Admin" },
      );
    }
  }, [user, role, setUser]);

  return <>{children}</>;
}
