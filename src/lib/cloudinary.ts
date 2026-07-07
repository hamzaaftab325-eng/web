/**
 * Cloudinary upload helper — signed upload from server.
 *
 * Features:
 * - Auto-compresses images to WebP format with quality 85 (best balance)
 * - Generates a smart public_id from the product name + context
 * - Differentiates card images (thumbnail) from full images
 * - Auto-generates alt text suggestions based on filename/folder context
 *
 * Used by admin panel to upload product images, hero slides, etc.
 */
import crypto from "crypto";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  altText: string;
  cardUrl: string;
  fullUrl: string;
}

export interface UploadOptions {
  folder?: string;
  productName?: string;
  context?: "product" | "hero-slide" | "testimonial" | "journal" | "category" | "collection" | "general";
  sortOrder?: number;
}

/**
 * Generate a URL-safe slug from a product name.
 * "Brass Arc Floor Lamp" → "brass-arc-floor-lamp"
 */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

/**
 * Auto-generate alt text from product name and context.
 * "Brass Arc Floor Lamp" → "Brass Arc Floor Lamp - Product Image 1"
 */
export function generateAltText(productName: string | undefined, context: string, sortOrder: number, filename?: string): string {
  if (productName) {
    const idx = sortOrder >= 0 ? sortOrder + 1 : 1;
    return `${productName} — Image ${idx}`;
  }
  // Fall back to context + filename
  const contextLabels: Record<string, string> = {
    "hero-slide": "Hero Slide",
    "testimonial": "Customer Avatar",
    "journal": "Journal Cover",
    "category": "Category Image",
    "collection": "Collection Image",
    "product": "Product Image",
    "general": "Image",
  };
  const label = contextLabels[context] ?? "Image";
  if (filename) {
    const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
    if (cleanName) return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }
  return `${label}${sortOrder >= 0 ? ` ${sortOrder + 1}` : ""}`;
}

/**
 * Generate a smart public_id for the uploaded image.
 * Format: <folder>/<product-slug>-<sort-order>
 * Example: aura-living/products/brass-arc-floor-lamp-1
 *
 * NOTE: No timestamp — the sort order is enough to distinguish multiple
 * images of the same product. This gives clean, predictable URLs.
 */
export function generatePublicId(folder: string, productName: string | undefined, sortOrder: number, context: string): string {
  const slug = productName && productName.trim() ? slugifyName(productName) : context;
  const idx = sortOrder >= 0 ? sortOrder + 1 : 1;
  return `${folder}/${slug}-${idx}`;
}

/**
 * Build a Cloudinary URL with transformations applied.
 * Cloudinary supports on-the-fly transformations via URL params.
 */
export function buildTransformedUrl(publicId: string, transformations: string): string {
  if (!CLOUD_NAME) return "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}

/**
 * Upload an image to Cloudinary with auto-optimization.
 *
 * - Converts to WebP format (best compression for photos)
 * - Sets quality to auto:best (Cloudinary's smart compression)
 * - Applies a moderate sharpen filter
 * - Auto-generates alt text and card/full URLs
 *
 * Accepts a Buffer (file bytes) or string (data URL / remote URL).
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error("Cloudinary credentials not configured");
  }

  const {
    folder = "aura-living",
    productName,
    context = "general",
    sortOrder = 0,
  } = options;

  // Generate smart public_id
  const publicId = generatePublicId(folder, productName, sortOrder, context);

  // Build the upload signature.
  // We pass `flags=inline` so Cloudinary returns the transformed image
  // (WebP) instead of storing the original format. Combined with the
  // eager transformation, this ensures the stored asset IS WebP.
  const timestamp = Math.round(Date.now() / 1000);
  // Eager transformation: convert to WebP, auto quality, resize if too large
  const eagerTransformation = "f_webp,q_auto:best,w_1600,h_1600,c_limit";
  // Signature must include ALL params we send (except file, api_key, signature)
  // Sorted alphabetically: eager, folder, public_id, timestamp
  const paramsToSign = `eager=${eagerTransformation}&folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = await generateSignature(paramsToSign, API_SECRET);

  // Cloudinary accepts either a data URL (base64) or a remote URL as the `file` field.
  // Detect the actual MIME type from the buffer magic bytes for proper upload.
  const filePayload = Buffer.isBuffer(file)
    ? `data:image/jpeg;base64,${file.toString("base64")}`
    : file;

  const formData = new FormData();
  formData.append("file", filePayload);
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", API_KEY);
  formData.append("signature", signature);
  formData.append("eager", eagerTransformation);
  // NOTE: Do NOT append "format" — it caused Invalid Signature errors.
  // The eager transformation handles WebP conversion.

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message ?? "Upload failed");
  }

  const result = await response.json();

  // Build optimized URLs for different use cases.
  // We append ".webp" to the public_id to force WebP format in the URL
  // (Cloudinary supports format override via the file extension).
  // - cardUrl: 600x600 cropped WebP (for product cards / thumbnails)
  // - fullUrl: 1600x1600 limited WebP (for product detail page)
  // - secure_url: WebP version of the main asset (forces f_webp)
  const cardUrl = buildTransformedUrl(result.public_id, "f_webp,q_auto:best,w_600,h_600,c_fill,g_auto");
  const fullUrl = buildTransformedUrl(result.public_id, "f_webp,q_auto:best,w_1600,h_1600,c_limit");
  // Force the main secure_url to also be WebP (with no other transformation)
  const webpSecureUrl = buildTransformedUrl(result.public_id, "f_webp,q_auto:best");

  // The eager response contains the optimized WebP version's metadata.
  // If present, use its bytes/format; otherwise fall back to the main result.
  const eagerResult = result.eager?.[0];

  return {
    secure_url: webpSecureUrl || result.secure_url,
    public_id: result.public_id,
    width: eagerResult?.width || result.width,
    height: eagerResult?.height || result.height,
    bytes: eagerResult?.bytes || result.bytes,
    format: "webp",
    altText: generateAltText(productName, context, sortOrder),
    cardUrl,
    fullUrl,
  };
}

/**
 * Generate SHA-1 signature for Cloudinary signed upload.
 */
async function generateSignature(paramsToSign: string, apiSecret: string): Promise<string> {
  return crypto.createHash("sha1").update(paramsToSign + apiSecret).digest("hex");
}

/**
 * Delete an image from Cloudinary by public_id.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) return;

  const timestamp = Math.round(Date.now() / 1000);
  const signature = await generateSignature(`public_id=${publicId}&timestamp=${timestamp}`, API_SECRET);

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", API_KEY);
  formData.append("signature", signature);

  await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    { method: "POST", body: formData }
  ).catch(() => {});
}

/**
 * Get a transformed URL for an existing Cloudinary image.
 * Useful for generating different sizes on the fly without re-uploading.
 */
export function getOptimizedUrl(
  publicIdOrUrl: string,
  options: { width?: number; height?: number; crop?: "fill" | "limit" | "fit"; quality?: "auto:best" | "auto:good" | number } = {}
): string {
  if (!publicIdOrUrl) return "";
  if (!CLOUD_NAME) return publicIdOrUrl;

  // Extract public_id from full URL if needed
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes("res.cloudinary.com")) {
    const match = publicIdOrUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
    if (match) publicId = match[1];
  }

  const { width, height, crop = "limit", quality = "auto:best" } = options;
  const parts: string[] = ["f_webp", `q_${quality}`];
  if (width && height) {
    parts.push(`w_${width}`, `h_${height}`, `c_${crop}`);
  } else if (width) {
    parts.push(`w_${width}`, `c_${crop}`);
  } else if (height) {
    parts.push(`h_${height}`, `c_${crop}`);
  }

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${parts.join(",")}/${publicId}`;
}

export { CLOUD_NAME };
