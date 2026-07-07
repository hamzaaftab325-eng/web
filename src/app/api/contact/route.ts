import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { sanitizeObject } from "@/lib/security";
import { sendContactNotificationEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/contact
 *
 * Security:
 *   - Rate limited via Upstash Redis: 5 messages per hour per IP.
 *     (Previously used an in-memory Map — broken on Vercel serverless because
 *     each function instance has its own Map. Upstash is shared across all
 *     instances.)
 *   - Input HTML-sanitized to prevent stored XSS in admin notifications.
 */
export async function POST(req: NextRequest) {
  try {
    const blocked = await rateLimit(req, 5, "1 h", `contact:${getClientIp(req)}`);
    if (blocked) return blocked;

    const body = await req.json();
    const { name, email, subject, message } = sanitizeObject(body);

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
        /* non-blocking */
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
