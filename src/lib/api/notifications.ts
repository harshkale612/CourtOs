import { db } from "@/lib/mock/data";
import { ok } from "./client";

export const notificationsApi = {
  list: (userId: string) =>
    ok(
      db.notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    ),

  unreadCount: (userId: string) =>
    ok(db.notifications.filter((n) => n.userId === userId && !n.read).length),

  markRead: (id: string) => {
    const n = db.notifications.find((x) => x.id === id);
    if (n) n.read = true;
    return ok({ id });
  },

  markAllRead: (userId: string) => {
    db.notifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true));
    return ok({ ok: true });
  },
};
