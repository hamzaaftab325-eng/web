import { NextResponse } from "next/server";

/**
 * GET /api/health/integrations
 *
 * Checks the configuration status of ALL third-party integrations.
 * Returns which are configured vs missing (without exposing secrets).
 *
 * Used by admins to quickly verify all integrations are working.
 */
export async function GET() {
  const integrations = {
    database: {
      configured: Boolean(process.env.DATABASE_URL),
      envVar: "DATABASE_URL",
      status: process.env.DATABASE_URL ? "connected" : "missing",
    },
    supabase: {
      configured: Boolean(process.env.DIRECT_URL),
      envVar: "DIRECT_URL",
      status: process.env.DIRECT_URL ? "connected" : "missing",
    },
    cloudinary: {
      configured: Boolean(
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET
      ),
      envVars: ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? null,
      status:
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
          ? "connected"
          : "missing",
    },
    resend: {
      configured: Boolean(process.env.RESEND_API_KEY),
      envVars: ["RESEND_API_KEY", "EMAIL_FROM"],
      fromEmail: process.env.EMAIL_FROM ?? null,
      status: process.env.RESEND_API_KEY ? "connected" : "missing (emails will log to console, not send)",
      signupUrl: "https://resend.com",
    },
    cron: {
      configured: Boolean(process.env.CRON_SECRET),
      envVar: "CRON_SECRET",
      status: process.env.CRON_SECRET ? "connected" : "missing (cron jobs will return 401)",
    },
    ga4: {
      configured: Boolean(process.env.NEXT_PUBLIC_GA4_ID),
      envVar: "NEXT_PUBLIC_GA4_ID",
      status: process.env.NEXT_PUBLIC_GA4_ID ? "connected" : "missing (analytics tracking disabled)",
      signupUrl: "https://analytics.google.com",
    },
    metaPixel: {
      configured: Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID),
      envVar: "NEXT_PUBLIC_META_PIXEL_ID",
      status: process.env.NEXT_PUBLIC_META_PIXEL_ID ? "connected" : "missing (Facebook tracking disabled)",
      signupUrl: "https://business.facebook.com/events-manager",
    },
    vercelAnalytics: {
      configured: true, // No env var needed — auto-detected on Vercel
      status: "connected",
    },
    vercelSpeedInsights: {
      configured: true, // No env var needed — auto-detected on Vercel
      status: "connected",
    },
  };

  // Count configured vs missing
  const total = Object.keys(integrations).length;
  const configured = Object.values(integrations).filter((i) => i.configured).length;
  const missing = total - configured;

  return NextResponse.json({
    summary: {
      total,
      configured,
      missing,
      percentage: Math.round((configured / total) * 100),
    },
    integrations,
  });
}
