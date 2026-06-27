"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useKpis() {
  return useQuery({ queryKey: queryKeys.analytics.kpis, queryFn: () => api.analytics.kpis() });
}

export function useRevenueSeries() {
  return useQuery({
    queryKey: queryKeys.analytics.revenue,
    queryFn: () => api.analytics.revenueSeries(),
  });
}

export function useUtilizationHeatmap() {
  return useQuery({
    queryKey: queryKeys.analytics.heatmap,
    queryFn: () => api.analytics.utilizationHeatmap(),
  });
}

export function useSportBreakdown() {
  return useQuery({
    queryKey: queryKeys.analytics.sports,
    queryFn: () => api.analytics.sportBreakdown(),
  });
}
