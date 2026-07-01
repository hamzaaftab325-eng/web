"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, getOrder, createOrder, type CreateOrderRequest } from "@/lib/api/orders";

/** Fetch order history. */
export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });
}

/** Fetch single order by ID. */
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id),
    enabled: !!id,
  });
}

/** Create order (checkout). */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => createOrder(data),
    onSuccess: () => {
      // Invalidate orders list so it refetches after new order
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
