"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, ArrowRight, Sparkles, Mail } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { PageHero } from "@/components/aura/layout/PageHero";
import { ProductCard } from "@/components/aura/commerce/ProductCard";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";

/**
 * GiftsView — gift hub with recipient and price filter chips, a
 * dark gift-card CTA banner, and a filtered product grid.
 */

type RecipientKey = "all" | "host" | "new-home" | "plant-lover" | "under-150" | "luxury";
type PriceKey = "all" | "under-50" | "50-100" | "100-200" | "200-plus";

const RECIPIENTS: { key: RecipientKey; label: string }[] = [
  { key: "all", label: "All Gifts" },
  { key: "host", label: "For a Host" },
  { key: "new-home", label: "New Home" },
  { key: "plant-lover", label: "Plant Lover" },
  { key: "under-150", label: "Under $150" },
  { key: "luxury", label: "Statement Pieces" },
];

const PRICE_RANGES: { key: PriceKey; label: string; test: (p: number) => boolean }[] = [
  { key: "all", label: "Any price", test: () => true },
  { key: "under-50", label: "Under $50", test: (p) => p < 50 },
  { key: "50-100", label: "$50 – $100", test: (p) => p >= 50 && p < 100 },
  { key: "100-200", label: "$100 – $200", test: (p) => p >= 100 && p < 200 },
  { key: "200-plus", label: "$200+", test: (p) => p >= 200 },
];

// Map recipient → product slugs we consider good gifts for that recipient.
const RECIPIENT_SLUGS: Record<Exclude<RecipientKey, "all">, string[]> = {
  host: [
    "beeswax-taper-candle-set",
    "hand-painted-ceramic-pot",
    "obsidian-bookends",
    "decorative-stone-tray",
    "botanical-pressed-art",
  ],
  "new-home": [
    "ceramic-table-lamp",
    "arched-floor-mirror",
    "handwoven-storage-basket",
    "snake-plant-sansevieria",
    "abstract-line-print",
  ],
  "plant-lover": [
    "fiddle-leaf-fig",
    "monstera-deliciosa",
    "terracotta-ribbed-planter",
    "brass-plant-stand-with-pot",
    "concrete-geometric-planter",
  ],
  "under-150": [
    "glass-globe-wall-sconce",
    "snake-plant-sansevieria",
    "pothos-hanging",
    "terracotta-ribbed-planter",
    "hand-painted-ceramic-pot",
    "obsidian-bookends",
    "handwoven-storage-basket",
    "beeswax-taper-candle-set",
    "botanical-pressed-art",
  ],
  luxury: [
    "brass-arc-floor-lamp",
    "arched-floor-mirror",
    "sculptural-desk-lamp",
    "ceramic-table-lamp",
    "fiddle-leaf-fig",
  ],
};

const GIFT_CARD_AMOUNTS = ["$50", "$100", "$150", "$250"] as const;

export function GiftsView() {
  const setView = useUIStore((s) => s.setView);
  const [recipient, setRecipient] = useState<RecipientKey>("all");
  const [price, setPrice] = useState<PriceKey>("all");

  const filteredProducts = useMemo(() => {
    const priceTest =
      PRICE_RANGES.find((p) => p.key === price)?.test ?? (() => true);

    if (recipient === "all") {
      return products.filter((p) => priceTest(p.price));
    }

    const recipientSlugs = RECIPIENT_SLUGS[recipient];
    return products
      .filter((p) => recipientSlugs.includes(p.slug))
      .filter((p) => priceTest(p.price));
  }, [recipient, price]);

  return (
    <div className="bg-gradient-to-b from-canvas to-cream/20 min-h-screen">
      {/* Page hero — full-bleed image under fixed header */}
      <PageHero
        image="/hero/gifts.png"
        alt="A beautifully wrapped gift in cream paper with a gold-foil seal and a hand-tied linen ribbon."
        eyebrow="Gifts"
        headline="Gifts that finish a room."
        subtitle="Considered pieces, chosen by recipient or price. Each one wrapped in our signature cream paper and gold-foil seal."
      />

      {/* Gift card CTA banner (dark gradient) */}
      <section className="pb-12 md:pb-16">
        <div className="container-aura">
          <div className="bg-gradient-to-br from-ink to-ink-soft c-paper p-8 md:p-12 lg:p-16 rounded-sm relative overflow-hidden">
            {/* Decorative gold orb */}
            <div
              className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/30 blur-3xl"
              aria-hidden
            />

            <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7">
                <div className="flex items-center gap-3 mb-4">
                  <Gift size={18} strokeWidth={1.25} className="c-gold" />
                  <p className="t-label-caps c-gold">Aura Gift Card</p>
                </div>
                <h2 className="t-display-md c-paper leading-tight mb-4">
                  The gift they&apos;ll actually use.
                </h2>
                <p className="t-body-lg c-paper/70 max-w-md mb-8 leading-relaxed">
                  Digital gift cards from $50 to $500, delivered by email
                  within the hour. No fees, no expiry, redeemable across the
                  whole catalogue.
                </p>
                <button
                  onClick={() => setView("shop")}
                  className="group inline-flex items-center gap-3 bg-gold-deep c-paper t-label-caps px-6 py-3.5 hover:bg-paper hover:c-ink transition-colors rounded-sm"
                >
                  Buy a gift card
                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>

              <div className="md:col-span-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3 md:gap-4">
                  {GIFT_CARD_AMOUNTS.map((amt, i) => (
                    <div
                      key={amt}
                      className={cn(
                        "aspect-[3/4] rounded-sm border flex items-center justify-center transition-colors",
                        i === 3
                          ? "bg-gold c-ink border-gold"
                          : "border-paper/15 c-paper/50 hover:border-gold/50 hover:c-gold"
                      )}
                    >
                      <span className="t-headline-sm t-num">{amt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8 md:pb-10">
        <div className="container-aura">
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-5 md:p-6">
            {/* Recipient chips */}
            <div>
              <p className="t-label-caps c-ink-faint mb-3">Recipient</p>
              <div className="flex flex-wrap gap-2">
                {RECIPIENTS.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setRecipient(r.key)}
                    data-active={recipient === r.key}
                    className="chip"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price chips */}
            <div className="mt-5 pt-5 border-t border-hairline-cream">
              <p className="t-label-caps c-ink-faint mb-3">Price</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPrice(p.key)}
                    data-active={price === p.key}
                    className="chip"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtered grid */}
      <section className="pb-20 md:pb-32">
        <div className="container-aura">
          <div className="flex items-baseline justify-between mb-8 md:mb-10">
            <h2 className="t-headline-lg c-ink">
              {RECIPIENTS.find((r) => r.key === recipient)?.label}
            </h2>
            <p className="t-caption c-ink-faint t-num">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${recipient}-${price}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {filteredProducts.length > 0 ? (
                <RevealOnScroll
                  stagger={0.06}
                  className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </RevealOnScroll>
              ) : (
                <div className="text-center py-16 md:py-24">
                  <Sparkles
                    size={32}
                    strokeWidth={1}
                    className="c-ink-faint mx-auto mb-4"
                  />
                  <p className="t-headline-sm c-ink mb-2">
                    No pieces match these filters
                  </p>
                  <p className="t-body c-ink-muted mb-6">
                    Try widening your recipient or price range.
                  </p>
                  <button
                    onClick={() => {
                      setRecipient("all");
                      setPrice("all");
                    }}
                    className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Gift wrap note */}
          <div className="mt-16 md:mt-20 bg-cream/60 border border-hairline-cream rounded-sm p-6 md:p-8 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0">
              <Gift size={18} strokeWidth={1.25} className="c-gold-deep" />
            </div>
            <div className="flex-1">
              <p className="t-headline-sm c-ink mb-1">
                Complimentary gift wrapping
              </p>
              <p className="t-body-sm c-ink-muted leading-relaxed mb-3">
                Every gift order is wrapped in our signature cream paper with
                a gold-foil seal, and includes a handwritten note on recycled
                cotton card. Add your message at checkout.
              </p>
              <a
                href="mailto:concierge@auraliving.com"
                className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
              >
                <Mail size={12} strokeWidth={1.5} />
                Concierge for large gift orders
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default GiftsView;
