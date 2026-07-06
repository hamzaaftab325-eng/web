import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { ForgotPasswordView } from "@/components/aura/auth/ForgotPasswordView";

export const metadata: Metadata = pageMetadata("forgot-password", "/forgot-password");

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
