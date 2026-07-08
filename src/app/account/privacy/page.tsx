import { AccountPrivacy } from "@/components/aura/account/AccountPrivacy";
import { pageMetadata } from "@/lib/seo-metadata";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("account-privacy", "/account/privacy");

export default function AccountPrivacyPage() {
  return <AccountPrivacy />;
}
