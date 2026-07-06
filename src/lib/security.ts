/**
 * Security helpers — input sanitization, HTML stripping, validation.
 */

/**
 * Strip HTML tags from a string to prevent XSS.
 * Used on all user-submitted text fields (reviews, names, notes, etc.)
 *
 * IMPORTANT: We do NOT decode HTML entities back to characters.
 * If we did, an input like `&lt;script&gt;alert(1)&lt;/script&gt;` would:
 *   1. Pass through the tag strip (no `<` to match)
 *   2. Get decoded to `<script>alert(1)</script>`
 * This would re-introduce XSS. By only stripping tags and leaving
 * entities encoded, the output is safe for rendering in any context.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize an object's string fields recursively.
 * Returns a new object with all string values stripped of HTML.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeHtml(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === "string" ? sanitizeHtml(item) :
        typeof item === "object" && item !== null ? sanitizeObject(item as Record<string, unknown>) :
        item
      );
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/**
 * Validate password strength.
 * Returns null if valid, or an error message if invalid.
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character";
  return null;
}

/**
 * Security headers to add to API responses.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/**
 * Add security headers to a NextResponse.
 */
import { NextResponse } from "next/server";

export function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}