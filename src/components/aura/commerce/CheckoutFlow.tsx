"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  Truck,
  Zap,
  Package,
  Tag,
  Gift,
  ShieldCheck,
  Loader2,
  ShoppingBag,
  CreditCard,
  Wallet,
  Smartphone,
} from "lucide-react";
import { cn, formatPrice, sleep, uid } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { useUIStore } from "@/store/use-ui-store";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useToast } from "@/hooks/use-toast";
import { beginCheckout, purchase } from "@/lib/analytics/ecommerce";
import { AuraInput, AuraTextarea } from "@/components/aura/ui/AuraInput";

const GIFT_WRAP_PRICE = 8;
const TAX_RATE = 0.08;
const FREE_SHIP_THRESHOLD = 150;

const PROMOS: Record<
  string,
  { type: "percent" | "shipping"; value: number; label: string }
> = {
  AURA10: { type: "percent", value: 0.1, label: "10% off your order" },
  WELCOME15: { type: "percent", value: 0.15, label: "15% off — welcome" },
  FREESHIP: { type: "shipping", value: 0, label: "Free shipping" },
};

const STEPS = ["Information", "Shipping", "Payment"] as const;

interface ShippingMethod {
  id: string;
  label: string;
  detail: string;
  icon: typeof Truck;
  cost: (sub: number) => number;
}

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    label: "Standard",
    detail: "3–5 business days · insured ground",
    icon: Truck,
    cost: (sub) => (sub >= FREE_SHIP_THRESHOLD ? 0 : 8),
  },
  {
    id: "expedited",
    label: "Expedited",
    detail: "2 business days · insured air",
    icon: Zap,
    cost: () => 18,
  },
  {
    id: "white-glove",
    label: "White-Glove",
    detail: "5–10 business days · freight + assembly",
    icon: Package,
    cost: () => 45,
  },
];

interface InfoForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

interface PaymentForm {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

/**
 * CheckoutFlow — full-screen three-step checkout driven by the UI store's
 * `checkoutOpen` flag. Information → Shipping → Payment, then a confirmation
 * screen. Order summary sidebar holds the promo field, gift-wrap toggle, and
 * order notes. Focus is trapped for the duration of the flow.
 */
export function CheckoutFlow() {
  const prefersReducedMotion = useReducedMotion();
  const isOpen = useUIStore((s) => s.checkoutOpen);
  const setCheckoutOpen = useUIStore((s) => s.setCheckoutOpen);
  const setView = useUIStore((s) => s.setView);
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const cartCount = useCartStore((s) => s.count());
  const clearCart = useCartStore((s) => s.clear);
  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0); // 0,1,2 form; 3 = confirmation
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const [info, setInfo] = useState<InfoForm>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phone: "",
  });
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [payment, setPayment] = useState<PaymentForm>({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [billingSame, setBillingSame] = useState(true);

  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  // Reset flow state each time the modal opens (previous-render pattern —
  // avoids a setState-in-effect and the cascading render it would cause).
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setStep(0);
      setPlacedOrder(null);
      setPlacing(false);
      // Fire analytics: begin_checkout
      beginCheckout({
        currency: "USD",
        value: subtotal,
        items: lines.map((l) => ({
          item_id: l.productId,
          item_name: l.name,
          price: l.price,
          quantity: l.quantity,
          item_variant: l.variantLabel,
        })),
      });
    }
  }

  // Focus trap + Esc + body lock.
  useFocusTrap(containerRef, isOpen);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCheckoutOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, setCheckoutOpen]);

  // Scroll to top whenever the step changes.
  useEffect(() => {
    if (isOpen) {
      const el = containerRef.current;
      if (el) el.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [step, isOpen]);

  const totals = useMemo(() => {
    const promo = promoCode ? PROMOS[promoCode] : null;
    const discount =
      promo && promo.type === "percent" ? subtotal * promo.value : 0;
    const method =
      SHIPPING_METHODS.find((m) => m.id === shippingMethod) ?? SHIPPING_METHODS[0];
    let shipping = method.cost(subtotal);
    if (promo && promo.type === "shipping") shipping = 0;
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * TAX_RATE;
    const gift = giftWrap ? GIFT_WRAP_PRICE : 0;
    const total = Math.max(0, taxable + shipping + tax + gift);
    return { discount, shipping, tax, gift, total };
  }, [subtotal, promoCode, shippingMethod, giftWrap]);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (PROMOS[code]) {
      setPromoCode(code);
      setPromoError(null);
      setPromoInput("");
      toast({ title: "Promo applied", description: PROMOS[code].label });
    } else {
      setPromoError("That code isn't valid.");
    }
  };

  const removePromo = () => {
    setPromoCode(null);
    setPromoError(null);
  };

  const setInfoField = (key: keyof InfoForm, value: string) =>
    setInfo((prev) => ({ ...prev, [key]: value }));
  const setPaymentField = (key: keyof PaymentForm, value: string) =>
    setPayment((prev) => ({ ...prev, [key]: value }));

  const canContinue = () => {
    if (step === 0) {
      return Boolean(
        info.email &&
          info.firstName &&
          info.lastName &&
          info.address &&
          info.city &&
          info.state &&
          info.zip
      );
    }
    if (step === 1) return Boolean(shippingMethod);
    if (step === 2) {
      return Boolean(
        payment.cardName &&
          payment.cardNumber.length >= 12 &&
          payment.expiry &&
          payment.cvc.length >= 3
      );
    }
    return false;
  };

  const next = () => {
    if (step < 2) setStep((s) => s + 1);
    else void placeOrder();
  };
  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const placeOrder = async () => {
    setPlacing(true);
    await sleep(1300);
    const orderNumber = `AURA-${uid("ord").slice(-8).toUpperCase()}`;

    // Fire analytics: purchase (before clearing cart so we have the items)
    purchase({
      transaction_id: orderNumber,
      currency: "USD",
      value: totals.total,
      shipping: totals.shipping,
      tax: totals.tax,
      items: lines.map((l) => ({
        item_id: l.productId,
        item_name: l.name,
        price: l.price,
        quantity: l.quantity,
        item_variant: l.variantLabel,
      })),
    });

    setPlacedOrder(orderNumber);
    setPlacing(false);
    setStep(3);
    clearCart();
    toast({ title: "Order placed", description: `Confirmation ${orderNumber}` });
  };

  const finish = () => {
    setCheckoutOpen(false);
    setView("shop");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1100] bg-canvas overflow-y-auto scrollbar-thin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Checkout"
        >
          <div ref={containerRef} className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 glass-nav border-b border-hairline">
              <div className="container-aura flex items-center justify-between h-[64px]">
                <div className="flex items-center gap-3">
                  <span className="t-headline-sm c-ink">Aura Living</span>
                  <span className="t-caption c-ink-faint hidden sm:inline">
                    · Secure checkout
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  aria-label="Close checkout"
                  className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
                >
                  Close
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
            </header>

            {step < 3 ? (
              <div className="flex-1 container-aura py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
                  {/* Main column */}
                  <div>
                    <StepIndicator step={step} />

                    <div className="mt-8">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={step}
                          initial={
                            prefersReducedMotion
                              ? { opacity: 0 }
                              : { opacity: 0, x: 24 }
                          }
                          animate={{ opacity: 1, x: 0 }}
                          exit={
                            prefersReducedMotion
                              ? { opacity: 0 }
                              : { opacity: 0, x: -24 }
                          }
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {step === 0 && (
                            <InformationStep
                              info={info}
                              setField={setInfoField}
                            />
                          )}
                          {step === 1 && (
                            <ShippingStep
                              method={shippingMethod}
                              setMethod={setShippingMethod}
                              subtotal={subtotal}
                            />
                          )}
                          {step === 2 && (
                            <PaymentStep
                              payment={payment}
                              setField={setPaymentField}
                              billingSame={billingSame}
                              setBillingSame={setBillingSame}
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Nav buttons */}
                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-hairline">
                      <button
                        type="button"
                        onClick={back}
                        disabled={step === 0}
                        className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep disabled:opacity-30 disabled:pointer-events-none transition-colors link-underline"
                      >
                        <ChevronLeft size={14} strokeWidth={1.5} />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        disabled={!canContinue() || placing}
                        className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-8 h-12 rounded-sm hover:bg-gold-deep disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        {placing ? (
                          <>
                            <Loader2
                              size={14}
                              strokeWidth={1.75}
                              className="animate-spin"
                            />
                            Placing order
                          </>
                        ) : step === 2 ? (
                          <>
                            <Lock size={14} strokeWidth={1.5} />
                            Place Order · {formatPrice(totals.total)}
                          </>
                        ) : (
                          <>
                            Continue
                            <ChevronRight size={14} strokeWidth={1.5} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Summary sidebar */}
                  <aside>
                    <div className="lg:sticky lg:top-[88px] bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="t-headline-sm c-ink">Order Summary</h3>
                        <span className="t-caption c-ink-faint t-num">
                          {cartCount} {cartCount === 1 ? "item" : "items"}
                        </span>
                      </div>

                      {/* Line items */}
                      <div className="max-h-64 overflow-y-auto scrollbar-thin -mx-1 px-1 space-y-3 mb-5">
                        {lines.length === 0 ? (
                          <p className="t-body-sm c-ink-faint">
                            Your cart is empty.
                          </p>
                        ) : (
                          lines.map((l) => (
                            <div key={l.key} className="flex gap-3">
                              <div className="w-12 h-14 flex-shrink-0 bg-cream overflow-hidden">
                                <img
                                  src={l.image}
                                  alt={l.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="t-body-sm c-ink truncate">
                                  {l.name}
                                </p>
                                {l.variantLabel && (
                                  <p className="t-caption c-ink-faint">
                                    {l.variantLabel}
                                  </p>
                                )}
                                <p className="t-caption c-ink-faint t-num">
                                  Qty {l.quantity}
                                </p>
                              </div>
                              <span className="t-body-sm c-ink t-num">
                                {formatPrice(l.price * l.quantity)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Promo */}
                      <div className="border-t border-hairline pt-4 mb-4">
                        {promoCode ? (
                          <div className="flex items-center justify-between bg-gold-pale border border-hairline-gold rounded-sm px-3 py-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <Tag
                                size={14}
                                strokeWidth={1.5}
                                className="c-gold-deep shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="t-body-sm c-ink font-medium">
                                  {promoCode}
                                </p>
                                <p className="t-caption c-gold-deep truncate">
                                  {PROMOS[promoCode].label}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removePromo}
                              aria-label="Remove promo code"
                              className="c-ink-faint hover:c-gold-deep transition-colors p-1"
                            >
                              <X size={14} strokeWidth={1.75} />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <label
                              htmlFor="promo"
                              className="t-label-caps c-ink-faint block mb-2"
                            >
                              Promo code
                            </label>
                            <div className="flex gap-2">
                              <input
                                id="promo"
                                value={promoInput}
                                onChange={(e) => {
                                  setPromoInput(e.target.value);
                                  setPromoError(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    applyPromo();
                                  }
                                }}
                                placeholder="AURA10"
                                className="flex-1 min-w-0 bg-transparent border border-hairline px-3 py-2.5 t-body-sm c-ink placeholder:c-ink-faint focus:border-ink focus:outline-none transition-colors uppercase tracking-wider"
                              />
                              <button
                                type="button"
                                onClick={applyPromo}
                                className="px-4 t-label-caps border border-ink c-ink hover:bg-ink hover:c-paper transition-colors shrink-0"
                              >
                                Apply
                              </button>
                            </div>
                            {promoError && (
                              <p className="t-caption c-error mt-1.5" role="alert">
                                {promoError}
                              </p>
                            )}
                            <p className="t-caption c-ink-faint mt-1.5">
                              Try AURA10, WELCOME15, or FREESHIP.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Gift wrap toggle */}
                      <div className="border-t border-hairline pt-4 mb-4">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={giftWrap}
                          onClick={() => setGiftWrap(!giftWrap)}
                          className="w-full flex items-center gap-3 text-left"
                        >
                          <span
                            className={cn(
                              "flex-shrink-0 w-5 h-5 rounded-[2px] border flex items-center justify-center transition-all",
                              giftWrap
                                ? "bg-gold border-gold"
                                : "bg-paper border-hairline-strong"
                            )}
                          >
                            <AnimatePresence>
                              {giftWrap && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.6 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.6 }}
                                  transition={{ duration: 0.18 }}
                                >
                                  <Check
                                    size={13}
                                    strokeWidth={2.5}
                                    className="c-paper"
                                  />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                          <Gift
                            size={15}
                            strokeWidth={1.5}
                            className={cn(
                              giftWrap ? "c-gold-deep" : "c-ink",
                              "shrink-0"
                            )}
                          />
                          <span className="flex-1 min-w-0">
                            <span className="t-body-sm c-ink font-medium">
                              Gift wrap
                            </span>
                            <span className="t-caption c-ink-faint t-num">
                              {" "}
                              + ${GIFT_WRAP_PRICE}
                            </span>
                          </span>
                        </button>
                      </div>

                      {/* Order notes */}
                      <div className="border-t border-hairline pt-4 mb-4">
                        <AuraTextarea
                          id="notes"
                          label="Order notes (optional)"
                          rows={2}
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Delivery instructions, gift message…"
                          containerClassName="w-full"
                        />
                      </div>

                      {/* Totals */}
                      <div className="border-t border-hairline pt-4 space-y-2">
                        <SummaryRow
                          label="Subtotal"
                          value={formatPrice(subtotal)}
                        />
                        {totals.discount > 0 && (
                          <SummaryRow
                            label="Discount"
                            value={`− ${formatPrice(totals.discount)}`}
                            accent
                          />
                        )}
                        <SummaryRow
                          label="Shipping"
                          value={
                            totals.shipping === 0
                              ? "Free"
                              : formatPrice(totals.shipping)
                          }
                        />
                        {totals.gift > 0 && (
                          <SummaryRow
                            label="Gift wrap"
                            value={formatPrice(totals.gift)}
                          />
                        )}
                        <SummaryRow
                          label="Estimated tax"
                          value={formatPrice(totals.tax)}
                          muted
                        />
                        <div className="flex justify-between pt-3 border-t border-hairline t-headline-sm c-ink">
                          <span>Total</span>
                          <span className="t-num">
                            {formatPrice(totals.total)}
                          </span>
                        </div>
                      </div>

                      {/* Trust */}
                      <div className="flex items-center justify-center gap-2 mt-5 t-caption c-ink-faint">
                        <ShieldCheck size={13} strokeWidth={1.5} />
                        256-bit encrypted · 30-day returns
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            ) : (
              <ConfirmationScreen
                orderNumber={placedOrder ?? ""}
                email={info.email}
                total={totals.total}
                onFinish={finish}
                prefersReducedMotion={prefersReducedMotion}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ==========================================================================
   Sub-components
   ========================================================================== */

function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center t-caption border transition-all",
                  done && "bg-ink c-paper border-ink",
                  active && "bg-gold c-paper border-gold",
                  !done && !active && "bg-transparent c-ink-faint border-hairline"
                )}
              >
                {done ? (
                  <Check size={13} strokeWidth={2.5} />
                ) : (
                  <span className="t-num">{i + 1}</span>
                )}
              </span>
              <span
                className={cn(
                  "t-label-caps hidden sm:inline",
                  active ? "c-ink" : "c-ink-faint"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "h-px w-6 sm:w-12",
                  done ? "bg-ink" : "bg-hairline"
                )}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SectionTitle({
  step,
  title,
  caption,
}: {
  step: string;
  title: string;
  caption: string;
}) {
  return (
    <div className="mb-6">
      <p className="t-label-caps c-gold-deep mb-2">{step}</p>
      <h2 className="t-headline-md c-ink mb-1.5 leading-tight">{title}</h2>
      <p className="t-body-sm c-ink-muted">{caption}</p>
    </div>
  );
}

function InformationStep({
  info,
  setField,
}: {
  info: InfoForm;
  setField: (key: keyof InfoForm, value: string) => void;
}) {
  return (
    <section>
      <SectionTitle
        step="Step 1 of 3"
        title="Contact & shipping address"
        caption="Where should we send your order and updates?"
      />
      <div className="space-y-5">
        <AuraInput
          label="Email"
          type="email"
          required
          value={info.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="you@email.com"
          hint="We'll send your confirmation and tracking here."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AuraInput
            label="First name"
            required
            value={info.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            autoComplete="given-name"
          />
          <AuraInput
            label="Last name"
            required
            value={info.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            autoComplete="family-name"
          />
        </div>
        <AuraInput
          label="Address"
          required
          value={info.address}
          onChange={(e) => setField("address", e.target.value)}
          autoComplete="address-line1"
        />
        <AuraInput
          label="Apartment, suite (optional)"
          value={info.apartment}
          onChange={(e) => setField("apartment", e.target.value)}
          autoComplete="address-line2"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <AuraInput
            label="City"
            required
            value={info.city}
            onChange={(e) => setField("city", e.target.value)}
            containerClassName="col-span-2"
            autoComplete="address-level2"
          />
          <AuraInput
            label="State"
            required
            value={info.state}
            onChange={(e) => setField("state", e.target.value)}
            autoComplete="address-level1"
          />
          <AuraInput
            label="ZIP"
            required
            value={info.zip}
            onChange={(e) => setField("zip", e.target.value)}
            autoComplete="postal-code"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AuraInput
            label="Country"
            value={info.country}
            onChange={(e) => setField("country", e.target.value)}
            autoComplete="country-name"
          />
          <AuraInput
            label="Phone (optional)"
            type="tel"
            value={info.phone}
            onChange={(e) => setField("phone", e.target.value)}
            autoComplete="tel"
            hint="For delivery questions only."
          />
        </div>
      </div>
    </section>
  );
}

function ShippingStep({
  method,
  setMethod,
  subtotal,
}: {
  method: string;
  setMethod: (id: string) => void;
  subtotal: number;
}) {
  return (
    <section>
      <SectionTitle
        step="Step 2 of 3"
        title="Shipping method"
        caption="Choose how you'd like your pieces to arrive."
      />
      <div className="space-y-3">
        {SHIPPING_METHODS.map((m) => {
          const selected = method === m.id;
          const cost = m.cost(subtotal);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              aria-pressed={selected}
              className={cn(
                "w-full flex items-center gap-4 p-4 sm:p-5 border rounded-sm text-left transition-all",
                selected
                  ? "bg-gold-pale border-hairline-gold shadow-glow-gold"
                  : "bg-gradient-card-warm border-hairline-cream hover:border-hairline-gold"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  selected ? "border-gold" : "border-hairline-strong"
                )}
              >
                {selected && (
                  <span className="w-2.5 h-2.5 rounded-full bg-gold" />
                )}
              </span>
              <m.icon
                size={20}
                strokeWidth={1.25}
                className={cn(
                  "shrink-0",
                  selected ? "c-gold-deep" : "c-ink"
                )}
              />
              <span className="flex-1 min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="t-body c-ink font-medium">{m.label}</span>
                  <span className="t-caption c-ink-faint">{m.detail}</span>
                </span>
              </span>
              <span className="t-body c-ink t-num font-medium shrink-0">
                {cost === 0 ? "Free" : formatPrice(cost)}
              </span>
            </button>
          );
        })}
      </div>
      {subtotal < FREE_SHIP_THRESHOLD && (
        <p className="t-caption c-ink-muted mt-4 flex items-center gap-1.5">
          <Truck size={13} strokeWidth={1.5} className="c-gold-deep" />
          Add {formatPrice(FREE_SHIP_THRESHOLD - subtotal)} more to unlock free
          Standard shipping.
        </p>
      )}
    </section>
  );
}

function PaymentStep({
  payment,
  setField,
  billingSame,
  setBillingSame,
}: {
  payment: PaymentForm;
  setField: (key: keyof PaymentForm, value: string) => void;
  billingSame: boolean;
  setBillingSame: (v: boolean) => void;
}) {
  // Format helpers — group card digits and slash the expiry as the user types.
  const formatCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  return (
    <section>
      <SectionTitle
        step="Step 3 of 3"
        title="Payment"
        caption="All transactions are encrypted end-to-end."
      />

      {/* Express pay (disabled — coming soon) */}
      <div className="mb-6">
        <p className="t-label-caps c-ink-faint mb-2">Express checkout</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Apple Pay", icon: Smartphone },
            { label: "Google Pay", icon: Wallet },
            { label: "PayPal", icon: CreditCard },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              disabled
              aria-disabled="true"
              className="flex flex-col items-center justify-center gap-1.5 h-14 border border-hairline rounded-sm bg-cream/60 c-ink-faint cursor-not-allowed"
            >
              <opt.icon size={16} strokeWidth={1.5} />
              <span className="t-caption">{opt.label}</span>
            </button>
          ))}
        </div>
        <p className="t-caption c-ink-faint mt-1.5">Coming soon — card below for now.</p>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-hairline" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-canvas px-4 t-label-caps c-ink-faint">
            or pay by card
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <AuraInput
          label="Name on card"
          required
          value={payment.cardName}
          onChange={(e) => setField("cardName", e.target.value)}
          autoComplete="cc-name"
        />
        <AuraInput
          label="Card number"
          required
          inputMode="numeric"
          value={payment.cardNumber}
          onChange={(e) => setField("cardNumber", formatCard(e.target.value))}
          placeholder="0000 0000 0000 0000"
          autoComplete="cc-number"
        />
        <div className="grid grid-cols-2 gap-5">
          <AuraInput
            label="Expiry"
            required
            inputMode="numeric"
            value={payment.expiry}
            onChange={(e) => setField("expiry", formatExpiry(e.target.value))}
            placeholder="MM/YY"
            autoComplete="cc-exp"
          />
          <AuraInput
            label="CVC"
            required
            inputMode="numeric"
            value={payment.cvc}
            onChange={(e) =>
              setField("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="123"
            autoComplete="cc-csc"
          />
        </div>

        <button
          type="button"
          role="checkbox"
          aria-checked={billingSame}
          onClick={() => setBillingSame(!billingSame)}
          className="w-full flex items-center gap-3 text-left pt-2"
        >
          <span
            className={cn(
              "flex-shrink-0 w-5 h-5 rounded-[2px] border flex items-center justify-center transition-all",
              billingSame
                ? "bg-gold border-gold"
                : "bg-paper border-hairline-strong"
            )}
          >
            {billingSame && (
              <Check size={13} strokeWidth={2.5} className="c-paper" />
            )}
          </span>
          <span className="t-body-sm c-ink">
            Billing address matches shipping address
          </span>
        </button>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between t-body">
      <span className={cn(muted ? "c-ink-faint" : "c-ink-muted")}>{label}</span>
      <span
        className={cn(
          "t-num",
          accent && "c-gold-deep font-medium",
          muted && "c-ink-faint",
          !accent && !muted && "c-ink"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ConfirmationScreen({
  orderNumber,
  email,
  total,
  onFinish,
  prefersReducedMotion,
}: {
  orderNumber: string;
  email: string;
  total: number;
  onFinish: () => void;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 lg:py-24">
      <motion.div
        className="w-full max-w-xl bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-8 sm:p-10 text-center"
        initial={
          prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Checkmark */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.15,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="w-20 h-20 mx-auto rounded-full bg-gold-pale border border-hairline-gold flex items-center justify-center mb-6 shadow-glow-gold"
        >
          <motion.span
            initial={prefersReducedMotion ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <Check size={36} strokeWidth={2} className="c-gold-deep" />
          </motion.span>
        </motion.div>

        <p className="t-label-caps c-gold-deep mb-2">Order confirmed</p>
        <h2 className="t-display-md c-ink mb-3 leading-tight">Thank you.</h2>
        <p className="t-body c-ink-muted mb-6 max-w-md mx-auto leading-relaxed">
          Your order is in our makers' hands. A confirmation
          {email ? <> has been sent to <span className="c-ink">{email}</span></> : <> is on its way</>}.
        </p>

        {/* Order details card */}
        <div className="bg-paper border border-hairline rounded-sm p-5 mb-6 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="t-label-caps c-ink-faint">Order number</span>
            <span className="t-body c-ink t-num font-medium">{orderNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="t-label-caps c-ink-faint">Total paid</span>
            <span className="t-body c-ink t-num font-medium">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 t-caption c-ink-faint mb-6">
          <Truck size={13} strokeWidth={1.5} className="c-gold-deep" />
          You'll receive tracking within 1–2 business days.
        </div>

        <button
          type="button"
          onClick={onFinish}
          className="inline-flex items-center justify-center gap-2 bg-ink c-paper t-label-caps px-8 h-12 rounded-sm hover:bg-gold-deep transition-colors"
        >
          <ShoppingBag size={14} strokeWidth={1.5} />
          Continue Shopping
        </button>
      </motion.div>
    </div>
  );
}

export default CheckoutFlow;
