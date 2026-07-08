import { NextResponse } from "next/server";

import { db } from "@/lib/db";

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number | null;
  env: string;
  latencyMs?: number;
  checks: {
    database: string;
    databaseError?: string;
  };
}

/**
 * GET /api/health
 * Liveness + readiness probe.
 * Returns 200 if app + database are reachable; 503 otherwise.
 */
export async function GET() {
  const startedAt = Date.now();
  const status: HealthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? Math.round(process.uptime()) : null,
    env: process.env.NODE_ENV ?? "development",
    checks: { database: "unknown" },
  };

  try {
    await db.$queryRaw`SELECT 1`;
    status.checks.database = "ok";
  } catch (error) {
    status.status = "degraded";
    status.checks.database = "error";
    status.checks.databaseError = error instanceof Error ? error.message : "unknown";
    return NextResponse.json(status, { status: 503 });
  }

  status.latencyMs = Date.now() - startedAt;
  return NextResponse.json(status);
}
