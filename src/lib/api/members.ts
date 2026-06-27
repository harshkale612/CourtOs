import { db } from "@/lib/mock/data";
import { notFound, ok, paginate } from "./client";

export const membersApi = {
  list: (opts?: { page?: number; pageSize?: number; query?: string }) => {
    const q = opts?.query?.toLowerCase().trim();
    const filtered = q
      ? db.members.filter(
          (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
        )
      : db.members;
    return ok(paginate(filtered, opts?.page ?? 1, opts?.pageSize ?? 10));
  },

  get: (id: string) => {
    const m = db.members.find((x) => x.id === id);
    return m ? ok(m) : notFound("Member");
  },

  membershipFor: (userId: string) => {
    const mem = db.memberships.find((x) => x.userId === userId);
    return ok(mem ?? null);
  },
};
