"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/data/faq";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { cn } from "@/lib/utils";

const categories = ["All", "Shipping", "Returns", "Product Care", "Orders"] as const;

export function FAQSection() {
  const [activeCat, setActiveCat] = useState<(typeof categories)[number]>("All");
  const [openId, setOpenId] = useState<string | null>(faqs[0].id);

  const filtered =
    activeCat === "All" ? faqs : faqs.filter((f) => f.category === activeCat);

  return (
    <section className="section-stack bg-cream">
      <div className="container-aura">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Sidebar */}
          <div className="lg:col-span-4">
            <p className="t-label-caps c-gold mb-3">Questions</p>
            <TextBlurReveal
              as="h2"
              className="t-display-md c-ink leading-tight mb-8"
            >
              Good to know.
            </TextBlurReveal>
            <p className="t-body c-ink-muted mb-8 max-w-sm leading-relaxed">
              The most common questions about ordering, shipping, and caring for
              your pieces. Can't find what you're looking for?
            </p>
            <a
              href="mailto:concierge@auraliving.com"
              className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold transition-colors link-underline"
            >
              Email our concierge
            </a>

            <div className="mt-10 lg:mt-12">
              <p className="t-label-caps c-ink-faint mb-3">Filter</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    data-active={activeCat === c}
                    className="chip"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Accordion list */}
          <div className="lg:col-span-8">
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {filtered.map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <motion.div
                      key={faq.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="border-b border-hairline"
                    >
                      <button
                        onClick={() => setOpenId(isOpen ? null : faq.id)}
                        aria-expanded={isOpen}
                        className="w-full flex items-start justify-between gap-4 py-6 text-left"
                      >
                        <div className="flex-1">
                          <p className="t-caption c-ink-faint mb-2 t-label-caps">
                            {faq.category}
                          </p>
                          <p className="t-headline-sm c-ink">{faq.question}</p>
                        </div>
                        <ChevronDown
                          size={20}
                          strokeWidth={1.25}
                          className={cn(
                            "c-ink transition-transform duration-300 flex-shrink-0 mt-2",
                            isOpen && "rotate-180 c-gold"
                          )}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="t-body c-ink-muted leading-relaxed pb-6 max-w-2xl">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
