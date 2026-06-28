"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Palette,
  Home,
  Wallet,
  Coins,
  Save,
  Bell,
  Sparkles,
  Tag,
  Package,
  AlertTriangle,
  Check,
  RotateCcw,
} from "lucide-react";
import { AccountLayout } from "./AccountLayout";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { cn, formatPrice } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import AuraButton from "@/components/aura/ui/Button";
import AuraChip from "@/components/aura/ui/Chip";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser } from "@/store/use-auth-store";

/**
 * AccountPreferences — email, style, room, budget, and currency preferences.
 *
 * The four email toggles are persisted on the auth user object (so they
 * survive sign-out / sign-in). Style, room, budget, and currency live in
 * local state for this session — a Save action commits the whole panel and
 * surfaces a confirmation toast.
 */

const styleOptions = [
  "Warm minimalism",
  "Modern",
  "Traditional",
  "Eclectic",
  "Japandi",
  "Mid-century",
] as const;

const roomOptions = [
  "Living room",
  "Bedroom",
  "Dining",
  "Entryway",
  "Office",
  "Bathroom",
] as const;

const currencies = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
] as const;

type CurrencyCode = (typeof currencies)[number]["code"];

interface EmailPrefConfig {
  key: keyof AuthUser["preferences"];
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

const BUDGET_MIN = 50;
const BUDGET_MAX = 500;
const BUDGET_STEP = 50;

export function AccountPreferences() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { toast } = useToast();

  // Email prefs — sourced from auth store, edited in local state, committed on save.
  const [emailPrefs, setEmailPrefs] = useState<AuthUser["preferences"]>(
    user?.preferences ?? {
      newsletter: true,
      newArrivals: true,
      saleAlerts: false,
      orderUpdates: true,
    }
  );

  // Style + room multi-selects.
  const [styles, setStyles] = useState<string[]>(["Warm minimalism", "Japandi"]);
  const [rooms, setRooms] = useState<string[]>(["Living room", "Bedroom"]);

  // Budget + currency.
  const [budget, setBudget] = useState<number>(200);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [saving, setSaving] = useState(false);

  // Discrete width classes per budget step — keeps the fill purely class-driven
  // (no inline styles). Step is 50 from 50→500, so exactly 10 positions.
  const budgetFillClass: Record<number, string> = {
    50: "w-0",
    100: "w-[11%]",
    150: "w-[22%]",
    200: "w-[33%]",
    250: "w-[44%]",
    300: "w-[56%]",
    350: "w-[67%]",
    400: "w-[78%]",
    450: "w-[89%]",
    500: "w-full",
  };

  const toggleEmail = (key: keyof AuthUser["preferences"]) => {
    setEmailPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const toggleInList = (
    list: string[],
    setList: (v: string[]) => void,
    value: string
  ) => {
    setList(
      list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    // Persist email prefs to the auth store; other prefs are session-local.
    if (user) {
      setUser({ ...user, preferences: emailPrefs });
    }
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast({
      title: "Preferences saved",
      description: "Your Aura Living profile has been updated.",
    });
  };

  const handleReset = () => {
    setEmailPrefs({
      newsletter: true,
      newArrivals: true,
      saleAlerts: false,
      orderUpdates: true,
    });
    setStyles(["Warm minimalism", "Japandi"]);
    setRooms(["Living room", "Bedroom"]);
    setBudget(200);
    setCurrency("USD");
    toast({
      title: "Preferences reset",
      description: "Restored to Aura Living defaults.",
    });
  };

  const handleDeactivate = () => {
    if (!user) return;
    setUser({
      ...user,
      preferences: {
        newsletter: false,
        newArrivals: false,
        saleAlerts: false,
        orderUpdates: false,
      },
    });
    setEmailPrefs({
      newsletter: false,
      newArrivals: false,
      saleAlerts: false,
      orderUpdates: false,
    });
    toast({
      title: "Email subscriptions paused",
      description: "You will no longer receive marketing emails from Aura.",
    });
  };

  return (
    <AccountLayout>
      {/* Header */}
      <div className="mb-8 relative">
        <div
          className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none"
          aria-hidden
        />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            Profile Settings
          </p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight">
            Preferences
          </TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg mt-3">
            Tell Aura how you live. We tailor new arrivals, journal stories, and
            private offers to the rooms and styles you love.
          </p>
        </div>
      </div>

      <RevealOnScroll stagger={0.06} className="space-y-6">
        {/* Email preferences */}
        <motion.section
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            Email preferences
          </p>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern overflow-hidden divide-y divide-hairline-cream">
            {emailPrefConfigs.map((cfg) => {
              const enabled = emailPrefs[cfg.key];
              return (
                <div
                  key={cfg.key}
                  className="flex items-center gap-4 p-5 md:p-6 hover:bg-cream/40 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-gold-pale flex items-center justify-center ring-1 ring-hairline-gold shrink-0">
                    <cfg.icon
                      size={17}
                      strokeWidth={1.5}
                      className="c-gold-deep"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="t-body c-ink font-medium">{cfg.label}</p>
                    <p className="t-caption c-ink-muted mt-0.5">
                      {cfg.description}
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={enabled}
                    onChange={() => toggleEmail(cfg.key)}
                    label={`Toggle ${cfg.label}`}
                  />
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Style preferences */}
        <motion.section
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            Style preferences
          </p>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-5 md:p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-gold-pale flex items-center justify-center ring-1 ring-hairline-gold shrink-0">
                <Palette size={17} strokeWidth={1.5} className="c-gold-deep" />
              </div>
              <div>
                <p className="t-body c-ink font-medium">Your aesthetic</p>
                <p className="t-caption c-ink-muted mt-0.5">
                  Choose all that resonate — we curate accordingly.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((style) => (
                <AuraChip
                  key={style}
                  asButton
                  pressed={styles.includes(style)}
                  onClick={() =>
                    toggleInList(styles, setStyles, style)
                  }
                >
                  {styles.includes(style) && (
                    <Check size={12} strokeWidth={2.5} />
                  )}
                  {style}
                </AuraChip>
              ))}
            </div>
            {styles.length > 0 && (
              <p className="t-caption c-ink-faint mt-4">
                {styles.length} style{styles.length === 1 ? "" : "s"} selected
              </p>
            )}
          </div>
        </motion.section>

        {/* Room preferences */}
        <motion.section
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            Room preferences
          </p>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-5 md:p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-gold-pale flex items-center justify-center ring-1 ring-hairline-gold shrink-0">
                <Home size={17} strokeWidth={1.5} className="c-gold-deep" />
              </div>
              <div>
                <p className="t-body c-ink font-medium">Rooms you're styling</p>
                <p className="t-caption c-ink-muted mt-0.5">
                  Tell us which spaces to prioritise in your feed.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {roomOptions.map((room) => (
                <AuraChip
                  key={room}
                  asButton
                  pressed={rooms.includes(room)}
                  onClick={() => toggleInList(rooms, setRooms, room)}
                >
                  {rooms.includes(room) && (
                    <Check size={12} strokeWidth={2.5} />
                  )}
                  {room}
                </AuraChip>
              ))}
            </div>
            {rooms.length > 0 && (
              <p className="t-caption c-ink-faint mt-4">
                {rooms.length} room{rooms.length === 1 ? "" : "s"} selected
              </p>
            )}
          </div>
        </motion.section>

        {/* Budget + Currency — two-up */}
        <motion.section
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            Budget &amp; currency
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget */}
            <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-5 md:p-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-11 h-11 rounded-full bg-gold-pale flex items-center justify-center ring-1 ring-hairline-gold shrink-0">
                  <Wallet size={17} strokeWidth={1.5} className="c-gold-deep" />
                </div>
                <div className="flex-1">
                  <p className="t-body c-ink font-medium">Per-piece budget</p>
                  <p className="t-caption c-ink-muted mt-0.5">
                    We'll filter pieces above your ceiling.
                  </p>
                </div>
                <p className="t-headline-sm c-gold-deep t-num shrink-0">
                  {formatPrice(budget)}
                </p>
              </div>

              {/* Track + fill (class-driven widths — no inline styles) */}
              <div className="relative h-2 rounded-full bg-cream-deep mb-3 overflow-hidden">
                <div
                  className={cn(
                    "absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-gold to-gold-deep transition-all duration-300",
                    budgetFillClass[budget] ?? "w-0"
                  )}
                  aria-hidden
                />
              </div>
              <input
                type="range"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={BUDGET_STEP}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                aria-label="Per-piece budget"
                aria-valuemin={BUDGET_MIN}
                aria-valuemax={BUDGET_MAX}
                aria-valuenow={budget}
                className="w-full accent-gold cursor-pointer -mt-1"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="t-caption c-ink-faint t-num">
                  {formatPrice(BUDGET_MIN)}
                </span>
                <div className="flex gap-1.5">
                  {[50, 200, 350, 500].map((mark) => (
                    <button
                      key={mark}
                      onClick={() => setBudget(mark)}
                      className={cn(
                        "t-caption t-num px-2 py-0.5 rounded-full transition-colors",
                        budget === mark
                          ? "bg-gold-pale c-gold-deep border border-hairline-gold"
                          : "c-ink-faint hover:c-gold-deep"
                      )}
                    >
                      {formatPrice(mark)}
                    </button>
                  ))}
                </div>
                <span className="t-caption c-ink-faint t-num">
                  {formatPrice(BUDGET_MAX)}
                </span>
              </div>
            </div>

            {/* Currency */}
            <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-5 md:p-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-11 h-11 rounded-full bg-gold-pale flex items-center justify-center ring-1 ring-hairline-gold shrink-0">
                  <Coins size={17} strokeWidth={1.5} className="c-gold-deep" />
                </div>
                <div>
                  <p className="t-body c-ink font-medium">Display currency</p>
                  <p className="t-caption c-ink-muted mt-0.5">
                    Prices update across the site.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {currencies.map((c) => {
                  const active = currency === c.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      aria-pressed={active}
                      className={cn(
                        "flex flex-col items-center justify-center gap-0.5 py-3 rounded-sm border transition-all duration-300",
                        active
                          ? "bg-gradient-to-br from-gold-pale to-cream shadow-gold-glow border-gold c-gold-deep"
                          : "bg-cream/50 border-hairline-cream c-ink hover:border-hairline-gold hover:c-gold-deep"
                      )}
                    >
                      <span className="t-headline-sm t-num">{c.symbol}</span>
                      <span className="t-label-caps">{c.code}</span>
                    </button>
                  );
                })}
              </div>
              <p className="t-caption c-ink-faint mt-4">
                Currently showing{" "}
                <span className="c-gold-deep">
                  {
                    currencies.find((c) => c.code === currency)
                      ?.label
                  }
                </span>
                . Orders still settle in USD.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Save / reset row */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2"
        >
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 t-label-caps c-ink-faint hover:c-gold-deep transition-colors link-underline w-fit"
          >
            <RotateCcw size={13} strokeWidth={1.5} />
            Reset to defaults
          </button>
          <div className="flex items-center gap-3">
            <AuraButton
              type="button"
              variant="ghost"
              onClick={() => router.push("/account")}
            >
              Cancel
            </AuraButton>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 h-10 px-8 rounded-sm t-label-caps bg-ink c-paper hover:bg-gold-deep transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {saving ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block"
                  >
                    <Sparkles size={14} strokeWidth={1.5} />
                  </motion.span>
                  Saving…
                </>
              ) : (
                <>
                  <Save size={14} strokeWidth={1.75} />
                  Save preferences
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Danger zone */}
        <motion.section
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <p className="t-label-caps c-error mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-error" aria-hidden />
            Danger zone
          </p>
          <div className="border border-error/40 rounded-sm bg-error/5 p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-11 h-11 rounded-full bg-error/10 flex items-center justify-center ring-1 ring-error/20 shrink-0">
                  <AlertTriangle
                    size={17}
                    strokeWidth={1.5}
                    className="c-error"
                  />
                </div>
                <div>
                  <p className="t-body c-ink font-medium">
                    Pause all email subscriptions
                  </p>
                  <p className="t-caption c-ink-muted mt-0.5 max-w-md">
                    Stop every marketing email from Aura Living. Order and
                    account-service messages may still be sent where required by
                    law.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDeactivate}
                className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-sm t-label-caps border border-error c-error hover:bg-error hover:c-paper transition-all duration-300 active:scale-[0.98] shrink-0"
              >
                <Bell size={14} strokeWidth={1.75} />
                Unsubscribe all
              </button>
            </div>
          </div>
        </motion.section>
      </RevealOnScroll>
    </AccountLayout>
  );
}

/**
 * ToggleSwitch — small pill-style switch built on a real button with
 * aria-pressed. Animates the knob via Framer Motion layout.
 */
function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0 ring-1",
        checked
          ? "bg-gradient-to-r from-gold to-gold-deep ring-gold/30"
          : "bg-cream-deep ring-hairline-cream hover:ring-hairline-gold"
      )}
    >
      <motion.span
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 32,
        }}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-ambient flex items-center justify-center",
          checked ? "right-1 bg-paper" : "left-1 bg-paper"
        )}
      >
        {checked && (
          <Check size={10} strokeWidth={3} className="c-gold-deep" />
        )}
      </motion.span>
    </button>
  );
}

export default AccountPreferences;
