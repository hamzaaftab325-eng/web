import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";
import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * POST /api/upload
 * Admin-only image upload to Cloudinary with auto-optimization.
 *
 * Features:
 * - Accepts multipart/form-data with `file` (Blob) + optional metadata
 * - Auto-compresses to WebP with quality auto:best
 * - Auto-generates alt text from product name + context
 * - Returns cardUrl (600x600) + fullUrl (1600x1600) + altText
 *
 * Form fields:
 * - file: Blob (required)
 * - folder: string (default: "aura-living")
 * - productName: string (optional — used for naming + alt text)
 * - context: "product" | "hero-slide" | "testimonial" | "journal" | "category" | "collection" | "general"
 * - sortOrder: number (default: 0 — used for image numbering)
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
    const productName = (formData.get("productName") as string | null) ?? undefined;
    const context = (formData.get("context") as string | null) ?? "general";
    const sortOrderStr = formData.get("sortOrder") as string | null;
    const sortOrder = sortOrderStr ? parseInt(sortOrderStr, 10) : 0;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    // Reject non-image MIME types
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    // 10 MB safety ceiling (was 8 — allow larger hero images)
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 10 MB)", code: "VALIDATION_ERROR" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, {
      folder,
      productName,
      context: context as "product" | "hero-slide" | "testimonial" | "journal" | "category" | "collection" | "general",
      sortOrder,
    });

    return NextResponse.json({
      url: result.secure_url,
      cardUrl: result.cardUrl,
      fullUrl: result.fullUrl,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
      altText: result.altText,
    });
  } catch (error) {
    console.error("[upload] failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed", code: "UPLOAD_ERROR" },
      { status: 500 }
    );
  }
}
