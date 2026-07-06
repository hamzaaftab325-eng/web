import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";

export async function GET(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const payload = verifyToken(token);

    const items = await db.wishlist.findMany({ where: { userId: payload.userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(items.map(i => i.productSlug));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const payload = verifyToken(token);

    const { productSlug } = await request.json();
    await db.wishlist.upsert({ where: { userId_productSlug: { userId: payload.userId, productSlug } }, create: { userId: payload.userId, productSlug }, update: {} });
    return NextResponse.json({ message: "Added to wishlist" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "SAVE_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const payload = verifyToken(token);

    const { productSlug } = await request.json();
    await db.wishlist.delete({ where: { userId_productSlug: { userId: payload.userId, productSlug } } }).catch(() => {});
    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "DELETE_ERROR" }, { status: 500 });
  }
}
