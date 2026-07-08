import type { AuthUser } from "@/store/use-auth-store";

import { api } from "./client";
export interface LoginRequest { email: string; password: string; }
export interface SignupRequest { firstName: string; lastName: string; email: string; password: string; joinNewsletter: boolean; }
export interface AuthResponse { user: AuthUser; token: string; }
export async function login(data: LoginRequest): Promise<AuthResponse> { return api.post<AuthResponse>("/api/auth/login", data); }
export async function signup(data: SignupRequest): Promise<AuthResponse> { return api.post<AuthResponse>("/api/auth/register", data); }
export async function getProfile(): Promise<AuthUser> { return api.get<AuthUser>("/api/auth/me"); }
