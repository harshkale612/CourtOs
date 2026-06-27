"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useMembers(page: number, query: string) {
  return useQuery({
    queryKey: queryKeys.members.list(page, query),
    queryFn: () => api.members.list({ page, pageSize: 10, query }),
    placeholderData: keepPreviousData,
  });
}

export function useCoaches() {
  return useQuery({ queryKey: queryKeys.coaches.list(), queryFn: () => api.coaches.list() });
}
