"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { X, Heart, ChevronDown, Check, Truck, RotateCcw, Shield, Minus, Plus } from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import { useUIStore } from "@/store/use-ui-store";
import { useCartStore } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { productBySlug, products as allProducts } from "@/data/products";
import { formatPrice, cn, sleep } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

export function ProductDetail() {
  const slug = useUIStore((s) => s.activeProductSlug);
  const close = useUIStore((s) => s.openProduct);
  const addToCart = useCartStore((s) => s.addLine);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wishedSlugs = useWishlistStore((s) => s.slugs);

  const prefersReducedMotion = useReducedMotion();

  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState<ProductVariant | undefined>(undefined);
  const [openSection, setOpenSection] = useState<string | null>("description");
  const [addingState, setAddingState] = useState<"idle" | "loading" | "success">("idle");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 30,
    dragFree: false,
  });
  const [selectedSlide, setSelectedSlide] = useState(0);

  const product: Product | undefined = slug ? productBySlug(slug) : undefined;

  // Reset state when the active product slug changes — using the documented
  // "store information from previous render" pattern.
  const [prevSlug, setPrevSlug] = useState<string | null>(slug);
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    if (product) {
      setQuantity(1);
      setVariant(product.variants?.[0]);
      setOpenSection("description");
      setAddingState("idle");
      setSelectedSlide(0);
    }
  }

  // Lock body scroll when open
  useEffect(() => {
    if (slug) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [slug]);

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && slug) close(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slug, close]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!slug || !product) return null;

  const onAddToCart = async () => {
    if (!product.inStock) return;
    setAddingState("loading");
    await sleep(300);
    addToCart(product, { quantity, variant });
    setAddingState("success");
    await sleep(1200);
    setAddingState("idle");
  };

  const isWished = wishedSlugs.includes(product.slug);

  const accordionSections = [
    {
      id: "description",
      label: "Description",
      content: (
        <div className="space-y-4">
          <p className="t-body c-ink-muted leading-relaxed">
            {product.longDescription || product.description}
          </p>
        </div>
      ),
    },
    {
      id: "materials",
      label: "Materials & Care",
      content: (
        <div className="space-y-3">
          {product.materials && product.materials.length > 0 && (
            <div>
              <p className="t-label-caps c-ink-faint mb-2">Materials</p>
              <ul className="space-y-1">
                {product.materials.map((m) => (
                  <li key={m} className="t-body c-ink-muted">
                    · {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {product.careInstructions && (
            <div>
              <p className="t-label-caps c-ink-faint mb-2 mt-4">Care</p>
              <p className="t-body c-ink-muted leading-relaxed">
                {product.careInstructions}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "dimensions",
      label: "Dimensions",
      content: (
        <p className="t-body c-ink-muted leading-relaxed">{product.dimensions}</p>
      ),
    },
    {
      id: "shipping",
      label: "Shipping & Returns",
      content: (
        <div className="space-y-3 t-body c-ink-muted leading-relaxed">
          <p>
            In-stock items ship within 1-2 business days. Larger pieces ship
            via white-glove freight in 5-10 business days.
          </p>
          <p>
            Returns accepted within 30 days of delivery in original condition.
            Living plants are final sale. See full policy at checkout.
          </p>
        </div>
      ),
    },
  ];

  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <AnimatePresence>
      {slug && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[1000] overlay-dark overflow-y-auto"
          onClick={() => close(null)}
        >
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-screen flex items-start justify-center p-3 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-paper w-full max-w-[1280px] shadow-modal relative">
              {/* Close button */}
              <button
                onClick={() => close(null)}
                aria-label="Close product"
                className="absolute top-4 right-4 z-10 p-2.5 bg-paper/90 backdrop-blur-sm rounded-full hover:bg-cream transition-colors"
              >
                <X size={20} strokeWidth={1.25} className="c-ink" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Gallery */}
                <div className="md:col-span-7 md:border-r border-hairline">
                  <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                      {product.images.map((src, i) => (
                        <div
                          key={i}
                          className="flex-[0_0_100%] aspect-[4/5] md:aspect-[3/4] bg-cream relative"
                        >
                          <img
                            src={src}
                            alt={`${product.name} — view ${i + 1}`}
                            className="w-full h-full object-cover"
                            loading={i === 0 ? "eager" : "lazy"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-2 p-3 md:p-4 border-t border-hairline overflow-x-auto scrollbar-hide">
                    {product.images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => emblaApi?.scrollTo(i)}
                        aria-label={`View image ${i + 1}`}
                        className={cn(
                          "flex-shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden border-2 transition-colors",
                          selectedSlide === i ? "border-gold" : "border-transparent hover:border-hairline"
                        )}
                      >
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="md:col-span-5 p-6 md:p-10 flex flex-col">
                  {/* Breadcrumb */}
                  <p className="t-caption c-ink-faint mb-4 t-label-caps">
                    {product.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>

                  <h1 className="t-display-md c-ink mb-3 leading-tight">
                    {product.name}
                  </h1>
                  {product.subtitle && (
                    <p className="t-body-lg c-ink-muted italic mb-4">
                      {product.subtitle}
                    </p>
                  )}

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="t-headline-sm c-ink t-num font-medium">
                      {formatPrice(product.price)}
                    </span>
                    {onSale && (
                      <span className="t-body c-ink-faint line-through t-num">
                        {formatPrice(product.compareAtPrice!)}
                      </span>
                    )}
                    {onSale && (
                      <span className="t-label-caps c-gold">
                        Save {formatPrice(product.compareAtPrice! - product.price)}
                      </span>
                    )}
                  </div>

                  <p className="t-body c-ink-muted leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mb-6">
                      <p className="t-label-caps c-ink-faint mb-3">
                        {product.subtitle ? "Finish" : "Variant"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setVariant(v)}
                            className={cn(
                              "chip",
                              variant?.id === v.id && "bg-ink c-paper border-ink"
                            )}
                            data-active={variant?.id === v.id}
                            aria-pressed={variant?.id === v.id}
                          >
                            {v.swatch && (
                              <span
                                className="swatch-dot"
                                data-swatch={v.swatch}
                                aria-hidden
                              />
                            )}
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity + Add to Cart */}
                  <div className="flex items-stretch gap-3 mb-3">
                    <div className="flex items-center border border-hairline">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="h-12 w-12 flex items-center justify-center c-ink hover:c-gold disabled:opacity-30 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} strokeWidth={1.5} />
                      </button>
                      <span className="w-10 text-center t-body c-ink t-num font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="h-12 w-12 flex items-center justify-center c-ink hover:c-gold transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} strokeWidth={1.5} />
                      </button>
                    </div>

                    <button
                      onClick={onAddToCart}
                      disabled={!product.inStock || addingState !== "idle"}
                      className={cn(
                        "flex-1 h-12 px-6 flex items-center justify-center gap-2 t-label-caps transition-all relative overflow-hidden",
                        product.inStock
                          ? "bg-ink c-paper hover:bg-gold hover:c-paper"
                          : "bg-cream c-ink-faint cursor-not-allowed"
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {addingState === "idle" && (
                          <motion.span
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {product.inStock ? "Add to Cart" : "Sold Out"}
                          </motion.span>
                        )}
                        {addingState === "loading" && (
                          <motion.span
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                              className="inline-block w-3.5 h-3.5 border border-paper/30 border-t-paper rounded-full"
                            />
                            Adding
                          </motion.span>
                        )}
                        {addingState === "success" && (
                          <motion.span
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <Check size={16} strokeWidth={2} />
                            Added
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>

                  {/* Wishlist + reassurance */}
                  <button
                    onClick={() => toggleWish(product.slug)}
                    className="inline-flex items-center gap-2 t-body c-ink-muted hover:c-gold transition-colors link-underline mb-6"
                  >
                    <Heart
                      size={16}
                      strokeWidth={1.25}
                      className={cn(isWished && "fill-gold c-gold")}
                    />
                    {isWished ? "Saved to wishlist" : "Save to wishlist"}
                  </button>

                  <div className="grid grid-cols-3 gap-3 mb-8 py-5 border-y border-hairline">
                    {[
                      { icon: Truck, label: "Ships in 1-2 days" },
                      { icon: RotateCcw, label: "30-day returns" },
                      { icon: Shield, label: "Lifetime care" },
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <item.icon
                          size={20}
                          strokeWidth={1.25}
                          className="mx-auto c-ink mb-2"
                        />
                        <p className="t-caption c-ink-muted">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Accordions */}
                  <div className="space-y-1">
                    {accordionSections.map((section) => {
                      const isOpen = openSection === section.id;
                      return (
                        <div
                          key={section.id}
                          className="border-b border-hairline"
                        >
                          <button
                            onClick={() =>
                              setOpenSection(isOpen ? null : section.id)
                            }
                            aria-expanded={isOpen}
                            className="w-full flex items-center justify-between py-4 text-left"
                          >
                            <span className="t-headline-sm c-ink">
                              {section.label}
                            </span>
                            <ChevronDown
                              size={18}
                              strokeWidth={1.25}
                              className={cn(
                                "c-ink transition-transform duration-300",
                                isOpen && "rotate-180"
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
                                <div className="pb-5">{section.content}</div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Related */}
              {related.length > 0 && (
                <div className="border-t border-hairline p-6 md:p-10">
                  <h2 className="t-headline-md c-ink mb-6">You May Also Like</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
                    {related.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProductDetail;
