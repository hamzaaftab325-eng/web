"use client";

import { useMutation } from "@tanstack/react-query";
import { login, signup, type LoginRequest, type SignupRequest } from "@/lib/api/auth";
import { useAuthStore } from "@/store/use-auth-store";
import { useUIStore } from "@/store/use-ui-store";

/** Login mutation — sets user + token in auth store. */
export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
    },
  });
}

/** Signup mutation — sets user + token in auth store. */
export function useSignup() {
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
    },
  });
}
