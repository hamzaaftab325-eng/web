/**
 * Order status shared module.
 *
 * Replaces the 3-way duplication of `statusConfig` in:
 *   - src/app/admin/orders/page.tsx (line ~18)
 *   - src/app/admin/orders/[id]/page.tsx (line ~21)
 *   - src/app/admin/page.tsx (line ~31)
 *
 * Single source of truth for status colors, labels, and the status flow
 * (which statuses can transition to which).
 */

/**
 * Order status values — kept in sync with the DB column type (TEXT, was enum).
 *
 * If you add a new status here, also:
 *   1. Update the statusConfig below
 *   2. Update statusFlow if it has transitions
 *   3. Update the admin UI to render the new status
 */
export const ORDER_STATUSES = [
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "refunded", "failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/**
 * Visual + display config for each status.
 * Used by admin order list, order detail, and dashboard widgets.
 *
 * Two views:
 *   - `label`: human-readable label
 *   - `colorClass`: text color class (e.g. "c-info", "c-success")
 *   - `dotClass`: background class for the dot indicator (e.g. "bg-info")
 *   - `color`: hex color for charts/inline use (Phase 9 will remove inline styles)
 */
export interface StatusConfig {
  label: string;
  /** Text color class (Tailwind design token) */
  colorClass: string;
  /** Background class for the dot indicator */
  dotClass: string;
  /** Hex color for charts/inline use */
  color: string;
}

export const statusConfig: Record<OrderStatus, StatusConfig> = {
  processing: {
    label: "Processing",
    colorClass: "c-info",
    dotClass: "bg-info",
    color: "#D97706",
  },
  packed: {
    label: "Packed",
    colorClass: "c-info",
    dotClass: "bg-info",
    color: "#2563EB",
  },
  shipped: {
    label: "Shipped",
    colorClass: "c-gold-deep",
    dotClass: "bg-gold",
    color: "#4F46E5",
  },
  delivered: {
    label: "Delivered",
    colorClass: "c-success",
    dotClass: "bg-success",
    color: "#16A34A",
  },
  cancelled: {
    label: "Cancelled",
    colorClass: "c-error",
    dotClass: "bg-error",
    color: "#DC2626",
  },
  refunded: {
    label: "Refunded",
    colorClass: "c-warning",
    dotClass: "bg-warning",
    color: "#9333EA",
  },
};

/**
 * Allowed status transitions.
 * Used by the admin "Update Status" form to populate the dropdown.
 *
 * Rules:
 *   - processing → packed, cancelled
 *   - packed → shipped, cancelled
 *   - shipped → delivered, cancelled (rare — only if recalled)
 *   - delivered → refunded (return/refund flow)
 *   - cancelled → (terminal — no further transitions)
 *   - refunded → (terminal)
 */
export const statusFlow: Record<OrderStatus, OrderStatus[]> = {
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

/**
 * Get the next allowed statuses for an order (including the current one).
 * The current status is always included so the admin can "save without changing".
 */
export function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
  return [current, ...statusFlow[current]];
}

/**
 * Type guard: is the given value a valid OrderStatus?
 */
export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

/**
 * Get the StatusConfig for a status, falling back to a neutral gray if unknown.
 */
export function getStatusConfig(status: string): StatusConfig {
  if (isOrderStatus(status)) {
    return statusConfig[status];
  }
  return {
    label: status,
    colorClass: "c-ink-muted",
    dotClass: "bg-ink-muted",
    color: "#6B7280",
  };
}
