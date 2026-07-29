"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Product, StockAdjustmentReason } from "@/types";
import { api, type CreateOrderInput } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

/* --------------------------------- reads --------------------------------- */
export function useProducts() {
  return useQuery({ queryKey: queryKeys.pos.products, queryFn: () => api.pos.products() });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.pos.product(id),
    queryFn: () => api.pos.product(id),
    enabled: !!id,
  });
}

export function useLowStock() {
  return useQuery({ queryKey: queryKeys.pos.lowStock, queryFn: () => api.pos.lowStock() });
}

export function usePosOrders(opts?: { limit?: number; dateISO?: string }) {
  return useQuery({
    queryKey: queryKeys.pos.orders(opts?.dateISO, opts?.limit),
    queryFn: () => api.pos.orders(opts),
  });
}

export function usePosOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.pos.order(id),
    queryFn: () => api.pos.order(id),
    enabled: !!id,
  });
}

export function useStockAdjustments(productId?: string) {
  return useQuery({
    queryKey: queryKeys.pos.stockAdjustments(productId),
    queryFn: () => api.pos.stockAdjustments(productId),
  });
}

export function useCreditBalance(userId?: string) {
  return useQuery({
    queryKey: queryKeys.pos.creditBalance(userId),
    queryFn: () => api.pos.creditBalance(userId),
    enabled: !!userId,
  });
}

/* -------------------------------- reports -------------------------------- */
export function usePosKpis() {
  return useQuery({ queryKey: queryKeys.pos.kpis, queryFn: () => api.pos.posKpis() });
}

export function useSalesSummary() {
  return useQuery({ queryKey: queryKeys.pos.summary, queryFn: () => api.pos.salesSummary() });
}

export function useSalesSeries(days = 14) {
  return useQuery({
    queryKey: queryKeys.pos.salesSeries(days),
    queryFn: () => api.pos.salesSeries(days),
  });
}

export function useBestSellers(limit = 8) {
  return useQuery({
    queryKey: queryKeys.pos.bestSellers(limit),
    queryFn: () => api.pos.bestSellers(limit),
  });
}

export function useRevenueByCategory() {
  return useQuery({
    queryKey: queryKeys.pos.revenueByCategory,
    queryFn: () => api.pos.revenueByCategory(),
  });
}

export function useInventoryValue() {
  return useQuery({
    queryKey: queryKeys.pos.inventoryValue,
    queryFn: () => api.pos.inventoryValue(),
  });
}

/* ------------------------------- mutations ------------------------------- */
function invalidatePos(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["pos"] });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => api.pos.createOrder(input),
    onSuccess: (order) => {
      toast.success("Sale complete", { description: `${order.number} · rung through the register.` });
      invalidatePos(qc);
      // POS sales land in the shared ledger — refresh Billing/Analytics too.
      qc.invalidateQueries({ queryKey: ["payments", "transactions"] });
    },
    onError: (err) => {
      const msg = err instanceof Error && err.message ? err.message : "Couldn't complete the sale.";
      toast.error(msg);
    },
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      productId: string;
      delta: number;
      reason: StockAdjustmentReason;
      note?: string;
      by: string;
    }) => api.pos.adjustStock(input),
    onSuccess: (p) => {
      toast.success("Stock updated", { description: `${p.name} · ${p.stock} on hand.` });
      invalidatePos(qc);
    },
    onError: (err) => {
      const msg = err instanceof Error && err.message ? err.message : "Couldn't adjust stock.";
      toast.error(msg);
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof api.pos.createProduct>[0]) => api.pos.createProduct(input),
    onSuccess: (p) => {
      toast.success("Product added", { description: p.name });
      invalidatePos(qc);
    },
    onError: () => toast.error("Couldn't add product."),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Product> }) =>
      api.pos.updateProduct(id, patch),
    onSuccess: () => {
      toast.success("Product saved");
      invalidatePos(qc);
    },
    onError: () => toast.error("Couldn't save product."),
  });
}
