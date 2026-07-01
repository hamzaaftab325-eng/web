import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/unsubscribe?email=xxx — unsubscribe an email */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required", code: "VALIDATION_ERROR" }, { status: 400 });

  const subscriber = await db.emailSubscriber.findFirst({ where: { email: email.toLowerCase() } });
  if (subscriber) {
    await db.emailSubscriber.delete({ where: { id: subscriber.id } });
  }

  return NextResponse.json({ message: "Unsubscribed successfully" });
}
