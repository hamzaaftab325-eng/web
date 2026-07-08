"use client";

import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";
import { Compass, ArrowRight, Search } from "lucide-react";

/**
 * app/not-found.tsx — branded 404 page.
 *
 * Shows when a URL doesn't match any route. Calm, on-brand,
 * with CTAs to home, shop, and popular pages.
 */

export default function NotFound() {
  const prefersReducedMotion = useReducedMotion();

  const popularLinks = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Collections", href: "/collections" },
    { label: "Journal", href: "/journal" },
  ];

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6 py-20">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl text-center"
      >
        <div className="w-16 h-16 rounded-full bg-gold-pale flex items-center justify-center mx-auto mb-8">
          <Compass size={28} strokeWidth={1.25} className="c-gold-deep" />
        </div>

        <p className="t-label-caps c-gold-deep mb-4 flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-gold" aria-hidden />
          Error 404
          <span className="w-6 h-px bg-gold" aria-hidden />
        </p>

        <h1 className="t-display-lg c-ink leading-tight mb-5">
          This page has moved — or never existed.
        </h1>

        <p className="t-body-lg c-ink-muted leading-relaxed mb-10 max-w-md mx-auto">
          The URL you tried doesn&apos;t match anything in our atelier. Try one
          of the pages below, or browse the full catalogue.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 hover:bg-gold-deep transition-colors rounded-sm"
          >
            <ArrowRight size={14} strokeWidth={1.5} />
            Back to home
          </Link>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline px-6 py-3.5"
          >
            <Search size={14} strokeWidth={1.5} />
            Browse the shop
          </Link>
        </div>

        <div>
          <p className="t-label-caps c-ink-faint mb-4">Popular pages</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {popularLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="chip"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
