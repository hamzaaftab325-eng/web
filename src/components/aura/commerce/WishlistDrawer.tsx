"use client";

import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Heart, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useCartStore } from "@/store/use-cart-store";
import { productBySlug } from "@/data/products";
import { RIGHT_DRAWER_CONSTRAINTS, rightDrawerDragEnd } from "@/lib/swipe-to-close";
import { formatPrice } from "@/lib/utils";

export function WishlistDrawer() {
  const router = useRouter();
  const isOpen = useWishlistStore((s) => s.isOpen);
  const close = useWishlistStore((s) => s.closeDrawer);
  const slugs = useWishlistStore((s) => s.slugs);
  const remove = useWishlistStore((s) => s.remove);
  const addToCart = useCartStore((s) => s.addLine);
  const prefersReducedMotion = useReducedMotion();

  const items = slugs
    .map((s) => productBySlug(s))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const goShop = () => {
    close();
    router.push("/shop");
  };

  const goToProduct = (slug: string) => {
    close();
    router.push(`/product/${slug}`);
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
          />
          <motion.aside
            initial={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            drag={prefersReducedMotion ? false : "x"}
            dragConstraints={RIGHT_DRAWER_CONSTRAINTS}
            dragElastic={0.2}
            onDragEnd={(_e: unknown, info: PanInfo) => rightDrawerDragEnd(info, close)}
            className="fixed top-0 right-0 bottom-0 z-[1100] w-full max-w-[440px] bg-paper flex flex-col"
            aria-label="Wishlist"
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
                <span className="t-body c-ink-faint t-num">({items.length})</span>
              </div>
              <button
                onClick={close}
                aria-label="Close wishlist"
                className="p-2 text-ink hover:text-gold transition-colors"
              >
                <X size={22} strokeWidth={1.25} />
              </button>
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
              <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
                <AnimatePresence initial={false}>
                  {items.map((product) => (
                    <motion.div
                      key={product.id}
                      layout={!prefersReducedMotion}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex gap-4 py-5 border-b border-hairline last:border-b-0"
                    >
                      <button
                        onClick={() => goToProduct(product.slug)}
                        className="w-20 h-24 flex-shrink-0 bg-cream overflow-hidden"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="t-caption c-ink-faint mb-0.5">
                          {product.subtitle}
                        </p>
                        <button
                          onClick={() => goToProduct(product.slug)}
                          className="t-body c-ink font-medium hover:c-gold transition-colors link-underline text-left block truncate"
                        >
                          {product.name}
                        </button>
                        <p className="t-body c-ink t-num mt-1">
                          {formatPrice(product.price)}
                        </p>

                        <div className="flex items-center gap-3 mt-3">
                          {product.inStock && (
                            <button
                              onClick={() => addToCart(product)}
                              className="inline-flex items-center gap-1.5 t-label-caps c-ink hover:c-gold transition-colors link-underline"
                            >
                              <ShoppingBag size={13} strokeWidth={1.5} />
                              Add to cart
                            </button>
                          )}
                          <button
                            onClick={() => remove(product.slug)}
                            className="t-caption c-ink-faint hover:c-gold transition-colors link-underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default WishlistDrawer;
