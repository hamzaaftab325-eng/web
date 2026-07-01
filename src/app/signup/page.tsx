import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { SignupView } from "@/components/aura/auth/SignupView";

export const metadata: Metadata = pageMetadata("signup", "/signup");

export default function SignupPage() {
  return <SignupView />;
}
