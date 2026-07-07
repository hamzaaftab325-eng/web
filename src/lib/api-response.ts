import { NextResponse } from "next/server";

import { ZodError } from "zod";

/**
 * Consistent API response helpers.
 *
 * All API routes should use these instead of constructing NextResponse
 * directly. This enforces:
 *   - Same JSON shape for every error: { error, code, details? }
 *   - Same JSON shape for every success: { data?, message?, ...rest }
 *   - No leaking of internal error messages (use safeError() helper)
 *
 * Replaces the ~15 sites that currently do:
 *   return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, ...)
 * which leaks Prisma error messages (e.g. "Foreign key constraint failed on field: ...")
 * to the client.
 */

/**
 * Standard error response shape.
 */
export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
  retryAfter?: number;
}

/**
 * Build a 400 Bad Request response.
 */
export function apiBadRequest(code: string, error: string, details?: unknown): NextResponse {
  return NextResponse.json({ error, code, details } satisfies ApiError, { status: 400 });
}

/**
 * Build a 401 Unauthorized response.
 */
export function apiUnauthorized(code = "UNAUTHORIZED", error = "Authentication required"): NextResponse {
  return NextResponse.json({ error, code } satisfies ApiError, { status: 401 });
}

/**
 * Build a 403 Forbidden response.
 */
export function apiForbidden(code = "FORBIDDEN", error = "Access denied"): NextResponse {
  return NextResponse.json({ error, code } satisfies ApiError, { status: 403 });
}

/**
 * Build a 404 Not Found response.
 */
export function apiNotFound(code = "NOT_FOUND", error = "Resource not found"): NextResponse {
  return NextResponse.json({ error, code } satisfies ApiError, { status: 404 });
}

/**
 * Build a 409 Conflict response (e.g. email already exists).
 */
export function apiConflict(code: string, error: string): NextResponse {
  return NextResponse.json({ error, code } satisfies ApiError, { status: 409 });
}

/**
 * Build a 410 Gone response (e.g. expired/used token).
 */
export function apiGone(code: string, error: string): NextResponse {
  return NextResponse.json({ error, code } satisfies ApiError, { status: 410 });
}

/**
 * Build a 413 Payload Too Large response.
 */
export function apiTooLarge(code = "PAYLOAD_TOO_LARGE", error = "Request body too large"): NextResponse {
  return NextResponse.json({ error, code } satisfies ApiError, { status: 413 });
}

/**
 * Build a 429 Too Many Requests response.
 */
export function apiTooManyRequests(code = "RATE_LIMITED", error = "Too many requests", retryAfterSec = 60): NextResponse {
  return NextResponse.json(
    { error, code, retryAfter: retryAfterSec } satisfies ApiError,
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  );
}

/**
 * Build a 500 Internal Server Error response.
 * NEVER pass the raw error.message — use safeError() to sanitize first.
 */
export function apiServerError(code = "INTERNAL_ERROR", error = "Something went wrong"): NextResponse {
  return NextResponse.json({ error, code } satisfies ApiError, { status: 500 });
}

/**
 * Build a 200 OK success response.
 */
export function apiSuccess<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({ ...(message ? { message } : {}), ...data });
}

/**
 * Build a 201 Created success response.
 */
export function apiCreated<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({ ...(message ? { message } : {}), ...data }, { status: 201 });
}

/**
 * Convert a ZodError into a 400 Bad Request response with field-level details.
 */
export function apiValidationError(error: ZodError, code = "VALIDATION_ERROR"): NextResponse {
  return NextResponse.json(
    {
      error: "Invalid input",
      code,
      details: error.flatten(),
    } satisfies ApiError,
    { status: 400 },
  );
}

/**
 * Sanitize an unknown caught error into a safe user-facing message.
 *
 * NEVER pass `error.message` directly to the client — Prisma errors leak
 * schema internals (e.g. "Foreign key constraint failed on field: userId").
 *
 * This function:
 *   - Returns the provided fallback message by default
 *   - Detects well-known Prisma error codes and returns safe messages
 *   - Logs the real error to console.error for server-side debugging
 *
 * @example
 *   } catch (error) {
 *     console.error("[orders] Error:", error);
 *     return apiServerError("ORDER_ERROR", safeError(error, "Failed to create order"));
 *   }
 */
export function safeError(error: unknown, fallback: string): string {
  // Log the real error server-side for debugging
  console.error("[api] Error:", error);

  // Detect Prisma errors by their P-code shape
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case "P2002":
        return "A record with this value already exists.";
      case "P2003":
        return "This action references a record that doesn't exist.";
      case "P2025":
        return "Record not found.";
      case "P2014":
        return "Invalid relationship between records.";
      default:
        return fallback;
    }
  }

  return fallback;
}
