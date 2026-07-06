"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Save,
  Bell,
  Sparkles,
  Tag,
  Package,
  AlertTriangle,
} from "lucide-react";
import { AccountLayout } from "./AccountLayout";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser } from "@/store/use-auth-store";

/**
 * AccountPreferences — email preferences + danger zone.
 *
 * Email toggles are persisted on the auth user object (survive sign-out).
 * Danger zone allows the user to deactivate their account.
 */

interface EmailPrefConfig {
  key: "newsletter" | "newArrivals" | "saleAlerts" | "orderUpdates";
  label: string;
  description: string;
  icon: typeof Bell;
}

const emailPrefConfigs: EmailPrefConfig[] = [
  {
    key: "newsletter",
    label: "The Aura Journal",
    description:
      "Our monthly letter — new collections, studio visits, and slow living notes.",
    icon: Mail,
  },
  {
    key: "newArrivals",
    label: "New arrivals",
    description:
      "Be the first to see new pieces, the week they land in the workshop.",
    icon: Sparkles,
  },
  {
    key: "saleAlerts",
    label: "Sale & private offers",
    description:
      "Quiet, considered markdowns and trade-exclusive invitations.",
    icon: Tag,
  },
  {
    key: "orderUpdates",
    label: "Order updates",
    description:
      "Shipping confirmations, delivery windows, and white-glove scheduling.",
    icon: Package,
  },
];

export function AccountPreferences() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clear);
  const { toast } = useToast();

  const [emailPrefs, setEmailPrefs] = useState<NonNullable<AuthUser["preferences"]>>(
    user?.preferences ?? {
      newsletter: true,
      newArrivals: true,
      saleAlerts: false,
      orderUpdates: true,
    }
  );
  const [saving, setSaving] = useState(false);

  const toggleEmail = (key: "newsletter" | "newArrivals" | "saleAlerts" | "orderUpdates") => {
    setEmailPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    if (user) {
      setUser({ ...user, preferences: emailPrefs });
    }
    let success = false;
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: emailPrefs }),
      });
      success = res.ok;
    } catch {
      success = false;
    }
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    if (success) {
      toast({
        title: "Preferences saved",
        description: "Your Aura Living profile has been updated.",
      });
    } else {
      toast({
        title: "Save failed",
        description: "Could not update preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Deactivate your account? You can sign in again to reactivate.")) return;
    try {
      await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      await fetch("/api/auth/logout", { method: "POST" });
      clearAuth();
      router.push("/");
    } catch {
      /* ignore */
    }
  };

  return (
    <AccountLayout>
      {/* Header */}
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />Settings
          </p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">
            Preferences
          </TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">
            Choose which emails you receive from Aura Living. Your privacy matters — unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Email preferences */}
      <RevealOnScroll stagger={0.06} className="mb-8">
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden"
        >
          <div className="p-6 border-b border-hairline-cream">
            <h2 className="t-headline-sm c-ink flex items-center gap-3">
              <span className="w-6 h-px bg-gold" aria-hidden />
              <Mail size={18} className="c-gold-deep" />
              Email Preferences
            </h2>
          </div>
          <div className="divide-y divide-hairline-cream">
            {emailPrefConfigs.map((cfg) => {
              const enabled = emailPrefs[cfg.key];
              const Icon = cfg.icon;
              return (
                <div
                  key={cfg.key}
                  className="flex items-center gap-4 p-5 md:p-6 hover:bg-cream/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold">
                    <Icon size={18} strokeWidth={1.25} className="c-gold-deep" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="t-body c-ink font-medium mb-0.5">{cfg.label}</p>
                    <p className="t-caption c-ink-muted">{cfg.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={cfg.label}
                    onClick={() => toggleEmail(cfg.key)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                      enabled ? "bg-ink" : "bg-cream-deep border border-hairline"
                    )}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      className={cn(
                        "inline-block h-4 w-4 rounded-full bg-paper shadow-ambient",
                        enabled ? "ml-auto mr-1.5" : "ml-1.5"
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="p-5 md:p-6 border-t border-hairline-cream">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="aura-loader-dot" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={14} strokeWidth={1.5} />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </motion.div>
      </RevealOnScroll>

      {/* Danger Zone */}
      <RevealOnScroll stagger={0.06}>
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="bg-error/5 border border-error/20 rounded-sm overflow-hidden"
        >
          <div className="p-6 border-b border-error/20">
            <h2 className="t-headline-sm c-error flex items-center gap-3">
              <span className="w-6 h-px bg-error" aria-hidden />
              <AlertTriangle size={18} />
              Danger Zone
            </h2>
          </div>
          <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="t-body c-ink font-medium mb-1">Deactivate account</p>
              <p className="t-body-sm c-ink-muted">
                Temporarily disable your account. You can sign back in anytime to reactivate.
                Your orders and addresses will be preserved.
              </p>
            </div>
            <button
              onClick={handleDeactivate}
              className="inline-flex items-center gap-2 bg-error c-paper t-label-caps px-5 py-3 rounded-sm hover:bg-ink transition-colors flex-shrink-0"
            >
              <AlertTriangle size={14} strokeWidth={1.5} />
              Deactivate
            </button>
          </div>
        </motion.div>
      </RevealOnScroll>
    </AccountLayout>
  );
}

export default AccountPreferences;
