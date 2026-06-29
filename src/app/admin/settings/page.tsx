"use client";

import { motion } from "framer-motion";
import { Globe, CreditCard, Database, Image as ImageIcon, ShieldCheck, MapPin } from "lucide-react";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

const settings = [
  {
    label: "Store Configuration",
    icon: Globe,
    items: [
      { label: "Currency", value: "PKR (₨) — Pakistani Rupee" },
      { label: "Country", value: "Pakistan" },
      { label: "Language", value: "English" },
      { label: "Timezone", value: "Asia/Karachi (PKT)" },
    ],
  },
  {
    label: "Payment Methods",
    icon: CreditCard,
    items: [
      { label: "Active Method", value: "COD (Cash on Delivery)" },
      { label: "Coming Soon", value: "JazzCash · EasyPaisa · Bank Transfer" },
      { label: "Currency", value: "PKR only" },
    ],
  },
  {
    label: "Infrastructure",
    icon: Database,
    items: [
      { label: "Database", value: "Supabase (PostgreSQL)" },
      { label: "Region", value: "ap-northeast-2 (Seoul)" },
      { label: "Image Hosting", value: "Cloudinary" },
      { label: "Deployment", value: "Vercel" },
    ],
  },
  {
    label: "Security",
    icon: ShieldCheck,
    items: [
      { label: "Auth", value: "JWT (httpOnly cookies)" },
      { label: "Password Hashing", value: "bcrypt (10 rounds)" },
      { label: "Admin Access", value: "Database role check" },
      { label: "CSRF Protection", value: "SameSite cookies" },
    ],
  },
];

export default function AdminSettings() {
  return (
    <div>
      {/* Header */}
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />Configuration
          </p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Settings</TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">Store configuration, payment methods, and infrastructure details.</p>
        </div>
      </div>

      {/* Settings sections */}
      <RevealOnScroll stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((section) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.label}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden"
            >
              <div className="p-6 border-b border-hairline-cream bg-gradient-to-r from-gold-pale/30 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center ring-1 ring-hairline-gold">
                    <Icon size={18} strokeWidth={1.25} className="c-gold-deep" />
                  </div>
                  <h2 className="t-headline-sm c-ink">{section.label}</h2>
                </div>
              </div>
              <div className="p-6 divide-y divide-hairline-cream">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <p className="t-label-caps c-ink-faint">{item.label}</p>
                    <p className="t-body-sm c-ink text-right">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </RevealOnScroll>

      {/* Info note */}
      <div className="mt-8 bg-cream/50 border border-hairline-cream rounded-sm p-6 flex items-start gap-4">
        <MapPin size={20} strokeWidth={1.5} className="c-gold-deep flex-shrink-0 mt-0.5" />
        <div>
          <p className="t-body c-ink font-medium mb-1">Manage marketing & shipping in Supabase</p>
          <p className="t-body-sm c-ink-muted">
            Promo codes, shipping methods, and marketing content can be edited directly in the Supabase dashboard.
            Visit the Table Editor to manage: <span className="c-gold-deep font-medium">PromoCode</span>,{" "}
            <span className="c-gold-deep font-medium">ShippingMethod</span>,{" "}
            <span className="c-gold-deep font-medium">HeroSlide</span>, and other content tables.
          </p>
        </div>
      </div>
    </div>
  );
}
