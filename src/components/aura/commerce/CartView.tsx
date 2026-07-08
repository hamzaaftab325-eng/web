"use client";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Heart,
  Clock,
  ArrowRight,
  Tag,
  Truck,
  RotateCcw,
  Check,
} from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { useUIStore } from "@/store/use-ui-store";

/** Estimated delivery: 3-5 business days from today. */
function getEstimatedDelivery(): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + 3);
  const end = new Date(now);
  end.setDate(end.getDate() + 5);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return `${fmt(start)} – ${fmt(end)}`;
}

export function CartView() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const setCheckoutOpen = useUIStore((s) => s.setCheckoutOpen);

  const lines = useCartStore((s) => s.lines);
  const savedForLater = useCartStore((s) => s.savedForLater);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeLine = useCartStore((s) => s.removeLine);
  const saveForLater = useCartStore((s) => s.saveForLater);
  const moveToCart = useCartStore((s) => s.moveToCart);
  const moveToWishlist = useCartStore((s) => s.moveToWishlist);
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartStore((s) => s.subtotal());

  const goCheckout = () => {
    setCheckoutOpen(true);
  };

  const goShop = () => {
    router.push("/shop");
  };

  // Empty cart state
  if (lines.length === 0 && savedForLater.length === 0) {
    return (
      <div className="bg-canvas pt-24 md:pt-28 min-h-screen">
        <div className="container-aura max-w-2xl mx-auto py-16 md:py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-gold-pale flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={28} strokeWidth={1.25} className="c-gold-deep" />
          </div>
          <h1 className="t-display-md c-ink leading-tight mb-4">
            Your cart is empty.
          </h1>
          <p className="t-body-lg c-ink-muted max-w-md mx-auto mb-8 leading-relaxed">
            Browse the catalogue and add pieces you love. They'll wait here
            for you when you're ready.
          </p>
          <button
            onClick={goShop}
            className="inline-flex items-center gap-3 bg-ink c-paper t-label-caps px-6 py-3.5 hover:bg-gold-deep transition-colors rounded-sm"
          >
            Browse the Shop
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas pt-24 md:pt-28 pb-20 md:pb-32 min-h-screen">
      <div className="container-aura">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            Shopping Cart
          </p>
          <h1 className="t-display-lg c-ink leading-tight">
            Your Cart
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: cart items */}
          <div className="lg:col-span-8">
            {/* Cart line items */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {lines.map((line) => (
                  <motion.div
                    key={line.key}
                    layout
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-4 md:p-5 flex gap-4"
                  >
                    {/* Image */}
                    <button
                      onClick={() => router.push(`/product/${line.slug}`)}
                      className="w-20 h-24 md:w-24 md:h-28 flex-shrink-0 bg-cream overflow-hidden rounded-sm"
                    >
                      <img
                        src={line.image}
                        alt={line.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </button>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <button
                          onClick={() => router.push(`/product/${line.slug}`)}
                          className="t-body c-ink font-medium hover:c-gold-deep transition-colors link-underline text-left block truncate"
                        >
                          {line.name}
                        </button>
                        <p className="t-body c-ink t-num font-medium flex-shrink-0">
                          {formatPrice(line.price * line.quantity)}
                        </p>
                      </div>

                      {line.variantLabel && (
                        <p className="t-caption c-ink-faint mb-1">
                          {line.variantLabel}
                        </p>
                      )}

                      {/* Estimated delivery */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <Clock size={11} strokeWidth={1.5} className="c-ink-faint" />
                        <p className="t-caption c-ink-faint">
                          Arrives {getEstimatedDelivery()}
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Quantity */}
                        <div className="flex items-center border border-hairline-cream rounded-sm">
                          <button
                            onClick={() => decrement(line.key)}
                            aria-label="Decrease quantity"
                            className="w-8 h-8 flex items-center justify-center c-ink-muted hover:c-gold-deep transition-colors"
                          >
                            <Minus size={12} strokeWidth={2} />
                          </button>
                          <span className="w-8 text-center t-body-sm c-ink t-num">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => increment(line.key)}
                            disabled={line.stockQuantity ? line.quantity >= line.stockQuantity : false}
                            aria-label="Increase quantity"
                            className="w-8 h-8 flex items-center justify-center c-ink-muted hover:c-gold-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} strokeWidth={2} />
                          </button>
                        </div>

                        {/* Save for later */}
                        <button
                          onClick={() => saveForLater(line.key)}
                          className="inline-flex items-center gap-1.5 t-caption c-ink-faint hover:c-gold-deep transition-colors link-underline"
                        >
                          <Clock size={11} strokeWidth={1.5} />
                          Save for later
                        </button>

                        {/* Move to wishlist */}
                        <button
                          onClick={() => moveToWishlist(line.key)}
                          className="inline-flex items-center gap-1.5 t-caption c-ink-faint hover:c-gold-deep transition-colors link-underline"
                        >
                          <Heart size={11} strokeWidth={1.5} />
                          Move to wishlist
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => removeLine(line.key)}
                          aria-label="Remove item"
                          className="inline-flex items-center gap-1.5 t-caption c-ink-faint hover:c-error transition-colors"
                        >
                          <Trash2 size={11} strokeWidth={1.5} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Clear cart */}
            {lines.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={clear}
                  className="inline-flex items-center gap-1.5 t-label-caps c-ink-faint hover:c-error transition-colors link-underline"
                >
                  <Trash2 size={12} strokeWidth={1.5} />
                  Clear cart
                </button>
              </div>
            )}

            {/* Saved for later */}
            {savedForLater.length > 0 && (
              <div className="mt-12">
                <h2 className="t-headline-md c-ink mb-4 flex items-center gap-2">
                  <Clock size={18} strokeWidth={1.25} className="c-gold-deep" />
                  Saved for Later ({savedForLater.length})
                </h2>
                <div className="space-y-3">
                  {savedForLater.map((item) => (
                    <div
                      key={item.key}
                      className="bg-cream/40 border border-hairline-cream rounded-sm p-4 flex gap-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="t-body-sm c-ink font-medium truncate">
                          {item.name}
                        </p>
                        {item.variantLabel && (
                          <p className="t-caption c-ink-faint">{item.variantLabel}</p>
                        )}
                        <p className="t-body-sm c-ink t-num mt-1">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveToCart(item.key)}
                          className="inline-flex items-center gap-1.5 t-caption c-ink hover:c-gold-deep transition-colors link-underline"
                        >
                          <RotateCcw size={11} strokeWidth={1.5} />
                          Move to cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 md:p-8 sticky top-[100px]">
              <h2 className="t-headline-sm c-ink mb-6">Order Summary</h2>

              {/* Totals */}
              <div className="space-y-3 pb-4 border-b border-hairline-cream">
                <div className="flex justify-between t-body c-ink-muted">
                  <span>Subtotal ({lines.reduce((n, l) => n + l.quantity, 0)} items)</span>
                  <span className="t-num c-ink">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between t-body c-ink-muted">
                  <span>Shipping</span>
                  <span className="t-num c-ink-faint">Calculated at checkout</span>
                </div>
                <div className="flex justify-between t-body c-ink-muted">
                  <span>Payment</span>
                  <span className="t-num c-ink">Cash on Delivery</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between t-headline-sm c-ink py-4">
                <span>Subtotal</span>
                <span className="t-num c-gold-deep font-medium">{formatPrice(subtotal)}</span>
              </div>

              {/* Checkout button */}
              <button
                onClick={goCheckout}
                disabled={lines.length === 0}
                className="btn-hover-icon-reveal w-full bg-ink c-paper t-label-caps py-4 rounded-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <span className="btn-icon" aria-hidden>
                  <Check size={14} strokeWidth={2} />
                </span>
                Proceed to Checkout
              </button>

              {/* Continue shopping */}
              <button
                onClick={goShop}
                className="btn-hover-underline-arrow w-full mt-3 t-label-caps c-ink-muted border border-ink/20 px-6 py-3.5 rounded-sm inline-flex items-center justify-center gap-2"
              >
                Continue Shopping
                <span className="btn-arrow" aria-hidden>
                  <ArrowRight size={12} strokeWidth={1.5} />
                </span>
              </button>

              {/* Trust signals */}
              <div className="mt-6 pt-6 border-t border-hairline-cream space-y-2">
                <p className="t-caption c-ink-faint flex items-center gap-2">
                  <Truck size={12} strokeWidth={1.5} className="c-gold-deep" />
                  Shipping calculated at checkout
                </p>
                <p className="t-caption c-ink-faint flex items-center gap-2">
                  <RotateCcw size={12} strokeWidth={1.5} className="c-gold-deep" />
                  14-day returns on all pieces
                </p>
                <p className="t-caption c-ink-faint flex items-center gap-2">
                  <Tag size={12} strokeWidth={1.5} className="c-gold-deep" />
                  Cash on Delivery · PKR pricing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartView;
