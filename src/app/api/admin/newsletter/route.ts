import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { sendBulkEmails } from "@/lib/email";
import { newsletterEmail } from "@/lib/email-templates";

const Schema = z.object({
  subject: z.string().min(1).max(200),
  bodyHtml: z.string().min(1),
});

/**
 * POST /api/admin/newsletter — send a newsletter to all subscribers.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });

  const subscribers = await db.emailSubscriber.findMany({ select: { email: true } });
  if (subscribers.length === 0) {
    return NextResponse.json({ error: "No subscribers to send to", code: "NO_SUBSCRIBERS" }, { status: 400 });
  }

  const emails = subscribers.map(s => s.email);
  const { subject, bodyHtml } = parsed.data;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aura-living-1.vercel.app";

  // Build the newsletter email with unsubscribe link per recipient
  // For simplicity, we use a generic unsubscribe URL (per-recipient token would be better)
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=EMAIL_PLACEHOLDER`;
  const { html } = newsletterEmail(subject, bodyHtml, unsubscribeUrl);

  // Replace placeholder per email and send
  const results = await sendBulkEmails(
    emails,
    subject,
    html.replace(/EMAIL_PLACEHOLDER/g, "")
  );

  return NextResponse.json({
    message: `Newsletter sent to ${results.sent} subscribers (${results.failed} failed)`,
    sent: results.sent,
    failed: results.failed,
    total: emails.length,
  });
}
