/**
 * Auth API — login, signup, profile.
 */

import { IS_MOCK, api } from "./client";
import type { AuthUser } from "@/store/use-auth-store";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  joinNewsletter: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

/** Login with email + password. */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const [localPart] = data.email.split("@");
    const firstName = localPart
      ? localPart.charAt(0).toUpperCase() + localPart.slice(1).toLowerCase()
      : "Anna";
    return {
      user: {
        id: `aura_${Date.now().toString(36)}`,
        email: data.email,
        firstName,
        lastName: "Marigold",
        createdAt: new Date().toISOString(),
        preferences: { newsletter: true, newArrivals: true, saleAlerts: false, orderUpdates: true },
      },
      token: `aura_demo_${Date.now().toString(36)}`,
    };
  }
  return api.post<AuthResponse>("/auth/login", data);
}

/** Sign up a new account. */
export async function signup(data: SignupRequest): Promise<AuthResponse> {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {
      user: {
        id: `aura_${Date.now().toString(36)}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        createdAt: new Date().toISOString(),
        preferences: {
          newsletter: data.joinNewsletter,
          newArrivals: data.joinNewsletter,
          saleAlerts: false,
          orderUpdates: true,
        },
      },
      token: `aura_demo_${Date.now().toString(36)}`,
    };
  }
  return api.post<AuthResponse>("/auth/signup", data);
}

/** Get current user profile. */
export async function getProfile(): Promise<AuthUser> {
  if (IS_MOCK) {
    // Return null to indicate no profile in mock mode
    throw new Error("No profile in mock mode");
  }
  return api.get<AuthUser>("/auth/profile");
}
