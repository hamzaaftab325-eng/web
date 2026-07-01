import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { ResetPasswordView } from "@/components/aura/auth/ResetPasswordView";

export const metadata: Metadata = pageMetadata("reset-password", "/reset-password");

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
