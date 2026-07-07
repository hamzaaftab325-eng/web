import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Node.js-runtime auth helpers.
 *
 * API routes import from here — they run on the Node.js runtime where
 * `bcryptjs` and `jsonwebtoken` work fine.
 *
 * `src/middleware.ts` (Edge Runtime) MUST NOT import from here — it imports
 * from `./auth-jwt` instead, which uses `jose` (Edge-safe).
 *
 * JWTs signed here (HS256) are verifiable by `verifyTokenEdge` in auth-jwt.ts
 * and vice versa, because both use the same secret + algorithm.
 */

// Security: no hardcoded fallback. In production, throw if JWT_SECRET is
// missing when a token is actually signed/verified (not at module load —
// that would break `next build` which runs in production mode).
function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return "dev-only-secret-not-for-production-use";
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JwtPayload { userId: string; email: string; role: string; }

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" } as jwt.SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign({ ...payload, type: "refresh" }, getJwtSecret(), { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" } as jwt.SignOptions);
}

/**
 * Sign a password reset token with `type: "reset"` claim.
 * 15-minute TTL — short window for security.
 * This token can ONLY be used for password reset, NOT as auth.
 */
export function signResetToken(payload: JwtPayload): string {
  return jwt.sign({ ...payload, type: "reset" }, getJwtSecret(), { expiresIn: "15m" } as jwt.SignOptions);
}

/**
 * Verify a token and return the full payload including `type` claim.
 * Used by the reset-password endpoint to check `type === "reset"`.
 */
export function verifyTokenWithType(token: string): JwtPayload & { type?: string } {
  return jwt.verify(token, getJwtSecret()) as JwtPayload & { type?: string };
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  if (typeof decoded !== "object" || decoded === null || !("userId" in decoded) || !("email" in decoded)) {
    throw new Error("Invalid token payload");
  }
  return decoded as JwtPayload;
}

/**
 * Strip sensitive fields (passwordHash) from a user object before returning
 * it to the client. Accepts the full User shape OR any subset that includes
 * the public fields — callers don't need to fetch passwordHash just to call this.
 */
export function sanitizeUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date | { toISOString: () => string };
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}
