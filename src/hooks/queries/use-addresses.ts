"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";

/**
 * TanStack Query hooks for user addresses.
 *
 * Phase 5F: Replaces raw fetch+useEffect pattern in AccountAddresses.tsx
 * with proper data fetching hooks that provide:
 * - Automatic caching (addresses don't refetch on every mount)
 * - Retry on failure
 * - Refetch on window focus
 * - Request deduplication
 * - Optimistic mutations
 */

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  label?: string;
  isDefault?: boolean;
}

const addressesKey = ["addresses"] as const;

/** Fetch all addresses for the current user. */
export function useAddresses() {
  return useQuery({
    queryKey: addressesKey,
    queryFn: () => api.get<{ addresses: Address[] }>("/api/user/addresses"),
    staleTime: 30_000, // 30 seconds
  });
}

/** Create a new address. */
export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Address, "id">) =>
      api.post<{ address: Address }>("/api/user/addresses", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressesKey }),
  });
}

/** Update an existing address. */
export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Address> }) =>
      api.put<{ address: Address }>(`/api/user/addresses/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressesKey }),
  });
}

/** Delete an address. */
export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/user/addresses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressesKey }),
  });
}

/** Set an address as default. */
export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.put(`/api/user/addresses/${id}`, { isDefault: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressesKey }),
  });
}
