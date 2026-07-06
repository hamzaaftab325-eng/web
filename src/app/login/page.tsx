import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { LoginView } from "@/components/aura/auth/LoginView";

export const metadata: Metadata = pageMetadata("login", "/login");

export default function LoginPage() {
  return <LoginView />;
}
