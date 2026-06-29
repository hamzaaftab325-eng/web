/**
 * Cloudinary upload helper — signed upload from server.
 * Used by admin panel to upload product images, hero slides, etc.
 */

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
}

/**
 * Upload an image to Cloudinary from a base64 string or buffer.
 * Returns the secure URL + metadata.
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = "aura-living"
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error("Cloudinary credentials not configured");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = await generateSignature(`folder=${folder}&timestamp=${timestamp}`, API_SECRET);

  const formData = new FormData();
  formData.append("file", file as string);
  formData.append("folder", folder);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", API_KEY);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message ?? "Upload failed");
  }

  return response.json();
}

/**
 * Generate SHA-1 signature for Cloudinary signed upload.
 */
async function generateSignature(paramsToSign: string, apiSecret: string): Promise<string> {
  const crypto = require("crypto");
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

export { CLOUD_NAME };
