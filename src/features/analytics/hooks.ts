"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useKpis() {
  return useQuery({ queryKey: queryKeys.analytics.kpis, queryFn: () => api.analytics.kpis() });
}

export function useFacilitySummary() {
  return useQuery({
    queryKey: queryKeys.analytics.facility,
    queryFn: () => api.analytics.facilitySummary(),
  });
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

export function useBookingTypeBreakdown() {
  return useQuery({
    queryKey: queryKeys.analytics.bookingTypes,
    queryFn: () => api.analytics.bookingTypeBreakdown(),
  });
}

export function useRevenueByCourt() {
  return useQuery({
    queryKey: queryKeys.analytics.revenueByCourt,
    queryFn: () => api.analytics.revenueByCourt(),
  });
}

export function useRevenueBySection() {
  return useQuery({
    queryKey: queryKeys.analytics.revenueBySection,
    queryFn: () => api.analytics.revenueBySection(),
  });
}

export function useSectionUtilization() {
  return useQuery({
    queryKey: queryKeys.analytics.sectionUtil,
    queryFn: () => api.analytics.sectionUtilization(),
  });
}

export function useCourtUtilization() {
  return useQuery({
    queryKey: queryKeys.analytics.courtUtil,
    queryFn: () => api.analytics.courtUtilization(),
  });
}
