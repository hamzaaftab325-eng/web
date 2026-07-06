"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  Check,
  Eye,
  ArrowRight,
  Package,
} from "lucide-react";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useCartStore } from "@/store/use-cart-store";
import { useProductsBySlugs } from "@/hooks/queries/use-product-by-slug";
import { RIGHT_DRAWER_CONSTRAINTS, rightDrawerDragEnd } from "@/lib/swipe-to-close";
import { formatPrice, cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/use-focus-trap";

/* ─── Added-to-cart feedback ─── */
function useAddToCartFeedback() {
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const markAdded = (slug: string) => {
    setJustAdded(slug);
    setTimeout(() => setJustAdded(null), 1800);
  };
  return { justAdded, markAdded };
}

/* ─── Wishlist product type ─── */
type WishlistProduct = { id: string; slug: string; name: string; subtitle?: string | null; price: number; compareAtPrice?: number | null; images: string[]; inStock: boolean; stockQuantity?: number };

/* ─── Single wishlist item ─── */
function WishlistItem({
  product,
  onRemove,
  onAddToCart,
  onViewProduct,
  justAdded,
}: {
  product: WishlistProduct;
  onRemove: (slug: string) => void;
  onAddToCart: (product: WishlistProduct) => void;
  onViewProduct: (slug: string) => void;
  justAdded: boolean;
}) {
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = !product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.25 } }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="flex gap-4 py-5 border-b border-hairline last:border-b-0">
        {/* Image */}
        <button
          onClick={() => onViewProduct(product.slug)}
          className="relative w-[88px] h-[108px] flex-shrink-0 bg-cream overflow-hidden rounded-sm"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {onSale && (
            <span className="absolute top-1.5 left-1.5 bg-gold c-ink text-[8px] t-label-caps px-1.5 py-0.5 rounded-sm font-bold t-num">
              SALE
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-paper/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="t-caption c-ink-muted text-[9px] t-label-caps tracking-wider">SOLD OUT</span>
            </div>
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            {product.subtitle && (
              <p className="t-caption c-ink-faint mb-0.5 truncate">{product.subtitle}</p>
            )}
            <button
              onClick={() => onViewProduct(product.slug)}
              className="t-body c-ink font-medium hover:c-gold-deep transition-colors text-left block truncate leading-snug"
            >
              {product.name}
            </button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="t-body t-num c-ink font-medium">{formatPrice(product.price)}</span>
            {onSale && product.compareAtPrice && (
              <span className="t-caption t-num c-ink-faint line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2.5">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 t-caption c-ink-faint">
                <Package size={12} strokeWidth={1.5} />
                Out of stock
              </span>
            ) : justAdded ? (
              <span className="inline-flex items-center gap-1.5 t-label-caps c-success text-[10px] tracking-wider font-medium">
                <Check size={13} strokeWidth={2.5} />
                Added to cart
              </span>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                className="inline-flex items-center gap-1.5 t-label-caps c-ink hover:c-gold-deep transition-colors text-[10px] tracking-wider group/btn"
              >
                <ShoppingBag size={12} strokeWidth={1.5} className="group-hover/btn:scale-110 transition-transform" />
                Add to cart
              </button>
            )}

            <button
              onClick={() => onViewProduct(product.slug)}
              className="inline-flex items-center gap-1 t-caption c-ink-faint hover:c-gold-deep transition-colors text-[10px]"
              title="View details"
            >
              <Eye size={12} strokeWidth={1.5} />
              <span className="hidden sm:inline">View</span>
            </button>
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(product.slug)}
          className="absolute top-5 right-0 p-1.5 c-ink-faint/40 hover:c-error hover:bg-error/5 rounded-md transition-all opacity-0 group-hover:opacity-100"
          aria-label="Remove from wishlist"
          title="Remove from wishlist"
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Drawer ─── */
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
  const { justAdded, markAdded } = useAddToCartFeedback();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useFocusTrap(drawerRef, isOpen);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflowY = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflowY = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const { products: items } = useProductsBySlugs(slugs);

  const goShop = () => { close(); router.push("/shop"); };
  const goToProduct = (slug: string) => { close(); router.push(`/product/${slug}`); };
  const handleAddToCart = (product: WishlistProduct) => {
    addToCart(product);
    markAdded(product.slug);
  };
  const handleRemove = (slug: string) => { remove(slug); };
  const handleClearAll = () => {
    clearAll();
    setShowClearConfirm(false);
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
            className="fixed top-0 right-0 bottom-0 z-[1100] w-full sm:max-w-[440px] bg-paper flex flex-col safe-area-top safe-area-bottom"
          >
            {/* Drag handle */}
            {!prefersReducedMotion && (
              <div className="absolute top-0 left-0 bottom-0 w-1 flex items-center justify-center cursor-ew-resize" aria-hidden>
                <div className="w-[3px] h-12 rounded-full bg-hairline-gold opacity-40" />
              </div>
            )}

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 h-[72px] border-b border-hairline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold-pale/50 flex items-center justify-center">
                  <Heart size={16} strokeWidth={1.5} className="c-gold-deep" />
                </div>
                <div>
                  <h2 className="t-headline-sm c-ink leading-none">Wishlist</h2>
                  {items.length > 0 && (
                    <p className="t-caption c-ink-faint mt-0.5">{items.length} {items.length === 1 ? "piece" : "pieces"} saved</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Clear all — only when items exist */}
                {items.length > 1 && (
                  <div className="relative mr-1">
                    {showClearConfirm ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleClearAll}
                          className="px-2.5 py-1.5 bg-error c-paper text-[9px] t-label-caps rounded-sm tracking-wider font-medium hover:bg-error/80 transition-colors"
                        >
                          Clear all
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="px-2 py-1.5 t-caption c-ink-faint hover:c-ink transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="p-2 c-ink-faint hover:c-error hover:bg-error/5 rounded-md transition-all"
                        title="Clear all"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                )}

                <button
                  onClick={close}
                  aria-label="Close wishlist"
                  className="p-2 c-ink hover:c-gold-deep transition-colors rounded-md hover:bg-gold-pale/30"
                >
                  <X size={20} strokeWidth={1.25} />
                </button>
              </div>
            </div>

            {/* Content */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                {/* Empty state illustration */}
                <div className="relative mb-8">
                  <div className="w-28 h-28 rounded-2xl bg-cream/60 flex items-center justify-center">
                    <Heart size={40} strokeWidth={0.8} className="c-ink-faint/40" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold-pale flex items-center justify-center">
                    <Heart size={14} strokeWidth={1.5} className="c-gold-deep" />
                  </div>
                </div>

                <h3 className="t-headline-sm c-ink mb-2">Your wishlist is empty</h3>
                <p className="t-body c-ink-muted mb-8 max-w-[260px] leading-relaxed">
                  Tap the heart on any piece to save it here — for later, for a friend, or for the next chapter of your home.
                </p>

                <button
                  onClick={goShop}
                  className="group inline-flex items-center gap-2.5 bg-ink c-paper t-label-caps px-8 py-3.5 rounded-sm hover:bg-gold-deep transition-all duration-300 shadow-sm"
                >
                  Browse the Shop
                  <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {items.map((product) => (
                    <WishlistItem
                      key={product.id}
                      product={product}
                      onRemove={handleRemove}
                      onAddToCart={handleAddToCart}
                      onViewProduct={goToProduct}
                      justAdded={justAdded === product.slug}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Footer — summary + CTA when items exist */}
            {items.length > 0 && (
              <div className="border-t border-hairline px-6 py-4 bg-paper">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="t-caption c-ink-faint">
                      {items.filter((p) => p.inStock).length} in stock
                    </p>
                    {items.some((p) => p.compareAtPrice && p.compareAtPrice > p.price) && (
                      <p className="t-caption c-gold-deep mt-0.5">
                        {items.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).length} on sale
                      </p>
                    )}
                  </div>
                  <button
                    onClick={goShop}
                    className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-5 py-2.5 rounded-sm hover:bg-gold-deep transition-all duration-300 text-[10px]"
                  >
                    Continue Shopping
                    <ArrowRight size={12} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default WishlistDrawer;