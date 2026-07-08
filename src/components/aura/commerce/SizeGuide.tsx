"use client";

import { useEffect, useRef } from "react";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Ruler, Scissors, Lightbulb } from "lucide-react";

import { useFocusTrap } from "@/hooks/use-focus-trap";
import { cn } from "@/lib/utils";

interface SizeGuideProps {
  open: boolean;
  onClose: () => void;
  dimensions?: string;
  materials?: string[];
  className?: string;
}

interface GuideRow {
  label: string;
  value: string;
}

interface MeasureStep {
  icon: typeof Ruler;
  label: string;
  detail: string;
}

const DEFAULT_DIMENSIONS: GuideRow[] = [
  { label: "Overall height", value: "46 cm" },
  { label: "Overall width", value: "28 cm" },
  { label: "Base diameter", value: "16 cm" },
  { label: "Shade diameter", value: "28 cm" },
  { label: "Cord length", value: "180 cm" },
  { label: "Weight", value: "2.4 kg" },
];

const DEFAULT_MATERIALS = [
  "Hand-thrown stoneware body",
  "Matte warm-beige glaze",
  "Natural linen drum shade",
  "Brass rotary switch",
  "E27 socket (40W max)",
];

const MEASURE_STEPS: MeasureStep[] = [
  {
    icon: Ruler,
    label: "Measure your surface",
    detail:
      "For table lamps, allow at least 12cm of clearance on either side of the base for the shade to read cleanly.",
  },
  {
    icon: Lightbulb,
    label: "Eye-level rule",
    detail:
      "The bottom of the shade should sit at or just below your eye level when seated beside the lamp.",
  },
  {
    icon: Scissors,
    label: "Cord reach",
    detail:
      "Confirm the nearest outlet is within 180cm; consider a cord cover if running along a baseboard.",
  },
];

export function SizeGuide({
  open,
  onClose,
  dimensions,
  materials,
  className,
}: SizeGuideProps) {
  const prefersReducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  // Esc to close + body scroll lock.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  // Dimensions string → rows for the table; falls back to a sensible default
  // table so the guide is always informative.
  const dimRows: GuideRow[] = (() => {
    if (dimensions) {
      // Split on middot or · or comma into pairs.
      const parts = dimensions
        .split(/·|,|\bcm\b/i)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length >= 2) return parts.slice(0, 6).map((p) => ({ label: p, value: "see diagram" }));
    }
    return DEFAULT_DIMENSIONS;
  })();

  const matList = materials && materials.length > 0 ? materials : DEFAULT_MATERIALS;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-modal overlay-dark flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
        >
          <motion.div
            ref={panelRef}
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "bg-paper w-full max-w-2xl max-h-[92vh] md:max-h-[88vh] overflow-y-auto scrollbar-thin shadow-modal",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — gold-pale → cream gradient */}
            <div className="bg-gradient-to-r from-gold-pale to-cream sticky top-0 z-10">
              <div className="flex items-center justify-between p-6 md:p-8">
                <div>
                  <p className="t-label-caps c-gold-deep mb-1">Sizing & materials</p>
                  <h2 className="t-headline-md c-ink">Size guide</h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close size guide"
                  className="p-2.5 bg-paper/80 backdrop-blur-sm rounded-full hover:bg-paper hover:c-gold-deep transition-colors"
                >
                  <X size={18} strokeWidth={1.25} />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-10">
              {/* Dimensions */}
              <section>
                <h3 className="t-headline-sm c-ink mb-4">Dimensions</h3>
                <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern overflow-hidden">
                  <dl className="divide-y divide-hairline">
                    {dimRows.map((row, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-2 px-4 py-3"
                      >
                        <dt className="t-body-sm c-ink-muted">{row.label}</dt>
                        <dd className="t-body-sm c-ink font-medium t-num text-right">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {dimensions && (
                  <p className="t-caption c-ink-faint mt-3">
                    {dimensions}
                  </p>
                )}
              </section>

              {/* Materials */}
              <section>
                <h3 className="t-headline-sm c-ink mb-4">Materials</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matList.map((m, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 bg-cream border border-hairline-cream rounded-sm px-4 py-3"
                    >
                      <span className="block w-1.5 h-1.5 rounded-full bg-gold" />
                      <span className="t-body-sm c-ink">{m}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* How to measure */}
              <section>
                <h3 className="t-headline-sm c-ink mb-4">How to measure</h3>
                <div className="space-y-3">
                  {MEASURE_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 bg-gradient-card-warm border border-hairline-cream rounded-sm p-4"
                    >
                      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center">
                        <step.icon
                          size={16}
                          strokeWidth={1.5}
                          className="c-gold-deep"
                        />
                      </span>
                      <div className="flex-1">
                        <p className="t-body c-ink font-medium mb-0.5">
                          {i + 1}. {step.label}
                        </p>
                        <p className="t-body-sm c-ink-muted leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Footer note */}
              <div className="border-t border-hairline pt-5">
                <p className="t-caption c-ink-faint leading-relaxed">
                  Each Aura piece is made by hand, so dimensions can vary by up
                  to 5mm between units. That's not a flaw — it's the fingerprint
                  of the maker. If you're matching a precise niche or pairing two
                  pieces, leave a note at checkout and we'll hand-select a pair.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SizeGuide;
