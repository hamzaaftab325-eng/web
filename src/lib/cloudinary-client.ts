/**
 * Client-side Cloudinary URL helpers.
 *
 * These functions transform Cloudinary URLs to add optimization parameters
 * (format, quality, size) on the fly without re-uploading.
 *
 * Used by ProductCard, ProductDetailPage, etc. to request appropriately-sized
 * images for their context (card thumbnail vs full detail view).
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Transform a Cloudinary URL (or public_id) to an optimized version.
 *
 * @param urlOrPublicId - Full Cloudinary URL or just the public_id
 * @param options - { width, height, crop, quality, format }
 * @returns Optimized Cloudinary URL
 *
 * @example
 * // Get a 400x400 cropped card image
 * getCardUrl("https://res.cloudinary.com/.../products/lamp.jpg")
 * // → "https://res.cloudinary.com/.../f_webp,q_auto:best,w_400,h_400,c_fill/products/lamp"
 */
export function getOptimizedUrl(
  urlOrPublicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "limit" | "fit" | "scale";
    quality?: "auto:best" | "auto:good" | "auto:eco" | number;
    format?: "webp" | "auto" | "jpg" | "png";
  } = {}
): string {
  if (!urlOrPublicId) return "";
  if (!CLOUD_NAME) return urlOrPublicId; // Can't optimize without cloud name
  // If it's not a Cloudinary URL, optimize Unsplash URLs, return others as-is
  if (!urlOrPublicId.includes("res.cloudinary.com") && !urlOrPublicId.startsWith("aura-living/")) {
    // Optimize Unsplash URLs with width + quality + format params
    if (urlOrPublicId.includes("images.unsplash.com")) {
      const { width, height, quality = "auto:best" } = options;
      const params = new URLSearchParams();
      params.set("q", quality === "auto:best" ? "80" : "60");
      params.set("format", "webp");
      if (width) params.set("w", String(width));
      if (height) params.set("h", String(height));
      const sep = urlOrPublicId.includes("?") ? "&" : "?";
      return `${urlOrPublicId}${sep}${params.toString()}`;
    }
    return urlOrPublicId;
  }

  // Extract public_id from full URL
  let publicId = urlOrPublicId;
  if (urlOrPublicId.includes("res.cloudinary.com")) {
    const match = urlOrPublicId.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
    if (match) publicId = match[1];
  }

  const {
    width,
    height,
    crop = "limit",
    quality = "auto:best",
    format = "webp",
  } = options;

  const parts: string[] = [`f_${format}`, `q_${quality}`];
  if (width && height) {
    parts.push(`w_${width}`, `h_${height}`, `c_${crop}`);
  } else if (width) {
    parts.push(`w_${width}`, `c_${crop}`);
  } else if (height) {
    parts.push(`h_${height}`, `c_${crop}`);
  }

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${parts.join(",")}/${publicId}`;
}

/**
 * Get a card-sized image (400x500, cropped to fill).
 * Used by ProductCard, wishlist items, cart thumbnails.
 */
export function getCardUrl(url: string): string {
  return getOptimizedUrl(url, { width: 400, height: 500, crop: "fill" });
}

/**
 * Get a thumbnail-sized image (100x100, cropped to fill).
 * Used by cart drawer, order items, admin lists.
 */
export function getThumbUrl(url: string): string {
  return getOptimizedUrl(url, { width: 100, height: 100, crop: "fill" });
}

/**
 * Get a full-size image (1600x1600, limited — won't upscale).
 * Used by ProductDetailPage main image.
 */
export function getFullUrl(url: string): string {
  return getOptimizedUrl(url, { width: 1600, height: 1600, crop: "limit" });
}

/**
 * Get a hero-sized image (1920x1080, cropped to fill).
 * Used by hero slides, category headers.
 */
export function getHeroUrl(url: string): string {
  return getOptimizedUrl(url, { width: 1920, height: 1080, crop: "fill" });
}
