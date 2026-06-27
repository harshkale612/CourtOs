"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useReservationsByDate(dateISO: string) {
  return useQuery({
    queryKey: queryKeys.reservations.byDate(dateISO),
    queryFn: () => api.reservations.listByDate(dateISO),
  });
}

export function useAllTransactions() {
  return useQuery({
    queryKey: queryKeys.payments.transactions(),
    queryFn: () => api.payments.transactions(),
  });
}
