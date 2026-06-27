"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Check,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import { cn, formatPrice, sleep } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { useUIStore } from "@/store/use-ui-store";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useToast } from "@/hooks/use-toast";
import AuraChip from "@/components/aura/ui/Chip";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

/**
 * QuickViewModal — compact product detail surfaced in a warm gradient card.
 *
 * Two-column layout (image | info) at 800px max width. Focus is trapped while
 * open and Escape dismisses. Add-to-cart posts to the shared cart store; "View
 * Full Details" hands off to the full-page PDP via the UI store.
 */
export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const addToCart = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.openCart);
  const openProductPage = useUIStore((s) => s.openProductPage);
  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);

  const [variant, setVariant] = useState<ProductVariant | undefined>(undefined);
  const [adding, setAdding] = useState<"idle" | "loading" | "success">("idle");
  const [imgLoaded, setImgLoaded] = useState(false);

  // Reset per-product local state using the "previous render" pattern.
  const [prevId, setPrevId] = useState<string | null>(null);
  if (product && product.id !== prevId) {
    setPrevId(product.id);
    setVariant(product.variants?.[0]);
    setAdding("idle");
    setImgLoaded(false);
  }

  // Focus trap (active whenever a product is showing).
  useFocusTrap(containerRef, Boolean(product));

  // Escape to close + body scroll lock.
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [product, onClose]);

  const onAddToCart = async () => {
    if (!product || !product.inStock) return;
    setAdding("loading");
    await sleep(350);
    addToCart(product, { quantity: 1, variant });
    setAdding("success");
    toast({
      title: "Added to cart",
      description: `${product.name}${variant ? ` — ${variant.label}` : ""}`,
    });
    await sleep(1100);
    setAdding("idle");
  };

  const onViewDetails = () => {
    if (!product) return;
    onClose();
    // Defer the route change so the exit animation can begin first.
    window.setTimeout(() => openProductPage(product.slug), 0);
  };

  const onOpenCart = () => {
    onClose();
    window.setTimeout(() => openCart(), 0);
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view — ${product.name}`}
        >
          {/* Scrim */}
          <motion.div
            className="absolute inset-0 overlay-dark"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />

          {/* Card */}
          <motion.div
            ref={containerRef}
            className={cn(
              "relative w-full max-w-[800px] max-h-[90vh] overflow-y-auto scrollbar-thin",
              "bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern shadow-modal"
            )}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.97, y: 8 }
            }
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-paper/80 backdrop-blur-sm border border-hairline rounded-full c-ink hover:c-gold-deep transition-colors"
            >
              <X size={18} strokeWidth={1.25} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[480px] bg-cream overflow-hidden">
                {!imgLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-cream to-cream-deep animate-pulse" />
                )}
                <img
                  src={product.images[0]}
                  alt={product.name}
                  onLoad={() => setImgLoaded(true)}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-700",
                    imgLoaded ? "opacity-100" : "opacity-0"
                  )}
                />
                {product.badge && (
                  <span
                    className={cn(
                      "absolute top-4 left-4 t-label-caps px-2.5 py-1.5",
                      product.badge === "Sold Out" && "bg-ink c-paper",
                      product.badge === "Sale" && "bg-gold c-paper",
                      product.badge === "New" &&
                        "bg-paper c-ink border border-hairline",
                      product.badge === "Bestseller" &&
                        "bg-paper c-ink border border-hairline"
                    )}
                  >
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col p-6 sm:p-8">
                {product.subtitle && (
                  <p className="t-caption c-ink-faint mb-2">{product.subtitle}</p>
                )}
                <h2 className="t-headline-md c-ink mb-3 leading-tight">
                  {product.name}
                </h2>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="t-headline-sm c-ink t-num font-medium">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice &&
                    product.compareAtPrice > product.price && (
                      <>
                        <span className="t-body-sm c-ink-faint line-through t-num">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                        <span className="t-label-caps c-gold">
                          Save {formatPrice(product.compareAtPrice - product.price)}
                        </span>
                      </>
                    )}
                </div>

                <p className="t-body-sm c-ink-muted leading-relaxed mb-5 line-clamp-4">
                  {product.description}
                </p>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="t-label-caps c-ink-faint">
                        {product.subtitle ? "Finish" : "Variant"}
                      </p>
                      {variant && (
                        <span className="t-body-sm c-ink-muted">
                          {variant.label}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <AuraChip
                          key={v.id}
                          asButton
                          pressed={variant?.id === v.id}
                          onClick={() => setVariant(v)}
                          aria-label={`Select ${v.label}`}
                        >
                          {v.swatch && (
                            <svg
                              viewBox="0 0 12 12"
                              className="w-3 h-3"
                              aria-hidden="true"
                            >
                              <circle cx="6" cy="6" r="6" fill={v.swatch} />
                            </svg>
                          )}
                          {v.label}
                        </AuraChip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock */}
                <div className="flex items-center gap-2 mb-5">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      product.inStock ? "bg-success" : "bg-error"
                    )}
                    aria-hidden="true"
                  />
                  <span className="t-caption c-ink-muted">
                    {product.inStock
                      ? "In stock — ships in 1–2 days"
                      : "Currently sold out"}
                  </span>
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  onClick={onAddToCart}
                  disabled={!product.inStock || adding !== "idle"}
                  className={cn(
                    "w-full h-12 flex items-center justify-center gap-2 t-label-caps rounded-sm transition-all relative overflow-hidden",
                    adding === "idle" &&
                      product.inStock &&
                      "bg-ink c-paper hover:bg-gold-deep",
                    adding === "loading" && "bg-ink c-paper opacity-85",
                    adding === "success" && "bg-success c-paper",
                    !product.inStock &&
                      "bg-cream c-ink-faint cursor-not-allowed"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {adding === "idle" && (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2"
                      >
                        <ShoppingBag size={14} strokeWidth={1.5} />
                        {product.inStock ? "Add to Cart" : "Sold Out"}
                      </motion.span>
                    )}
                    {adding === "loading" && (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2"
                      >
                        <Loader2
                          size={14}
                          strokeWidth={1.75}
                          className="animate-spin"
                        />
                        Adding
                      </motion.span>
                    )}
                    {adding === "success" && (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2"
                      >
                        <Check size={16} strokeWidth={2} />
                        Added to cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                {/* Secondary actions */}
                <div className="flex items-center justify-between gap-4 mt-4">
                  <button
                    type="button"
                    onClick={onViewDetails}
                    className="inline-flex items-center gap-1.5 t-body c-ink hover:c-gold-deep transition-colors link-underline"
                  >
                    View Full Details
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </button>
                  <AnimatePresence>
                    {adding === "success" && (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onOpenCart}
                        className="t-body-sm c-gold-deep hover:c-ink transition-colors link-underline"
                      >
                        Open cart
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Reassurance row */}
                <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-hairline">
                  {[
                    { icon: Truck, label: "Ships 1–2 days" },
                    { icon: RotateCcw, label: "30-day returns" },
                    { icon: Shield, label: "Lifetime care" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center text-center gap-1.5">
                      <item.icon
                        size={16}
                        strokeWidth={1.25}
                        className="c-ink"
                      />
                      <span className="t-caption c-ink-muted">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default QuickViewModal;
