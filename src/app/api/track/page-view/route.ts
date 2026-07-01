import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Schema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(500).optional(),
});

/** POST /api/track/page-view — logs a page view */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

    const userAgent = request.headers.get("user-agent") ?? null;
    const sessionId = request.headers.get("x-session-id") ?? null;

    await db.pageView.create({
      data: {
        path: parsed.data.path,
        referrer: parsed.data.referrer ?? null,
        userAgent,
        sessionId,
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
