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

const JWT_SECRET = process.env.JWT_SECRET || "fallback-dev-secret-change-in-production-32chars";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JwtPayload { userId: string; email: string; role: string; }

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" } as jwt.SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign({ ...payload, type: "refresh" }, JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function sanitizeUser(user: { id: string; email: string; passwordHash: string; firstName: string; lastName: string; phone: string | null; role: string; isActive: boolean; createdAt: Date; }) {
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, role: user.role, isActive: user.isActive, createdAt: user.createdAt.toISOString() };
}
