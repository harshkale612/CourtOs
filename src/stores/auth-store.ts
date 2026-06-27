import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "@/types";

/**
 * Mock auth/session state. This is the single seam where real auth would plug
 * in later (see docs/00-ARCHITECTURE.md §1). Persisted so refresh keeps you
 * "logged in" during the demo.
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  switchRole: (role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      switchRole: (role) => {
        const user = get().user;
        if (user) set({ user: { ...user, role } });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "volley-auth" },
  ),
);
