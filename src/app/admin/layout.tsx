import type { ReactNode } from "react";

import { AdminShell } from "@/components/aura/admin/AdminShell";
import { requireAdminServer } from "@/lib/auth-guard";

/**
 * Admin Layout — Server Component.
 *
 * Phase 4A-1: Converted from "use client" to Server Component.
 *
 * Benefits:
 * - No auth flash — page renders only after server-side auth check
 * - No client-side useEffect + fetch round-trip
 * - Admin user data fetched from DB on every request (fresh role check)
 * - Automatic token refresh if access token is expired (server-side)
 * - Smaller client bundle — auth logic stays on server
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminServer();

  return <AdminShell user={user}>{children}</AdminShell>;
}
