import { SignupView } from "@/components/aura/auth/SignupView";
import { pageMetadata } from "@/lib/seo-metadata";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("signup", "/signup");

export default function SignupPage() {
  return <SignupView />;
}
