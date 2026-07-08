"use client";

import { useRef, useState, useCallback, useEffect } from "react";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";
import { X, Heart, ShoppingBag, Check, Trash2 } from "lucide-react";

import { useProductsBySlugs } from "@/hooks/queries/use-product-by-slug";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { RIGHT_DRAWER_CONSTRAINTS, rightDrawerDragEnd } from "@/lib/swipe-to-close";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import type { Product } from "@/types";

/** Local product type — avoids circular reference from typeof parameter. */
interface WishlistProduct extends Product {
  onSale: boolean;
}

const ADD_TO_CART_FEEDBACK_MS = 1800;

export function WishlistDrawer() {
  const router = useRouter();
  const isOpen = useWishlistStore((s) => s.isOpen);
  const close = useWishlistStore((s) => s.closeDrawer);
  const slugs = useWishlistStore((s) => s.slugs);
  const remove = useWishlistStore((s) => s.remove);
  const clearAll = useWishlistStore((s) => s.clear);
  const addToCart = useCartStore((s) => s.addLine);
  const prefersReducedMotion = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, isOpen);

  const { products: items } = useProductsBySlugs(slugs);

  // Track which product slug just had "added to cart" feedback
  const [cartFeedbackSlug, setCartFeedbackSlug] = useState<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up feedback timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  // Derive enriched products with sale status
  const enriched: WishlistProduct[] = items.map((p) => ({
    ...p,
    onSale: !!p.compareAtPrice && p.compareAtPrice > p.price,
  }));

  const inStockCount = enriched.filter((p) => p.inStock).length;
  const onSaleCount = enriched.filter((p) => p.onSale).length;

  const goShop = () => {
    close();
    router.push("/shop");
  };

  const goToProduct = (slug: string) => {
    close();
    router.push(`/product/${slug}`);
  };

  const handleAddToCart = useCallback(
    (product: WishlistProduct) => {
      addToCart(product);
      setCartFeedbackSlug(product.slug);

      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        setCartFeedbackSlug(null);
        feedbackTimerRef.current = null;
      }, ADD_TO_CART_FEEDBACK_MS);
    },
    [addToCart]
  );

  const handleClearAll = () => {
    if (!confirm("Remove all items from your wishlist?")) return;
    clearAll();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="fixed inset-0 z-[1000] overlay-dark"
            aria-hidden="true"
          />
          <motion.aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Wishlist"
            initial={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            drag={prefersReducedMotion ? false : "x"}
            dragConstraints={RIGHT_DRAWER_CONSTRAINTS}
            dragElastic={0.2}
            onDragEnd={(_e: unknown, info: PanInfo) => rightDrawerDragEnd(info, close)}
            className="fixed top-0 right-0 bottom-0 z-[1100] w-full max-w-[440px] bg-paper flex flex-col"
          >
            {/* Drag handle (left edge) */}
            {!prefersReducedMotion && (
              <div className="absolute top-0 left-0 bottom-0 w-1 flex items-center justify-center cursor-ew-resize" aria-hidden>
                <div className="w-[3px] h-12 rounded-full bg-hairline-gold opacity-40" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-6 h-[72px] border-b border-hairline">
              <div className="flex items-center gap-2">
                <Heart size={18} strokeWidth={1.25} className="c-ink" />
                <span className="t-headline-sm c-ink">Wishlist</span>
                <span className="t-body c-ink-faint t-num">({slugs.length})</span>
              </div>
              <div className="flex items-center gap-2">
                {slugs.length > 1 && (
                  <button
                    onClick={handleClearAll}
                    className="t-caption c-ink-faint hover:c-error transition-colors"
                    aria-label="Clear all wishlist items"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={close}
                  aria-label="Close wishlist"
                  className="p-2 text-ink hover:text-gold transition-colors"
                >
                  <X size={22} strokeWidth={1.25} />
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                <div className="w-24 h-24 rounded-full bg-cream flex items-center justify-center mb-6">
                  <Heart size={32} strokeWidth={1} className="c-ink-faint" />
                </div>
                <p className="t-headline-md c-ink mb-2">No saved pieces yet</p>
                <p className="t-body c-ink-muted mb-8 max-w-xs">
                  Tap the heart on any piece to save it here — for later, for a
                  friend, or for the next chapter.
                </p>
                <button
                  onClick={goShop}
                  className="bg-ink c-paper t-label-caps px-8 py-3.5 hover:bg-gold transition-colors"
                >
                  Browse the Shop
                </button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
                  <AnimatePresence initial={false}>
                    {enriched.map((product) => {
                      const showFeedback = cartFeedbackSlug === product.slug;

                      return (
                        <motion.div
                          key={product.id}
                          layout={!prefersReducedMotion}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="flex gap-4 py-5 border-b border-hairline last:border-b-0"
                        >
                          {/* Product image */}
                          <button
                            onClick={() => goToProduct(product.slug)}
                            className="w-20 h-24 flex-shrink-0 bg-cream overflow-hidden relative"
                            aria-label={`View ${product.name}`}
                          >
                            {product.onSale && (
                              <span className="wishlist-sale-badge">Sale</span>
                            )}
                            {!product.inStock && (
                              <div className="wishlist-sold-out-overlay">
                                <span className="wishlist-sold-out-text">Sold out</span>
                              </div>
                            )}
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              loading="lazy"
                            />
                          </button>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            {product.subtitle && (
                              <p className="t-caption c-ink-faint mb-0.5">
                                {product.subtitle}
                              </p>
                            )}
                            <button
                              onClick={() => goToProduct(product.slug)}
                              className="t-body c-ink font-medium hover:c-gold transition-colors link-underline text-left block truncate"
                            >
                              {product.name}
                            </button>

                            {/* Price — with compare-at when on sale */}
                            <div className="flex items-center gap-2 mt-1">
                              {product.onSale && product.compareAtPrice && (
                                <span className="t-body-sm c-ink-faint wishlist-price-compare t-num">
                                  {formatPrice(product.compareAtPrice)}
                                </span>
                              )}
                              <p className="t-body c-ink t-num">
                                {formatPrice(product.price)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 mt-3">
                              {product.inStock && (
                                <>
                                  {showFeedback ? (
                                    <span className="wishlist-cart-feedback" role="status">
                                      <Check size={13} strokeWidth={2} />
                                      Added
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleAddToCart(product)}
                                      className="inline-flex items-center gap-1.5 t-label-caps c-ink hover:c-gold transition-colors link-underline"
                                    >
                                      <ShoppingBag size={13} strokeWidth={1.5} />
                                      Add to cart
                                    </button>
                                  )}
                                </>
                              )}
                              <button
                                onClick={() => remove(product.slug)}
                                className="t-caption c-ink-faint hover:c-gold transition-colors link-underline"
                                aria-label={`Remove ${product.name} from wishlist`}
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          {/* Quick remove (appears on hover via group) */}
                          <button
                            onClick={() => remove(product.slug)}
                            aria-label={`Remove ${product.name}`}
                            className="self-start p-1 c-ink-faint hover:c-gold transition-colors"
                          >
                            <Trash2 size={14} strokeWidth={1.25} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Footer summary */}
                <div className="border-t border-hairline px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="t-caption c-ink-faint">
                      {inStockCount} in stock
                      {onSaleCount > 0 && (
                        <span> · {onSaleCount} on sale</span>
                      )}
                    </p>
                    <button
                      onClick={goShop}
                      className="btn-hover-underline-arrow t-label-caps c-ink-muted inline-flex items-center"
                    >
                      Continue Shopping
                      <span className="btn-arrow" aria-hidden>
                        <X size={12} strokeWidth={1.5} className="rotate-[-45deg]" />
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default WishlistDrawer;