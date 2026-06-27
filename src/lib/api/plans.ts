import { db } from "@/lib/mock/data";
import { notFound, ok } from "./client";

export const plansApi = {
  list: () => ok(db.plans),
  get: (id: string) => {
    const p = db.plans.find((x) => x.id === id);
    return p ? ok(p) : notFound("Plan");
  },
};
