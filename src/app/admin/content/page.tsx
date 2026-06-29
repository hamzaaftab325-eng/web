"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Image, HelpCircle, Users, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

const contentSections = [
  {
    label: "Hero Slides",
    description: "Manage the home page carousel — featured collections and seasonal campaigns.",
    icon: Image,
    count: "Manage slides",
    href: "#",
  },
  {
    label: "FAQ Items",
    description: "Customer questions about shipping, returns, materials, and care.",
    icon: HelpCircle,
    count: "Manage FAQ",
    href: "#",
  },
  {
    label: "Testimonials",
    description: "Curated customer quotes shown on the home and product pages.",
    icon: Users,
    count: "Manage testimonials",
    href: "#",
  },
  {
    label: "Journal Articles",
    description: "Long-form stories about artisans, materials, and slow living.",
    icon: BookOpen,
    count: "Manage articles",
    href: "#",
  },
  {
    label: "Artisan Profiles",
    description: "Workshop stories and craftspeople behind the pieces.",
    icon: Users,
    count: "Manage artisans",
    href: "#",
  },
  {
    label: "Care Guides",
    description: "Material-specific care instructions for each product type.",
    icon: FileText,
    count: "Manage guides",
    href: "#",
  },
];

export default function AdminContent() {
  return (
    <div>
      {/* Header */}
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />Editorial
          </p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Content</TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">Curate the stories, guides, and marketing that shape your atelier's voice.</p>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-gold-pale/40 border border-hairline-gold rounded-sm p-5 mb-8 flex items-start gap-4">
        <Sparkles size={20} strokeWidth={1.5} className="c-gold-deep flex-shrink-0 mt-0.5" />
        <div>
          <p className="t-body c-ink font-medium mb-1">Full visual editors coming soon</p>
          <p className="t-body-sm c-ink-muted">
            For now, manage content directly in the Supabase dashboard. Each section below maps to a database table.
          </p>
        </div>
      </div>

      {/* Content sections */}
      <RevealOnScroll stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contentSections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.label}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="group relative bg-gradient-card-warm border border-hairline-cream p-6 hover:shadow-card-hover transition-shadow overflow-hidden rounded-sm"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" aria-hidden />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gold-pale flex items-center justify-center ring-1 ring-hairline-gold flex-shrink-0">
                  <Icon size={20} strokeWidth={1.25} className="c-gold-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="t-headline-sm c-ink mb-1">{section.label}</p>
                  <p className="t-body-sm c-ink-muted mb-4">{section.description}</p>
                  <span className="inline-flex items-center gap-1.5 t-label-caps c-gold-deep group-hover:gap-2.5 transition-all">
                    {section.count} <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </RevealOnScroll>
    </div>
  );
}
