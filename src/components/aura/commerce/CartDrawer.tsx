"use client";

import { useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Plus, Minus, Trash2, Heart, Clock, ArrowRight, Check } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";
import { formatPrice } from "@/lib/utils";
import { RIGHT_DRAWER_CONSTRAINTS, rightDrawerDragEnd } from "@/lib/swipe-to-close";
import { useFocusTrap } from "@/hooks/use-focus-trap";

export function CartDrawer() {
  const router = useRouter();
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.closeCart);
  const lines = useCartStore((s) => s.lines);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeLine = useCartStore((s) => s.removeLine);
  const saveForLater = useCartStore((s) => s.saveForLater);
  const moveToWishlist = useCartStore((s) => s.moveToWishlist);
  const subtotal = useCartStore((s) => s.subtotal());

  const prefersReducedMotion = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, isOpen);

  const goCheckout = () => {
    close();
    router.push("/cart");
  };

  const goShop = () => {
    close();
    router.push("/shop");
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
            aria-label="Shopping cart"
            initial={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            drag={prefersReducedMotion ? false : "x"}
            dragConstraints={RIGHT_DRAWER_CONSTRAINTS}
            dragElastic={0.2}
            onDragEnd={(_e: unknown, info: PanInfo) => rightDrawerDragEnd(info, close)}
            className="fixed top-0 right-0 bottom-0 z-[1100] w-full max-w-[440px] bg-paper flex flex-col safe-area-top safe-area-bottom"
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
                <ShoppingBag size={18} strokeWidth={1.25} className="c-ink" />
                <span className="t-headline-sm c-ink">Your Cart</span>
                <span className="t-body c-ink-faint t-num">
                  ({lines.reduce((n, l) => n + l.quantity, 0)})
                </span>
              </div>
              <button
                onClick={close}
                aria-label="Close cart"
                className="p-2 text-ink hover:text-gold transition-colors"
              >
                <X size={22} strokeWidth={1.25} />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                <div className="w-24 h-24 rounded-full bg-cream flex items-center justify-center mb-6">
                  <ShoppingBag size={32} strokeWidth={1} className="c-ink-faint" />
                </div>
                <p className="t-headline-md c-ink mb-2">Your cart is empty</p>
                <p className="t-body c-ink-muted mb-8 max-w-xs">
                  You haven't added anything yet. Start with our considered edit
                  of lamps, mirrors, and ceramics.
                </p>
                <button
                  onClick={goShop}
                  className="bg-ink c-paper t-label-caps px-8 py-3.5 hover:bg-gold transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.div
                        key={line.key}
                        layout={!prefersReducedMotion}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="flex gap-4 py-5 border-b border-hairline last:border-b-0"
                      >
                        <div className="w-20 h-24 flex-shrink-0 bg-cream overflow-hidden">
                          <img
                            src={line.image}
                            alt={line.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="t-body c-ink font-medium mb-0.5 truncate">
                            {line.name}
                          </p>
                          {line.variantLabel && (
                            <p className="t-caption c-ink-faint mb-1">
                              {line.variantLabel}
                            </p>
                          )}
                          {/* Estimated delivery */}
                          <div className="flex items-center gap-1 mb-2">
                            <Clock size={10} strokeWidth={1.5} className="c-ink-faint" />
                            <p className="t-caption c-ink-faint">
                              Arrives in 3-5 days
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="inline-flex items-center border border-hairline">
                              <button
                                onClick={() => decrement(line.key)}
                                aria-label="Decrease quantity"
                                className="w-8 h-8 flex items-center justify-center c-ink hover:c-gold transition-colors"
                              >
                                <Minus size={12} strokeWidth={1.5} />
                              </button>
                              <span className="w-8 text-center t-body-sm c-ink t-num">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() => increment(line.key)}
                                aria-label="Increase quantity"
                                className="w-8 h-8 flex items-center justify-center c-ink hover:c-gold transition-colors"
                              >
                                <Plus size={12} strokeWidth={1.5} />
                              </button>
                            </div>
                            <p className="t-body c-ink t-num font-medium">
                              {formatPrice(line.price * line.quantity)}
                            </p>
                          </div>
                          {/* Quick actions */}
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => saveForLater(line.key)}
                              className="inline-flex items-center gap-1 t-caption c-ink-faint hover:c-gold-deep transition-colors link-underline"
                            >
                              <Clock size={10} strokeWidth={1.5} />
                              Save
                            </button>
                            <button
                              onClick={() => moveToWishlist(line.key)}
                              className="inline-flex items-center gap-1 t-caption c-ink-faint hover:c-gold-deep transition-colors link-underline"
                            >
                              <Heart size={10} strokeWidth={1.5} />
                              Wishlist
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => removeLine(line.key)}
                          aria-label="Remove item"
                          className="self-start p-1 c-ink-faint hover:c-gold transition-colors"
                        >
                          <Trash2 size={16} strokeWidth={1.25} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Summary */}
                <div className="border-t border-hairline px-6 py-5 space-y-3">
                  <div className="flex justify-between t-body c-ink-muted">
                    <span>Subtotal</span>
                    <span className="t-num c-ink font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between t-body c-ink-muted">
                    <span>Shipping</span>
                    <span className="t-num">
                      Calculated at checkout
                    </span>
                  </div>
                  <div className="flex justify-between t-headline-sm c-ink pt-3 border-t border-hairline">
                    <span>Total</span>
                    <span className="t-num">{formatPrice(subtotal)}</span>
                  </div>

                  <button
                    onClick={goCheckout}
                    className="btn-hover-icon-reveal w-full bg-ink c-paper t-label-caps py-4 rounded-sm inline-flex items-center justify-center gap-2"
                  >
                    <span className="btn-icon" aria-hidden>
                      <Check size={14} strokeWidth={2} />
                    </span>
                    View Cart & Checkout
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={goShop}
                    className="btn-hover-underline-arrow w-full t-label-caps c-ink-muted border border-ink/20 px-6 py-3.5 rounded-sm inline-flex items-center justify-center gap-2 mx-auto w-fit"
                  >
                    Continue Shopping
                    <span className="btn-arrow" aria-hidden>
                      <ArrowRight size={12} strokeWidth={1.5} />
                    </span>
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
