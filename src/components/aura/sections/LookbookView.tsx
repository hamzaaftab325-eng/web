"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";
import { useCartStore } from "@/store/use-cart-store";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { PageHero } from "@/components/aura/layout/PageHero";
import { ProductCard } from "@/components/aura/commerce/ProductCard";
import { products } from "@/data/products";
import { lookbookScenes, lookbookBySlug } from "@/data/lookbook";
import type { LookbookScene, LookbookHotspot } from "@/data/lookbook";

/**
 * LookbookView — index of six styled room scenes plus a "Shop the
 * Look" detail view that overlays gold hotspot dots on the scene
 * image and reveals a product popover on click.
 *
 * Zero inline styles: hotspot positions resolve through a literal
 * Tailwind arbitrary-value class lookup so the JIT scanner sees them.
 */

const productBySlug = (slug: string) => products.find((p) => p.slug === slug);

// Pre-declared arbitrary-value classes for hotspot positions. These
// literal strings let Tailwind's JIT emit the matching utilities.
const POS_X: Record<number, string> = {
  20: "left-[20%]", 25: "left-[25%]", 30: "left-[30%]", 35: "left-[35%]",
  40: "left-[40%]", 45: "left-[45%]", 50: "left-[50%]", 55: "left-[55%]",
  60: "left-[60%]", 65: "left-[65%]", 70: "left-[70%]", 75: "left-[75%]",
  80: "left-[80%]",
};
const POS_Y: Record<number, string> = {
  20: "top-[20%]", 25: "top-[25%]", 30: "top-[30%]", 35: "top-[35%]",
  40: "top-[40%]", 45: "top-[45%]", 50: "top-[50%]", 55: "top-[55%]",
  60: "top-[60%]", 65: "top-[65%]", 70: "top-[70%]", 75: "top-[75%]",
  80: "top-[80%]",
};

export function LookbookView() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const scene = activeSlug ? lookbookBySlug(activeSlug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSlug]);

  return (
    <div className="bg-gradient-to-b from-canvas to-cream/20 min-h-screen">
      <AnimatePresence mode="wait">
        {scene ? (
          <SceneDetail
            key={`scene-${scene.slug}`}
            scene={scene}
            onBack={() => setActiveSlug(null)}
          />
        ) : (
          <SceneGrid key="scene-grid" onOpen={(slug) => setActiveSlug(slug)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero — full-bleed image hero (shared PageHero component)                   */
/* -------------------------------------------------------------------------- */

function LookbookHero() {
  return (
    <PageHero
      image="/hero/lookbook.png"
      alt="A beautifully styled living room with warm afternoon light, brass, ceramic, and a mirror arranged on a console."
      eyebrow="The Lookbook"
      headline="Rooms, styled slowly."
      subtitle="Six styled scenes from our studio — each one built around pieces we live with. Tap a hotspot on any image to shop the look."
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Grid                                                                       */
/* -------------------------------------------------------------------------- */

function SceneGrid({ onOpen }: { onOpen: (slug: string) => void }) {
  return (
    <div>
      <LookbookHero />
      <section className="pb-20 md:pb-32">
        <div className="container-aura">
          <RevealOnScroll
            stagger={0.08}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {lookbookScenes.map((scene) => (
              <motion.button
                key={scene.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                onClick={() => onOpen(scene.slug)}
                className="group text-left bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep ring-1 ring-hairline-cream group-hover:ring-hairline-gold transition-shadow">
                  <img
                    src={scene.image}
                    alt={scene.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                  {/* Room badge */}
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 chip bg-paper/90 c-ink border-0 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden />
                    {scene.room}
                  </span>

                  {/* Hotspot count chip */}
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 chip bg-paper/90 c-ink border-0 backdrop-blur-sm">
                    <Plus size={12} strokeWidth={1.5} className="c-gold-deep" />
                    {scene.hotspots.length} looks
                  </span>

                  {/* Title overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="t-headline-md c-paper leading-tight">
                      {scene.title}
                    </h3>
                  </div>

                  {/* Hover hint */}
                  <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-paper/90 c-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <p className="t-body-sm c-ink-muted leading-relaxed line-clamp-2">
                    {scene.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene detail with Shop-the-Look hotspots                                   */
/* -------------------------------------------------------------------------- */

function SceneDetail({
  scene,
  onBack,
}: {
  scene: LookbookScene;
  onBack: () => void;
}) {
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  // Linked products derived from hotspot slugs (de-duped, in scene order).
  const linkedProducts = scene.hotspots
    .map((h) => h.productSlug)
    .filter((slug, i, arr) => arr.indexOf(slug) === i)
    .map((slug) => productBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Back — padded for fixed header */}
      <section className="pt-24 md:pt-28 pb-6 md:pb-8">
        <div className="container-aura">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            All Scenes
          </button>
        </div>
      </section>

      {/* Hero scene with hotspots */}
      <section className="pb-12 md:pb-16 relative overflow-hidden">
        {/* Gold-pale blur orb */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-gold-pale opacity-50 blur-3xl"
          aria-hidden
        />
        <div className="container-aura relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            {scene.room}
          </p>
          <TextBlurReveal
            as="h1"
            className="t-display-md c-ink leading-tight mb-5 max-w-3xl"
          >
            {scene.title}
          </TextBlurReveal>
          <p className="t-body-lg c-ink-muted max-w-2xl leading-relaxed">
            {scene.description}
          </p>

          {/* Scene image with hotspots */}
          <div className="relative mt-8 md:mt-10 aspect-[16/10] overflow-hidden bg-cream-deep rounded-sm ring-1 ring-hairline-cream">
            <img
              src={scene.image}
              alt={scene.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/10 to-transparent" />

            {/* Hotspot dots */}
            {scene.hotspots.map((hotspot, i) => (
              <HotspotDot
                key={`${hotspot.productSlug}-${i}`}
                hotspot={hotspot}
                index={i}
                active={activeHotspot === i}
                onToggle={() =>
                  setActiveHotspot((cur) => (cur === i ? null : i))
                }
              />
            ))}

            {/* Instruction strip */}
            <div className="absolute top-4 right-4 hidden md:flex items-center gap-2 chip bg-paper/90 c-ink border-0 backdrop-blur-sm">
              <Plus size={12} strokeWidth={1.5} className="c-gold-deep" />
              Tap a gold dot to shop the look
            </div>
          </div>
        </div>
      </section>

      {/* Linked products */}
      <section className="pb-20 md:pb-32">
        <div className="container-aura">
          <div className="flex items-baseline justify-between mb-8 md:mb-10">
            <h2 className="t-headline-lg c-ink">Shop the Look</h2>
            <p className="t-caption c-ink-faint t-num">
              {linkedProducts.length} pieces
            </p>
          </div>

          <RevealOnScroll
            stagger={0.08}
            className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10"
          >
            {linkedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </RevealOnScroll>

          {/* CTA */}
          <div className="mt-16 md:mt-20 text-center">
            <button
              onClick={() => useUIStore.getState().setView("shop")}
              className="inline-flex items-center gap-3 bg-ink c-paper t-label-caps px-8 py-4 hover:bg-gold-deep transition-colors rounded-sm"
            >
              Browse the full shop
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hotspot dot + popover                                                      */
/* -------------------------------------------------------------------------- */

function HotspotDot({
  hotspot,
  index,
  active,
  onToggle,
}: {
  hotspot: LookbookHotspot;
  index: number;
  active: boolean;
  onToggle: () => void;
}) {
  const product = productBySlug(hotspot.productSlug);
  const openProduct = useUIStore((s) => s.openProduct);
  const addLine = useCartStore((s) => s.addLine);

  if (!product) return null;

  const posX = POS_X[hotspot.x] ?? "left-[50%]";
  const posY = POS_Y[hotspot.y] ?? "top-[50%]";
  // Bias popover above the dot when the hotspot is in the bottom half.
  const popoverAbove = hotspot.y > 60;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addLine(product, { quantity: 1 });
    onToggle();
  };

  return (
    <div className={cn("absolute z-20", posX, posY)}>
      {/* Gold dot */}
      <button
        onClick={onToggle}
        aria-label={`${active ? "Hide" : "Show"} ${product.name}`}
        aria-expanded={active}
        className="relative -translate-x-1/2 -translate-y-1/2 group"
      >
        <span className="absolute -inset-3 rounded-full bg-gold/20 animate-ping opacity-60 group-hover:opacity-100 transition-opacity" />
        <span
          className={cn(
            "relative block w-5 h-5 rounded-full border-2 transition-all duration-300",
            active
              ? "bg-gold-deep border-gold-deep scale-110"
              : "bg-gold border-paper hover:bg-gold-deep"
          )}
        />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 t-caption c-paper font-semibold t-num">
          {index + 1}
        </span>
      </button>

      {/* Popover */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute z-30 w-64 -translate-x-1/2 mt-3",
              popoverAbove && "bottom-full mt-0 mb-3 top-auto"
            )}
            role="dialog"
            aria-label={`${product.name} details`}
          >
            <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm shadow-premium-hover overflow-hidden">
              <div className="flex items-stretch gap-3 p-3">
                <button
                  onClick={() => openProduct(product.slug)}
                  className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-cream-deep"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </button>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <p className="t-caption c-ink-faint mb-1 line-clamp-1">
                      {product.subtitle}
                    </p>
                    <h4 className="t-headline-sm c-ink line-clamp-2 leading-tight">
                      {product.name}
                    </h4>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="t-body c-ink t-num font-medium">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      onClick={() => openProduct(product.slug)}
                      className="inline-flex items-center gap-1 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
                    >
                      View
                      <ArrowRight size={11} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Add to cart */}
              <div className="border-t border-hairline-cream px-3 py-2 bg-cream/60">
                <button
                  onClick={handleAdd}
                  disabled={!product.inStock}
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 t-label-caps py-2.5 rounded-sm transition-colors",
                    product.inStock
                      ? "bg-ink c-paper hover:bg-gold-deep"
                      : "bg-ink/30 c-paper/60 cursor-not-allowed"
                  )}
                >
                  <Plus size={12} strokeWidth={1.5} />
                  {product.inStock ? "Add to cart" : "Sold out"}
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onToggle}
              aria-label="Close hotspot"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink c-paper flex items-center justify-center hover:bg-gold-deep transition-colors"
            >
              <X size={10} strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LookbookView;
