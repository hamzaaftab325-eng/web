import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, signAccessToken, signRefreshToken, sanitizeUser } from "@/lib/auth";
import { setAuthCookies } from "@/lib/auth-cookies";

const schema = z.object({
  firstName: z.string().min(1), lastName: z.string().min(1),
  email: z.string().email(), password: z.string().min(8), joinNewsletter: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input", code: "VALIDATION_ERROR" }, { status: 400 });
    const { firstName, lastName, email, password, joinNewsletter } = parsed.data;
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return NextResponse.json({ error: "Account already exists", code: "EMAIL_EXISTS" }, { status: 409 });
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { email: email.toLowerCase(), passwordHash, firstName, lastName, preferences: { create: { newsletter: joinNewsletter, newArrivals: joinNewsletter, saleAlerts: false, orderUpdates: true } } },
      include: { preferences: true },
    });
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 7);
    await db.userSession.create({ data: { userId: user.id, refreshToken, expiresAt } });
    const response = NextResponse.json({ user: sanitizeUser(user), token: accessToken, message: "Account created" });
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Registration failed", code: "REGISTER_ERROR" }, { status: 500 });
  }
}
