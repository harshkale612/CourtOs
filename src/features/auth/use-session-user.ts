"use client";

import { useAuthStore } from "@/stores/auth-store";
import { db } from "@/lib/mock/data";
import type { User } from "@/types";

/** Current session user, falling back to the seeded member for demos. */
export function useSessionUser(): User {
  const user = useAuthStore((s) => s.user);
  return user ?? db.currentUser;
}
