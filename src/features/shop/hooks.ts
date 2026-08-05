"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type PlaceShopOrderInput } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

/* --------------------------------- reads ---------------------------------- */
export function useShopProducts() {
  return useQuery({ queryKey: queryKeys.shop.products, queryFn: () => api.shop.products() });
}

export function useShopProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.shop.product(id),
    queryFn: () => api.shop.product(id),
    enabled: !!id,
  });
}

export function useRelatedProducts(id: string) {
  return useQuery({
    queryKey: queryKeys.shop.related(id),
    queryFn: () => api.shop.related(id),
    enabled: !!id,
  });
}

export function useMyOrders(userId: string) {
  return useQuery({
    queryKey: queryKeys.shop.orders(userId),
    queryFn: () => api.shop.myOrders(userId),
    enabled: !!userId,
  });
}

export function useMyOrder(userId: string, orderId: string) {
  return useQuery({
    queryKey: queryKeys.shop.order(userId, orderId),
    queryFn: () => api.shop.myOrder(userId, orderId),
    enabled: !!userId && !!orderId,
  });
}

/** Orders still waiting to be collected — surfaced on the dashboard & shop. */
export function useActivePickups(userId: string) {
  return useQuery({
    queryKey: queryKeys.shop.pickups(userId),
    queryFn: () => api.shop.activePickups(userId),
    enabled: !!userId,
  });
}

/* ------------------------------- mutations -------------------------------- */
function invalidateCommerce(qc: ReturnType<typeof useQueryClient>, userId: string) {
  qc.invalidateQueries({ queryKey: queryKeys.shop.orders(userId) });
  qc.invalidateQueries({ queryKey: queryKeys.shop.pickups(userId) });
  qc.invalidateQueries({ queryKey: queryKeys.shop.products });
  // A member sale moves the same stock & ledger the register reads.
  qc.invalidateQueries({ queryKey: ["pos"] });
  qc.invalidateQueries({ queryKey: ["payments", "transactions"] });
}

export function usePlaceShopOrder(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceShopOrderInput) => api.shop.placeOrder(input),
    onSuccess: (order) => {
      toast.success("Order placed", {
        description: `${order.number} · we'll let you know when it's ready.`,
      });
      invalidateCommerce(qc, userId);
    },
    onError: (err) => {
      const msg =
        err instanceof Error && err.message ? err.message : "Couldn't place your order.";
      toast.error(msg);
    },
  });
}

/**
 * Rebuild a past basket. Resolves to the fresh lines so the caller can drop
 * them straight into the cart; warns about anything that changed.
 */
export function useReorder() {
  return useMutation({
    mutationFn: (orderId: string) => api.shop.reorder(orderId),
    onSuccess: (result) => {
      const count = result.lineItems.reduce((s, l) => s + l.quantity, 0);
      toast.success(`${count} item${count === 1 ? "" : "s"} back in your cart`);
      if (result.unavailable.length) {
        toast.warning("Some items are unavailable", {
          description: result.unavailable.join(", "),
        });
      }
      if (result.adjusted.length) {
        toast.info("Quantities trimmed to available stock", {
          description: result.adjusted.join(", "),
        });
      }
    },
    onError: (err) => {
      const msg = err instanceof Error && err.message ? err.message : "Couldn't reorder that.";
      toast.error(msg);
    },
  });
}
