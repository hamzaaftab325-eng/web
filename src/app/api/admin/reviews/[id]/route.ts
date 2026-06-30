import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { createNotification } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";
import { reviewApprovedEmail } from "@/lib/email-templates";

const ReviewUpdateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

/**
 * PUT /api/admin/reviews/[id] — approve/reject a review (admin only).
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();
    const parsed = ReviewUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const review = await db.review.update({ where: { id }, data: parsed.data, include: { product: { select: { slug: true } } } });

    // Notify the reviewer if their review was approved or rejected
    if (parsed.data.status && review.userId) {
      const reviewer = await db.user.findUnique({ where: { id: review.userId }, select: { email: true, firstName: true } });
      if (parsed.data.status === "approved") {
        await createNotification({
          userId: review.userId,
          type: "review_approved",
          title: "Review Approved",
          message: `Your review for "${review.product?.slug ?? "a product"}" has been approved and is now visible.`,
          link: `/product/${review.product?.slug ?? ""}`,
        });
        // Send email (fire-and-forget)
        if (reviewer) {
          const { subject, html } = reviewApprovedEmail(review.product?.slug ?? "a product", review.product?.slug ?? "", reviewer.firstName);
          void sendEmail({ to: reviewer.email, subject, html });
        }
      } else if (parsed.data.status === "rejected") {
        await createNotification({
          userId: review.userId,
          type: "review_rejected",
          title: "Review Update",
          message: `Your review was not approved. Please review our community guidelines.`,
          link: "/account",
        });
      }
    }

    return NextResponse.json({ review, message: "Review updated" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/reviews/[id] — permanently delete a review (admin only).
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    await db.review.delete({ where: { id } });
    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "DELETE_ERROR" }, { status: 500 });
  }
}
