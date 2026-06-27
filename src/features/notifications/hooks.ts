"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: queryKeys.notifications.list(userId),
    queryFn: () => api.notifications.list(userId),
  });
}

export function useMarkAllRead(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.notifications.markAllRead(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) }),
  });
}

export function useMarkRead(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) }),
  });
}
