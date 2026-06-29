import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ token: z.string().min(1), newPassword: z.string().min(8) });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", code: "VALIDATION_ERROR" }, { status: 400 });
    // TODO: Verify token + update password
    return NextResponse.json({ message: "Password reset successfully." });
  } catch {
    return NextResponse.json({ error: "Reset failed", code: "RESET_ERROR" }, { status: 500 });
  }
}
