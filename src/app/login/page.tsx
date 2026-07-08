import { Suspense } from "react";

import { LoginView } from "@/components/aura/auth/LoginView";
import { pageMetadata } from "@/lib/seo-metadata";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("login", "/login");

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-canvas"><div className="aura-loader-ring"><span className="aura-loader-dot" /></div></div>}>
      <LoginView />
    </Suspense>
  );
}
