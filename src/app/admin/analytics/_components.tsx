import type { ReactNode } from "react";

import { statusConfig } from "@/lib/order-status";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";


/**
 * Shared chart helper components for the admin analytics dashboard.
 *
 * Phase 5A: Extracted from src/app/admin/analytics/page.tsx (was inline at
 * lines 152-200). These are pure presentation components with no state.
 */

export function ChartCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "bg-gradient-card-warm border border-hairline-cream rounded-sm p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ChartLoading() {
  return (
    <div className="py-16 text-center">
      <div className="aura-loader-ring mx-auto">
        <span className="aura-loader-dot" />
      </div>
    </div>
  );
}

export function ChartEmpty({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="py-16 text-center">
      <Icon size={32} strokeWidth={1} className="c-ink-faint mx-auto mb-3" />
      <p className="t-body c-ink-muted">{message}</p>
    </div>
  );
}

/** Status badge for the recent orders table — color-coded per status. */
export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig];
  const styles: Record<string, string> = {
    delivered: "bg-success/10 c-success border-success/20",
    processing: "bg-gold/10 c-gold-deep border-gold/20",
    shipped: "bg-blue-100 text-blue-700 border-blue-200",
    packed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-error/10 c-error border-error/20",
    refunded: "bg-purple-100 text-purple-700 border-purple-200",
  };
  const styleClass = styles[status] ?? "bg-ink-faint/10 c-ink-muted border-hairline";
  const label = cfg?.label ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full t-label-caps border",
        styleClass,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
