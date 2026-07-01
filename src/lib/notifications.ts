import { db } from "@/lib/db";

/**
 * Notification creation helper.
 *
 * Creates a notification for a specific user. Used by:
 * - Order status changes (notifies the customer)
 * - New review submitted (notifies admins)
 * - New order placed (notifies admins)
 * - Low stock alerts (notifies admins)
 * - Review approved/rejected (notifies the reviewer)
 */

export type NotificationType =
  | "order_status"
  | "new_order"
  | "new_review"
  | "review_approved"
  | "review_rejected"
  | "low_stock"
  | "new_subscriber"
  | "system";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a single user.
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams): Promise<void> {
  try {
    await db.notification.create({
      data: { userId, type, title, message, link },
    });
  } catch (error) {
    console.error("[notification] failed to create:", error);
  }
}

/**
 * Create a notification for all admin users.
 * Used for: new orders, new reviews, low stock, new subscribers.
 */
export async function notifyAdmins(
  type: NotificationType,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  try {
    const admins = await db.user.findMany({
      where: { role: "admin", isActive: true },
      select: { id: true },
    });
    if (admins.length === 0) return;
    await db.notification.createMany({
      data: admins.map(a => ({ userId: a.id, type, title, message, link })),
    });
  } catch (error) {
    console.error("[notification] failed to notify admins:", error);
  }
}
