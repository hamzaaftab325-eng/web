import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth-guard";
import { sanitizeUser } from "@/lib/auth";
import { z } from "zod";

/**
 * GET /api/auth/me — returns the currently authenticated user.
 *
 * SECURITY: Uses `requireUser()` from auth-guard.ts which ONLY accepts access
 * tokens — never refresh tokens. If the access token is expired, returns 401
 * with `{ shouldRefresh: true }` so the client calls `/api/auth/refresh`
 * explicitly. This preserves refresh-token rotation + reuse detection.
 *
 * Previously this route accepted refresh tokens as a fallback auth mechanism,
 * which bypassed the reuse-detection logic in /api/auth/refresh and allowed
 * stolen refresh tokens to mint fresh access tokens indefinitely.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    const user = await db.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Account not found or inactive", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user", code: "AUTH_ERROR" },
      { status: 500 },
    );
  }
}

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(60).optional(),
  lastName: z.string().min(1).max(60).optional(),
  phone: z.string().max(30).optional(),
});

/**
 * PUT /api/auth/me — updates the current user's profile (firstName, lastName, phone).
 *
 * Security:
 *   - Auth via requireUser (access-token only).
 *   - Body validated with Zod (rejects unknown fields, enforces length caps).
 *   - All string fields are HTML-sanitized before persistence.
 *   - Body size limited to 4KB (more than enough for 3 short fields).
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    const contentLength = request.headers.get("content-length");
    if (contentLength && Number(contentLength) > 4096) {
      return NextResponse.json(
        { error: "Request body too large", code: "PAYLOAD_TOO_LARGE" },
        { status: 413 },
      );
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const stripTags = (s: string): string => s.replace(/<[^>]*>/g, "");
    const data: Record<string, string> = {};
    if (parsed.data.firstName !== undefined) data.firstName = stripTags(parsed.data.firstName);
    if (parsed.data.lastName !== undefined) data.lastName = stripTags(parsed.data.lastName);
    if (parsed.data.phone !== undefined) data.phone = stripTags(parsed.data.phone);

    const updated = await db.user.update({
      where: { id: auth.id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: sanitizeUser(updated), message: "Profile updated" });
  } catch {
    return NextResponse.json(
      { error: "Update failed", code: "UPDATE_ERROR" },
      { status: 500 },
    );
  }
}
