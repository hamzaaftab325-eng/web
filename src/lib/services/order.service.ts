import { db } from "@/lib/db";

/**
 * Order service layer.
 *
 * Replaces the duplicated `serializeOrder()` pattern that was inlined in:
 *   - src/app/api/orders/route.ts (lines 38-44)
 *   - src/app/api/orders/[id]/route.ts (lines 23-28)
 *
 * Returns plain DTOs (Decimal → number, Date → ISO string) suitable for
 * JSON responses. Never returns raw Prisma models.
 */

/**
 * DTO for a single OrderItem in a serialized order.
 */
export interface OrderItemDTO {
  id: string;
  productSlug: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  variantLabel: string | null;
  lineTotal: number;
}

/**
 * DTO for a serialized Order.
 * Used by both the order-list and order-detail endpoints.
 */
export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  email: string;
  shippingAddress: Record<string, string>;
  orderNotes: string | null;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
}

/**
 * Convert a Prisma Order (with items) to a serialized DTO.
 *
 * Handles:
 *   - Decimal → number conversion (Prisma returns Decimal objects for @db.Decimal columns)
 *   - Date → ISO string (so the client can parse with new Date())
 *   - shippingAddress Json → Record<string, string> (with safe defaults)
 *   - Per-line total calculation
 *
 * @param order Prisma order object with items included
 */
export function serializeOrder(
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    email: string;
    shippingAddress: unknown;
    orderNotes: string | null;
    subtotal: { toNumber: () => number } | number;
    discount: { toNumber: () => number } | number;
    shippingCost: { toNumber: () => number } | number;
    tax: { toNumber: () => number } | number;
    total: { toNumber: () => number } | number;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      productSlug: string;
      productName: string;
      productImage: string | null;
      price: { toNumber: () => number } | number;
      quantity: number;
      variantLabel: string | null;
    }>;
  },
): OrderDTO {
  const toNumber = (v: { toNumber: () => number } | number): number =>
    typeof v === "number" ? v : v.toNumber();

  const safeAddress = (addr: unknown): Record<string, string> => {
    if (typeof addr === "object" && addr !== null) {
      const result: Record<string, string> = {};
      for (const [key, value] of Object.entries(addr as Record<string, unknown>)) {
        result[key] = typeof value === "string" ? value : String(value ?? "");
      }
      return result;
    }
    return {};
  };

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    email: order.email,
    shippingAddress: safeAddress(order.shippingAddress),
    orderNotes: order.orderNotes,
    subtotal: toNumber(order.subtotal),
    discount: toNumber(order.discount),
    shippingCost: toNumber(order.shippingCost),
    tax: toNumber(order.tax),
    total: toNumber(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => {
      const price = toNumber(item.price);
      return {
        id: item.id,
        productSlug: item.productSlug,
        productName: item.productName,
        productImage: item.productImage,
        price,
        quantity: item.quantity,
        variantLabel: item.variantLabel,
        lineTotal: price * item.quantity,
      };
    }),
  };
}

/**
 * Get a single order by ID, scoped to a user.
 * Returns null if the order doesn't exist OR doesn't belong to the user.
 *
 * @param orderId The order ID
 * @param userId The requesting user's ID (for authorization)
 */
export async function getOrderForUser(orderId: string, userId: string): Promise<OrderDTO | null> {
  const order = await db.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  return order ? serializeOrder(order) : null;
}

/**
 * Get all orders for a user, most-recent first.
 */
export async function getOrdersForUser(userId: string, limit = 50): Promise<OrderDTO[]> {
  const orders = await db.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return orders.map(serializeOrder);
}

/**
 * Get a single order by ID for admin view (no user scope — admin can see all).
 */
export async function getOrderById(orderId: string): Promise<OrderDTO | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { firstName: true, lastName: true, email: true } } },
  });
  return order ? serializeOrder(order) : null;
}
