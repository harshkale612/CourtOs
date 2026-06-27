"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Sport, SlotAvailability } from "@/types";
import { api, type CreateReservationInput } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useCourts(sport?: Sport) {
  return useQuery({
    queryKey: queryKeys.courts.list(sport),
    queryFn: () => api.courts.list(sport),
  });
}

export function useAvailability(sport: Sport, dateISO: string) {
  return useQuery({
    queryKey: queryKeys.courts.availability(sport, dateISO),
    queryFn: () => api.courts.availability(sport, dateISO),
  });
}

export function useCreateReservation(sport: Sport, dateISO: string, userId: string) {
  const qc = useQueryClient();
  const availKey = queryKeys.courts.availability(sport, dateISO);

  return useMutation({
    mutationFn: (input: CreateReservationInput) => api.reservations.create(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: availKey });
      const prev = qc.getQueryData<SlotAvailability[]>(availKey);
      // optimistically mark the slot unavailable
      qc.setQueryData<SlotAvailability[]>(availKey, (old) =>
        old?.map((s) =>
          s.courtId === input.courtId && s.start === input.start ? { ...s, available: false } : s,
        ),
      );
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(availKey, ctx.prev);
      toast.error("That slot couldn't be booked. Please try another.");
    },
    onSuccess: () => {
      toast.success("Booking confirmed!", { description: "See it in your reservations." });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: availKey });
      qc.invalidateQueries({ queryKey: queryKeys.reservations.forUser(userId) });
    },
  });
}
