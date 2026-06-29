import { NextResponse } from "next/server";

/**
 * GET /api/debug-env
 * Temporary diagnostics endpoint — confirms which server-side env vars are
 * visible to Vercel serverless functions. Safe to call publicly; only
 * booleans are returned, never the values themselves.
 *
 * TODO: delete once env-var issue is resolved.
 */
export async function GET() {
  const has = (name: string): boolean => {
    const v = process.env[name];
    return typeof v === "string" && v.length > 0;
  };

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelRegion: process.env.VERCEL_REGION ?? null,
    runtime: typeof process.uptime === "function" ? "node" : "unknown",
    envFlags: {
      DATABASE_URL: has("DATABASE_URL"),
      DIRECT_URL: has("DIRECT_URL"),
      JWT_SECRET: has("JWT_SECRET"),
      JWT_ACCESS_EXPIRY: has("JWT_ACCESS_EXPIRY"),
      JWT_REFRESH_EXPIRY: has("JWT_REFRESH_EXPIRY"),
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: has("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
      CLOUDINARY_API_KEY: has("CLOUDINARY_API_KEY"),
      CLOUDINARY_API_SECRET: has("CLOUDINARY_API_SECRET"),
      NEXT_PUBLIC_SUPABASE_URL: has("NEXT_PUBLIC_SUPABASE_URL"),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: has("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      SUPABASE_SERVICE_ROLE_KEY: has("SUPABASE_SERVICE_ROLE_KEY"),
    },
    timestamp: new Date().toISOString(),
  });
}
