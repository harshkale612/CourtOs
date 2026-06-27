import type { Sport } from "@/types";
import { db } from "@/lib/mock/data";
import { notFound, ok } from "./client";

export const coachesApi = {
  list: (sport?: Sport) =>
    ok(sport ? db.coaches.filter((c) => c.specialties.includes(sport)) : db.coaches),

  get: (id: string) => {
    const c = db.coaches.find((x) => x.id === id);
    return c ? ok(c) : notFound("Coach");
  },
};
