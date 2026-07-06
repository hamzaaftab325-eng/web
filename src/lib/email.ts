import { Resend } from "resend";

/**
 * Email service — sends transactional and marketing emails via Resend.
 *
 * If RESEND_API_KEY is not set, emails are logged to console (development mode).
 * This allows the app to function without email configured — emails just
 * won't actually be sent.
 *
 * To enable email:
 * 1. Sign up at https://resend.com (free tier: 100 emails/day)
 * 2. Add RESEND_API_KEY to .env.local and Vercel env vars
 * 3. Verify your sending domain (or use onboarding@resend.dev for testing)
 */

const apiKey = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const FROM_NAME = "Aura Living";

const resend = apiKey ? new Resend(apiKey) : null;

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email. Returns true if sent, false if failed or in dev mode.
 */
export async function sendEmail({ to, subject, html, from }: EmailParams): Promise<boolean> {
  if (!resend) {
    console.warn(`[email] (dev mode — not sent) To: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: from ?? `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] send error:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Send an email to multiple recipients (for newsletters).
 */
export async function sendBulkEmails(recipients: string[], subject: string, html: string): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  // Send in batches of 50 to avoid rate limits
  const batchSize = 50;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(email => sendEmail({ to: email, subject, html }))
    );
    results.forEach(ok => { if (ok) sent++; else failed++; });

    // Small delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return { sent, failed };
}
