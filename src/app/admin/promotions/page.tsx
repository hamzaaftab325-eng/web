"use client";

import Link from "next/link";

import { Tag, Zap, ArrowRight } from "lucide-react";

import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";

export default function PromotionsHubPage() {
  const tools = [
    {
      href: "/admin/promo-codes",
      icon: Tag,
      title: "Promo Codes",
      description: "Create discount codes (percentage off, free shipping, fixed amount). Track usage and set expiry dates.",
    },
    {
      href: "/admin/flash-sales",
      icon: Zap,
      title: "Flash Sales",
      description: "Time-limited sales events with countdown timers. Apply discounts to specific products or categories.",
    },
  ];

  return (
    <div className="container-aura py-10 max-w-4xl">
      <TextBlurReveal>
        <h1 className="font-display text-3xl c-ink mb-2">Promotions</h1>
      </TextBlurReveal>
      <p className="t-body c-ink-muted mb-10">
        Manage discount codes and flash sales to drive conversions and reward loyal customers.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-paper border border-hairline rounded-sm p-6 hover:border-gold transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gold-pale flex items-center justify-center">
                  <Icon size={20} strokeWidth={1.5} className="c-gold-deep" />
                </div>
                <ArrowRight
                  size={18}
                  strokeWidth={1.5}
                  className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all"
                />
              </div>
              <h2 className="t-headline c-ink mb-2">{tool.title}</h2>
              <p className="t-body-sm c-ink-muted leading-relaxed">{tool.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
