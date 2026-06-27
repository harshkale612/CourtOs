"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Sport } from "@/types";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useEvents(sport?: Sport) {
  return useQuery({ queryKey: queryKeys.events.list(sport), queryFn: () => api.events.list(sport) });
}

export function useEvent(id: string) {
  return useQuery({ queryKey: queryKeys.events.detail(id), queryFn: () => api.events.get(id) });
}

export function useEventRegistrations(userId: string) {
  return useQuery({
    queryKey: queryKeys.events.registrations(userId),
    queryFn: () => api.events.registrationsFor(userId),
  });
}

export function useRegisterEvent(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => api.events.register(eventId, userId),
    onSuccess: (reg) => {
      toast.success(
        reg.status === "registered" ? "You're registered!" : "Added to the event waitlist",
      );
      qc.invalidateQueries({ queryKey: queryKeys.events.registrations(userId) });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Couldn't register. Please try again."),
  });
}
