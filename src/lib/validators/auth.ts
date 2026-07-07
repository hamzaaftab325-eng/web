import { z } from "zod";

/**
 * Auth-related Zod schemas.
 *
 * Shared between API routes and (eventually) client-side forms so validation
 * logic isn't duplicated. Each schema documents where it's used.
 */

/**
 * POST /api/auth/login — login form.
 * Email is lowercased before lookup, so no transform here.
 */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * POST /api/auth/register — signup form.
 * Password strength is validated separately in src/lib/security.ts because
 * the rules are non-trivial (8+ chars, upper, lower, digit, special).
 */
export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(60),
  lastName: z.string().min(1, "Last name is required").max(60),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  joinNewsletter: z.boolean().default(true),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * POST /api/auth/forgot-password — request a reset link.
 * Always returns 200 (prevents email enumeration).
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * POST /api/auth/reset-password — consume a reset token + set new password.
 * Password strength is validated separately in src/lib/security.ts.
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * PUT /api/auth/me — update profile (firstName, lastName, phone).
 * All fields optional — partial updates allowed.
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(60).optional(),
  lastName: z.string().min(1).max(60).optional(),
  phone: z.string().max(30).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
