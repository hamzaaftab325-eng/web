"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";

/**
 * TanStack Query hooks for user notifications.
 *
 * Phase 5F: Replaces raw fetch+useEffect pattern with proper data fetching.
 */

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

const notificationsKey = ["notifications"] as const;

/** Fetch notifications for the current user. */
export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: [...notificationsKey, { unreadOnly }],
    queryFn: () =>
      api.get<{ notifications: Notification[]; unreadCount: number }>(
        `/api/notifications${unreadOnly ? "?unread=true" : ""}`,
      ),
    staleTime: 10_000, // 10 seconds
  });
}

/** Mark a single notification as read. */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.put(`/api/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey }),
  });
}

/** Mark all notifications as read. */
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.put("/api/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey }),
  });
}
