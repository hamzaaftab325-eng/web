"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus, Loader2, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { cn, formatPrice, sleep } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { useUIStore } from "@/store/use-ui-store";

interface StickyMobileAddToCartProps {
  product: Product;
  variantLabel?: string;
  quantity: number;
}

export function StickyMobileAddToCart({
  product,
  variantLabel,
  quantity,
}: StickyMobileAddToCartProps) {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const addToCart = useCartStore((s) => s.addLine);
  const setCheckoutOpen = useUIStore((s) => s.setCheckoutOpen);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onAdd = async () => {
    setState("loading");
    await sleep(350);
    addToCart(product, { quantity });
    setState("success");
    await sleep(1200);
    setState("idle");
  };

  const onCheckout = () => setCheckoutOpen(true);

  const soldOut = !product.inStock;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: 90, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-sticky lg:hidden safe-area-bottom bg-paper border-t border-hairline shadow-elevated"
          role="region"
          aria-label="Quick add to cart"
        >
          <div className="flex items-center gap-3 p-3">
            {/* Product image */}
            <img
              src={product.images[0]}
              alt=""
              className="w-12 h-12 object-cover rounded-sm border border-hairline-cream flex-shrink-0"
            />
            {/* Name + price */}
            <div className="flex-1 min-w-0">
              <p className="t-body-sm c-ink truncate font-medium">{product.name}</p>
              {variantLabel && (
                <p className="t-caption c-ink-faint truncate">{variantLabel}</p>
              )}
              <p className="t-body-sm c-ink t-num mt-0.5">{formatPrice(product.price)}</p>
            </div>
            {/* Action */}
            <button
              onClick={state === "success" ? onCheckout : onAdd}
              disabled={soldOut || state === "loading"}
              aria-label={
                soldOut
                  ? "Sold out"
                  : state === "success"
                  ? "View cart"
                  : `Add ${quantity} to cart`
              }
              className={cn(
                "inline-flex items-center gap-2 px-5 h-11 t-label-caps transition-colors whitespace-nowrap",
                soldOut && "bg-cream c-ink-faint cursor-not-allowed",
                !soldOut && state === "idle" && "bg-ink c-paper hover:bg-gold-deep",
                state === "loading" && "bg-ink c-paper opacity-80",
                state === "success" && "bg-success c-paper hover:opacity-90"
              )}
            >
              {soldOut ? (
                "Sold Out"
              ) : state === "loading" ? (
                <>
                  <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
                  Adding
                </>
              ) : state === "success" ? (
                <>
                  <ShoppingBag size={14} strokeWidth={1.5} />
                  View cart
                </>
              ) : (
                <>
                  <Plus size={14} strokeWidth={1.75} />
                  Add · {formatPrice(product.price * quantity)}
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StickyMobileAddToCart;
