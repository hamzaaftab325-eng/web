import { ResetPasswordView } from "@/components/aura/auth/ResetPasswordView";
import { pageMetadata } from "@/lib/seo-metadata";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("reset-password", "/reset-password");

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
