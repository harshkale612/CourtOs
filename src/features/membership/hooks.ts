"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function usePlans() {
  return useQuery({ queryKey: queryKeys.plans.list, queryFn: () => api.plans.list() });
}

export function useMembership(userId: string) {
  return useQuery({
    queryKey: queryKeys.members.membership(userId),
    queryFn: () => api.members.membershipFor(userId),
  });
}
