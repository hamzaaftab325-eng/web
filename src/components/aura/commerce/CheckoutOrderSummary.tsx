"use client";

import { X, Tag, ShoppingBag, Package } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/types";

/**
 * Checkout order summary sidebar.
 *
 * Phase 5A: Extracted from CheckoutFlow.tsx (was inline at lines 436-540).
 * Displays cart items, promo code input, and totals (subtotal, discount, shipping, total).
 */

export interface PromoData {
  code: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  label: string;
  minOrder: number;
}

export interface CheckoutTotals {
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface CheckoutOrderSummaryProps {
  lines: CartLine[];
  cartCount: number;
  subtotal: number;
  totals: CheckoutTotals;
  promoData: PromoData | null;
  promoInput: string;
  promoError: string | null;
  promoLoading: boolean;
  onPromoInputChange: (value: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
}

export function CheckoutOrderSummary({
  lines,
  cartCount,
  subtotal,
  totals,
  promoData,
  promoInput,
  promoError,
  promoLoading,
  onPromoInputChange,
  onApplyPromo,
  onRemovePromo,
}: CheckoutOrderSummaryProps) {
  return (
    <aside>
      <div className="sticky top-[88px] bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
        <div className="p-5 border-b border-hairline-cream">
          <p className="t-label-caps c-ink-faint mb-1">Order Summary</p>
          <p className="t-body c-ink">{cartCount} item{cartCount === 1 ? "" : "s"}</p>
        </div>

        {/* Items */}
        <div className="max-h-[280px] overflow-y-auto divide-y divide-hairline-cream">
          {lines.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingBag size={28} strokeWidth={1} className="c-ink-faint mx-auto mb-2" />
              <p className="t-body-sm c-ink-faint">Your cart is empty</p>
            </div>
          ) : (
            lines.map((line) => (
              <div key={line.slug + (line.variantLabel ?? "")} className="flex items-center gap-3 p-4">
                <div className="relative w-14 h-14 bg-cream border border-hairline-cream overflow-hidden flex-shrink-0 rounded-sm">
                  {line.image ? (
                    <img src={line.image} alt={line.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={16} className="c-ink-faint" />
                    </div>
                  )}
                  <span className="absolute -top-1.5 -right-1.5 bg-ink c-paper text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center t-num">
                    {line.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="t-body-sm c-ink font-medium truncate">{line.name}</p>
                  {line.variantLabel && <p className="t-caption c-ink-faint">{line.variantLabel}</p>}
                </div>
                <p className="t-body-sm c-ink t-num font-medium">{formatPrice(line.price * line.quantity)}</p>
              </div>
            ))
          )}
        </div>

        {/* Promo code */}
        <div className="p-5 border-t border-hairline-cream">
          <p className="t-label-caps c-ink-faint mb-2">Promo code</p>
          {promoData ? (
            <div className="flex items-center justify-between bg-gold-pale border border-hairline-gold rounded-sm px-3 py-2">
              <div className="flex items-center gap-2">
                <Tag size={14} className="c-gold-deep" />
                <div>
                  <p className="t-body-sm c-gold-deep font-medium t-num">{promoData.code}</p>
                  <p className="t-caption c-ink-muted">{promoData.label}</p>
                </div>
              </div>
              <button onClick={onRemovePromo} aria-label="Remove promo code" className="p-1 c-ink-faint hover:c-error transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => onPromoInputChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !promoLoading) { e.preventDefault(); onApplyPromo(); } }}
                placeholder="Enter code"
                className="flex-1 px-3 py-2 t-body-sm c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors"
              />
              <button
                onClick={onApplyPromo}
                disabled={!promoInput.trim() || promoLoading}
                className="px-4 py-2 t-label-caps bg-ink c-paper rounded-sm hover:bg-gold-deep disabled:opacity-40 transition-colors"
              >
                {promoLoading ? "…" : "Apply"}
              </button>
            </div>
          )}
          {promoError && <p className="t-caption c-error mt-1.5">{promoError}</p>}
        </div>

        {/* Totals */}
        <div className="p-5 border-t border-hairline-cream space-y-2">
          <div className="flex justify-between t-body">
            <span className="c-ink-muted">Subtotal</span>
            <span className="t-num c-ink">{formatPrice(subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between t-body">
              <span className="c-ink-muted">Discount</span>
              <span className="t-num c-success">−{formatPrice(totals.discount)}</span>
            </div>
          )}
          <div className="flex justify-between t-body">
            <span className="c-ink-muted">Shipping</span>
            <span className="t-num c-ink">
              {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
            </span>
          </div>
          <div className="flex justify-between t-headline-sm pt-3 mt-3 border-t border-hairline-cream">
            <span className="c-ink">Total</span>
            <span className="t-num c-gold-deep">{formatPrice(totals.total)}</span>
          </div>
          <p className="t-caption c-ink-faint text-center pt-1">Cash on Delivery (PKR)</p>
        </div>
      </div>
    </aside>
  );
}

export default CheckoutOrderSummary;
