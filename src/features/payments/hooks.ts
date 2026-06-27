"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PaymentMethod } from "@/types";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function usePaymentMethods(userId: string) {
  return useQuery({
    queryKey: queryKeys.payments.methods(userId),
    queryFn: () => api.payments.methods(userId),
  });
}

export function useInvoices(userId: string) {
  return useQuery({
    queryKey: queryKeys.payments.invoices(userId),
    queryFn: () => api.payments.invoices(userId),
  });
}

export function useTransactions(userId?: string) {
  return useQuery({
    queryKey: queryKeys.payments.transactions(userId),
    queryFn: () => api.payments.transactions(userId),
  });
}

export function useAddPaymentMethod(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<PaymentMethod, "id">) => api.payments.addMethod(input),
    onSuccess: () => {
      toast.success("Card added");
      qc.invalidateQueries({ queryKey: queryKeys.payments.methods(userId) });
    },
    onError: () => toast.error("Couldn't add card."),
  });
}

export function useRemovePaymentMethod(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.payments.removeMethod(id),
    onSuccess: () => {
      toast.success("Card removed");
      qc.invalidateQueries({ queryKey: queryKeys.payments.methods(userId) });
    },
  });
}
