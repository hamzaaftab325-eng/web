import { ForgotPasswordView } from "@/components/aura/auth/ForgotPasswordView";
import { pageMetadata } from "@/lib/seo-metadata";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("forgot-password", "/forgot-password");

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
