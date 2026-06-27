import type { PaymentMethod } from "@/types";
import { db } from "@/lib/mock/data";
import { ok } from "./client";

let pmCounter = 100;

export const paymentsApi = {
  methods: (userId: string) => ok(db.paymentMethods.filter((m) => m.userId === userId)),

  invoices: (userId: string) =>
    ok(
      db.invoices
        .filter((i) => i.userId === userId)
        .sort((a, b) => +new Date(b.dueAt) - +new Date(a.dueAt)),
    ),

  transactions: (userId?: string) =>
    ok(
      (userId ? db.transactions.filter((t) => t.userId === userId) : db.transactions).sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    ),

  addMethod: (input: Omit<PaymentMethod, "id">): Promise<PaymentMethod> => {
    const method: PaymentMethod = { ...input, id: `pm_${++pmCounter}` };
    if (method.isDefault) db.paymentMethods.forEach((m) => (m.isDefault = false));
    db.paymentMethods.push(method);
    return ok(method, 360);
  },

  removeMethod: (id: string) => {
    const idx = db.paymentMethods.findIndex((m) => m.id === id);
    if (idx >= 0) db.paymentMethods.splice(idx, 1);
    return ok({ id });
  },
};
