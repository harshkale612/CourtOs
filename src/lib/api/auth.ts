import type { Role, User } from "@/types";
import { db } from "@/lib/mock/data";
import { ok } from "./client";

/** Mock auth — returns a session user for the chosen role. No real auth (MVP). */
function userForRole(role: Role): User {
  if (role === "member") return db.currentUser;
  return {
    ...db.currentUser,
    id: `user_${role}`,
    role,
    name: role === "owner" ? "Jordan Riverside" : role === "coach" ? db.coaches[0].name : "Sam Admin",
    email: `${role}@riverside.club`,
  };
}

export const authApi = {
  login: (input: { email: string; password: string; role?: Role }): Promise<User> =>
    ok(userForRole(input.role ?? "member"), 500),

  signup: (input: { name: string; email: string; role?: Role }): Promise<User> =>
    ok({ ...userForRole(input.role ?? "member"), name: input.name, email: input.email }, 600),

  me: (): Promise<User> => ok(db.currentUser),

  logout: (): Promise<{ ok: true }> => ok({ ok: true }, 200),
};
