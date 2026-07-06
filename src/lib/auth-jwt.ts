import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe JWT helpers using the `jose` library.
 *
 * `jose` is a pure-JS JWT library that runs on both the Edge Runtime and
 * Node.js runtime. It replaces `jsonwebtoken` (which uses Node-only APIs like
 * `process.version`, `process.nextTick`, `Buffer`) for the parts of the app
 * that need to run in `src/middleware.ts` (Edge Runtime).
 *
 * The API routes (Node.js runtime) keep using the synchronous `jsonwebtoken`
 * helpers from `auth.ts` for backward compatibility. JWTs signed by either
 * library are interchangeable as long as the same secret + algorithm (HS256)
 * are used.
 *
 * All functions here are ASYNC (return Promises) because jose is async-only.
 */

// Security: lazy getter — only throws when a token is actually signed/verified.
function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return "dev-only-secret-not-for-production-use";
}

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}

export interface JwtPayload { userId: string; email: string; role: string; }

/**
 * Verify a JWT using jose (Edge-safe). Async.
 * Used by src/middleware.ts.
 */
export async function verifyTokenEdge(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
  return {
    userId: String(payload.userId),
    email: String(payload.email),
    role: String(payload.role),
  };
}

// Keep these exports for completeness / future use, but API routes currently
// use the sync jsonwebtoken versions from auth.ts.
export async function signAccessTokenEdge(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_ACCESS_EXPIRY || "15m")
    .sign(getSecretKey());
}

export async function signRefreshTokenEdge(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRY || "7d")
    .sign(getSecretKey());
}
