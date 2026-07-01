import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeObject } from "@/lib/security";
import { sendContactNotificationEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";

/**
 * POST /api/contact
 *
 * Public endpoint — accepts contact form submissions.
 * Stores the message, notifies admins (in-app + email), and returns success.
 * Rate limited (in-memory, 5 messages per hour per IP) to prevent abuse.
 */

interface RateLimitEntry { count: number; resetTime: number; }
const rateLimitStore = new Map<string, RateLimitEntry>();

function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    // Rate limit: 5 messages per hour per IP.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const allowed = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, subject, message } = sanitizeObject(body);

    // Validate required fields.
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Please enter a message of at least 10 characters." },
        { status: 400 }
      );
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Message is too long (5000 character max)." }, { status: 400 });
    }

    // Store the contact message in the database as a system notification to all admins.
    const adminUsers = await db.user.findMany({
      where: { role: "admin" },
      select: { id: true, email: true },
    });

    const fullMessage = `From: ${name} <${email}>\n\n${message}`;
    const title = `New contact: ${subject || "General enquiry"}`;

    await Promise.all(
      adminUsers.map((admin) =>
        createNotificationSafe({
          userId: admin.id,
          type: "system",
          title,
          message: fullMessage,
          link: "/admin",
        })
      )
    );

    // Send email notification to admins (best-effort, not blocking).
    for (const admin of adminUsers) {
      try {
        const template = sendContactNotificationEmail({
          name,
          email,
          subject: subject || "General enquiry",
          message,
        });
        await sendEmail({
          to: admin.email,
          subject: template.subject,
          html: template.html,
        });
      } catch {
        // Email failure is non-blocking — the in-app notification is enough.
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Safe notification creation — doesn't throw if it fails.
 */
async function createNotificationSafe(params: {
  userId: string;
  type: "system";
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await db.notification.create({ data: params });
  } catch {
    /* non-blocking */
  }
}
