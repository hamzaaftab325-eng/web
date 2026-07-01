import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { AccountPrivacy } from "@/components/aura/account/AccountPrivacy";

export const metadata: Metadata = pageMetadata("account-privacy", "/account/privacy");

export default function AccountPrivacyPage() {
  return <AccountPrivacy />;
}
