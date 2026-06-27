"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useReservations(userId: string) {
  return useQuery({
    queryKey: queryKeys.reservations.forUser(userId),
    queryFn: () => api.reservations.listForUser(userId),
  });
}

export function useCancelReservation(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.reservations.cancel(id),
    onSuccess: () => {
      toast.success("Reservation cancelled");
      qc.invalidateQueries({ queryKey: queryKeys.reservations.forUser(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.courts.all });
    },
    onError: () => toast.error("Couldn't cancel. Please try again."),
  });
}

export function useRescheduleReservation(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, start, end }: { id: string; start: string; end: string }) =>
      api.reservations.reschedule(id, start, end),
    onSuccess: () => {
      toast.success("Reservation updated");
      qc.invalidateQueries({ queryKey: queryKeys.reservations.forUser(userId) });
    },
    onError: () => toast.error("Couldn't reschedule. Please try again."),
  });
}
