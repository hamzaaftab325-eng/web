import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const payload = verifyToken(token);

    const body = await request.json();
    if (body.isDefault) {
      await db.address.updateMany({ where: { userId: payload.userId }, data: { isDefault: false } });
    }

    const address = await db.address.update({ where: { id, userId: payload.userId }, data: body });
    return NextResponse.json({ address, message: "Address updated" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const payload = verifyToken(token);

    await db.address.delete({ where: { id, userId: payload.userId } });
    return NextResponse.json({ message: "Address deleted" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "DELETE_ERROR" }, { status: 500 });
  }
}
