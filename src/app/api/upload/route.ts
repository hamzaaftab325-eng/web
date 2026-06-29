import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";
import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * POST /api/upload
 * Admin-only image upload to Cloudinary.
 * Accepts multipart/form-data with `file` (Blob) and optional `folder` (string).
 * Returns { url, publicId, width, height, bytes, format }.
 */
export async function POST(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    const payload = verifyToken(token);
    if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string | null) ?? "aura-living";

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    // Reject non-image MIME types
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    // 8 MB safety ceiling
    const MAX_BYTES = 8 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 8 MB)", code: "VALIDATION_ERROR" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, folder);

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    });
  } catch (error) {
    console.error("[upload] failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed", code: "UPLOAD_ERROR" },
      { status: 500 }
    );
  }
}
