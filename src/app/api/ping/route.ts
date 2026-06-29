import { NextResponse } from "next/server";

/**
 * GET /api/ping
 * Simplest possible route. Wrapped in try/catch so any boot-level error
 * is returned as JSON instead of crashing the serverless function.
 */
export function GET() {
  try {
    return NextResponse.json({
      ok: true,
      time: Date.now(),
      env: process.env.NODE_ENV,
      hasDb: Boolean(process.env.DATABASE_URL),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
