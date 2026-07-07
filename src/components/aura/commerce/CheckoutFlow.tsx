"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Check,
  ChevronLeft,
  Truck,
  Tag,
  ShieldCheck,
  Loader2,
  ShoppingBag,
  Wallet,
  Package,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { useUIStore } from "@/store/use-ui-store";
import { useRouter } from "next/navigation";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { beginCheckout, purchase } from "@/lib/analytics/ecommerce";
import { AuraInput } from "@/components/aura/ui/AuraInput";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";

const STEPS = ["Information", "Shipping", "Payment"] as const;

interface ShippingMethodData {
  id: string;
  code: string;
  name: string;
  description: string;
  baseCost: number;
  freeThreshold: number | null;
  estimatedDays: string;
}

interface PromoData {
  code: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  label: string;
  minOrder: number;
}

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

/**
 * CheckoutFlow — COD-only checkout.
 *
 * Three steps: Information → Shipping → Payment (COD).
 * Shipping methods and promo codes are fetched from real APIs.
 * No card form — Cash on Delivery only.
 */
export function CheckoutFlow() {
  const prefersReducedMotion = useReducedMotion();
  const isOpen = useUIStore((s) => s.checkoutOpen);
  const setCheckoutOpen = useUIStore((s) => s.setCheckoutOpen);
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const cartCount = useCartStore((s) => s.count());
  const clearCart = useCartStore((s) => s.clear);
  const { toast } = useToast();
  const settings = useSettings();

  const containerRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const [info, setInfo] = useState<InfoForm>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "Punjab",
    zip: "",
    country: "Pakistan",
    phone: "",
  });
  const [shippingMethod, setShippingMethod] = useState("");
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodData[]>([]);

  const [promoInput, setPromoInput] = useState("");
  const [promoData, setPromoData] = useState<PromoData | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [orderNotes] = useState("");

  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setStep(0);
      setPlacedOrder(null);
      setPlacing(false);
      setPromoData(null);
      setPromoError(null);
      setPromoInput("");
      beginCheckout({
        currency: "PKR",
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

  // Fetch real shipping methods on mount
  useEffect(() => {
    fetch("/api/content/shipping-methods")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const methods = Array.isArray(data) ? data : [];
        setShippingMethods(methods);
        if (methods.length > 0 && !shippingMethod) {
          setShippingMethod(methods[0].code);
        }
      })
      .catch(() => setShippingMethods([]));
  }, [shippingMethod]);

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

  useEffect(() => {
    if (isOpen) {
      const el = containerRef.current;
      if (el) el.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [step, isOpen]);

  const totals = useMemo(() => {
    let discount = 0;
    let shipping = 0;

    const method = shippingMethods.find((m) => m.code === shippingMethod);
    if (method) {
      shipping = method.baseCost;
      if (method.freeThreshold && subtotal >= method.freeThreshold) {
        shipping = 0;
      }
    }

    if (promoData) {
      if (promoData.type === "percent") {
        discount = (subtotal * promoData.value) / 100;
      } else if (promoData.type === "fixed") {
        discount = promoData.value;
      } else if (promoData.type === "shipping") {
        shipping = 0;
      }
    }

    // Bug #14 fix: use tax rate from store settings so client matches server.
    // Server computes: tax = Math.round(subtotal * taxRate / 100)
    const taxRate = Number(settings.taxRate ?? "0");
    const tax = Math.round(subtotal * (taxRate / 100));
    const total = Math.max(0, subtotal - discount + shipping + tax);
    return { discount, shipping, tax, total };
  }, [subtotal, promoData, shippingMethod, shippingMethods, settings.taxRate]);

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await fetch(`/api/content/promo-codes/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error ?? "Invalid promo code");
        setPromoData(null);
        return;
      }
      if (data.minOrder && subtotal < data.minOrder) {
        setPromoError(`Minimum order of ${formatPrice(data.minOrder)} required`);
        setPromoData(null);
        return;
      }
      setPromoData(data);
      setPromoInput("");
      toast({ title: "Promo applied", description: data.label });
    } catch {
      setPromoError("Failed to validate promo code");
      setPromoData(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromoData(null);
    setPromoError(null);
  };

  const setInfoField = (key: keyof InfoForm, value: string) =>
    setInfo((prev) => ({ ...prev, [key]: value }));

  const canContinue = () => {
    if (step === 0) {
      return Boolean(
        info.email &&
          info.firstName &&
          info.lastName &&
          info.address &&
          info.city &&
          info.state &&
          info.zip &&
          info.phone
      );
    }
    if (step === 1) return Boolean(shippingMethod);
    if (step === 2) return true; // COD — no card fields
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
    if (lines.length === 0) {
      toast({ title: "Cart is empty", description: "Add items before checking out" });
      return;
    }
    setPlacing(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            slug: l.slug,
            name: l.name,
            image: l.image,
            price: l.price,
            variantLabel: l.variantLabel,
            quantity: l.quantity,
          })),
          shippingAddress: {
            firstName: info.firstName,
            lastName: info.lastName,
            street: info.address,
            city: info.city,
            state: info.state,
            zip: info.zip,
            country: info.country,
            phone: info.phone,
          },
          shippingMethod,
          promoCode: promoData?.code,
          orderNotes,
          email: info.email,
          paymentMethod: "cod",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPlacing(false);
        toast({ title: "Order failed", description: data.error ?? "Please try again" });
        return;
      }

      purchase({
        transaction_id: data.orderNumber,
        currency: "PKR",
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

      setPlacedOrder(data.orderNumber);
      setPlacing(false);
      setStep(3);
      clearCart();
      toast({ title: "Order placed", description: `Confirmation ${data.orderNumber}` });
    } catch {
      setPlacing(false);
      toast({ title: "Order failed", description: "Network error. Please try again." });
    }
  };

  const finish = () => {
    setCheckoutOpen(false);
    router.push("/shop");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1100] bg-canvas overflow-y-auto scrollbar-thin safe-area-top safe-area-bottom"
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
                  <span className="t-caption c-ink-faint hidden sm:inline">· Secure checkout</span>
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
                          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {step === 0 && <InformationStep info={info} setField={setInfoField} />}
                          {step === 1 && (
                            <ShippingStep
                              method={shippingMethod}
                              setMethod={setShippingMethod}
                              methods={shippingMethods}
                              subtotal={subtotal}
                            />
                          )}
                          {step === 2 && <PaymentStep />}
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
                            <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
                            Placing order
                          </>
                        ) : step === 2 ? (
                          <>
                            <ShieldCheck size={14} strokeWidth={1.5} />
                            Place Order · {formatPrice(totals.total)}
                          </>
                        ) : (
                          <>
                            Continue
                            <ChevronLeft size={14} strokeWidth={1.5} className="rotate-180" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Order summary sidebar — Phase 5A: Extracted to <CheckoutOrderSummary /> */}
                  <CheckoutOrderSummary
                    lines={lines}
                    cartCount={cartCount}
                    subtotal={subtotal}
                    totals={totals}
                    promoData={promoData}
                    promoInput={promoInput}
                    promoError={promoError}
                    promoLoading={promoLoading}
                    onPromoInputChange={setPromoInput}
                    onApplyPromo={applyPromo}
                    onRemovePromo={removePromo}
                  />
                </div>
              </div>
            ) : (
              /* Confirmation step */
              <ConfirmationStep orderNumber={placedOrder} onFinish={finish} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Step indicator ─────────────────────────────────────────────────── */

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center t-caption font-medium transition-colors",
                i < step ? "bg-success c-paper" : i === step ? "bg-ink c-paper" : "bg-cream-deep c-ink-faint"
              )}
            >
              {i < step ? <Check size={13} strokeWidth={2.5} /> : i + 1}
            </span>
            <span className={cn("t-label-caps hidden sm:inline", i === step ? "c-ink" : "c-ink-faint")}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <span className={cn("w-8 h-px", i < step ? "bg-success" : "bg-hairline")} />}
        </div>
      ))}
    </div>
  );
}

/* ── Section title ──────────────────────────────────────────────────── */

function SectionTitle({ step, title, caption }: { step: string; title: string; caption: string }) {
  return (
    <div className="mb-6">
      <p className="t-label-caps c-gold-deep mb-1">{step}</p>
      <h2 className="t-headline-md c-ink mb-1">{title}</h2>
      <p className="t-body-sm c-ink-muted">{caption}</p>
    </div>
  );
}

/* ── Step 1: Information ────────────────────────────────────────────── */

function InformationStep({ info, setField }: { info: InfoForm; setField: (key: keyof InfoForm, value: string) => void }) {
  return (
    <section>
      <SectionTitle step="Step 1 of 3" title="Information" caption="Where should we send your order?" />
      <div className="space-y-5">
        <AuraInput
          label="Email address"
          required
          type="email"
          value={info.email}
          onChange={(e) => setField("email", e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <div className="grid grid-cols-2 gap-4">
          <AuraInput label="First name" required value={info.firstName} onChange={(e) => setField("firstName", e.target.value)} autoComplete="given-name" />
          <AuraInput label="Last name" required value={info.lastName} onChange={(e) => setField("lastName", e.target.value)} autoComplete="family-name" />
        </div>
        <AuraInput label="Address" required value={info.address} onChange={(e) => setField("address", e.target.value)} autoComplete="street-address" placeholder="House #, Street, Area" />
        <AuraInput label="Apartment, suite, etc. (optional)" value={info.apartment} onChange={(e) => setField("apartment", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <AuraInput label="City" required value={info.city} onChange={(e) => setField("city", e.target.value)} autoComplete="address-level2" placeholder="Lahore" />
          <AuraInput label="Province" required value={info.state} onChange={(e) => setField("state", e.target.value)} autoComplete="address-level1" placeholder="Punjab" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AuraInput label="Postal code" required value={info.zip} onChange={(e) => setField("zip", e.target.value)} autoComplete="postal-code" placeholder="54000" />
          <AuraInput label="Phone" required value={info.phone} onChange={(e) => setField("phone", e.target.value)} autoComplete="tel" placeholder="+92 300 0000000" />
        </div>
        <div>
          <AuraInput label="Country" value={info.country} onChange={(e) => setField("country", e.target.value)} autoComplete="country-name" />
        </div>
      </div>
    </section>
  );
}

/* ── Step 2: Shipping ───────────────────────────────────────────────── */

function ShippingStep({
  method,
  setMethod,
  methods,
  subtotal,
}: {
  method: string;
  setMethod: (m: string) => void;
  methods: ShippingMethodData[];
  subtotal: number;
}) {
  if (methods.length === 0) {
    return (
      <section>
        <SectionTitle step="Step 2 of 3" title="Shipping" caption="Choose your delivery speed." />
        <div className="bg-cream/40 border border-hairline-cream rounded-sm p-8 text-center">
          <Truck size={32} strokeWidth={1} className="c-ink-faint mx-auto mb-3" />
          <p className="t-body c-ink-muted">No shipping methods available. Please contact support.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionTitle step="Step 2 of 3" title="Shipping" caption="Choose your delivery speed." />
      <div className="space-y-3">
        {methods.map((m) => {
          const isSelected = method === m.code;
          const isFree = m.freeThreshold && subtotal >= m.freeThreshold;
          const cost = isFree ? 0 : m.baseCost;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.code)}
              className={cn(
                "w-full flex items-center gap-4 p-4 border rounded-sm text-left transition-all",
                isSelected ? "border-gold bg-gold-pale/30 shadow-gold-glow" : "border-hairline-cream hover:border-gold/50 bg-paper"
              )}
            >
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0", isSelected ? "border-gold" : "border-hairline-strong")}>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-gold" />}
              </div>
              <div className="relative w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0">
                <Truck size={18} className="c-gold-deep" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="t-body c-ink font-medium">{m.name}</p>
                <p className="t-caption c-ink-faint">
                  {m.estimatedDays}
                  {m.description && ` · ${m.description}`}
                  {m.freeThreshold && !isFree && ` · Free over ${formatPrice(m.freeThreshold)}`}
                </p>
              </div>
              <p className={cn("t-body t-num font-medium flex-shrink-0", isFree ? "c-success" : "c-ink")}>
                {isFree ? "Free" : formatPrice(cost)}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ── Step 3: Payment (COD only) ──────────────────────────────────────── */

function PaymentStep() {
  return (
    <section>
      <SectionTitle step="Step 3 of 3" title="Payment" caption="Pay when your order arrives." />

      <div className="bg-gold-pale/30 border border-hairline-gold rounded-sm p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="relative w-12 h-12 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold">
            <Wallet size={22} className="c-gold-deep" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="t-headline-sm c-ink">Cash on Delivery</p>
              <span className="chip bg-success/10 c-success t-label-caps">Active</span>
            </div>
            <p className="t-body-sm c-ink-muted">
              Pay in cash when your order is delivered to your door. No online payment required.
              Our courier will collect the exact amount — please have change ready.
            </p>
          </div>
          <div className="w-5 h-5 rounded-full border-2 border-gold flex items-center justify-center flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-gold" />
          </div>
        </div>
      </div>

      <div className="bg-cream/40 border border-hairline-cream rounded-sm p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="c-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="t-body-sm c-ink font-medium mb-1">Secure & hassle-free</p>
            <p className="t-caption c-ink-muted">
              You&apos;ll receive an order confirmation by email. Inspect your items before paying.
              Returns accepted within 14 days.
            </p>
          </div>
        </div>
      </div>

      <p className="t-caption c-ink-faint mt-4 text-center">
        Online payment methods (JazzCash, EasyPaisa, Bank Transfer) coming soon.
      </p>
    </section>
  );
}

/* ── Confirmation ───────────────────────────────────────────────────── */

function ConfirmationStep({ orderNumber, onFinish }: { orderNumber: string | null; onFinish: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center container-aura py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 ring-1 ring-success/30"
        >
          <Check size={36} strokeWidth={2} className="c-success" />
        </motion.div>

        <p className="t-label-caps c-gold-deep mb-3">Order Confirmed</p>
        <h1 className="t-display-md c-ink mb-3">Thank you.</h1>
        <p className="t-body-lg c-ink-muted mb-6">
          Your order has been placed successfully. We&apos;ll send a confirmation email shortly.
        </p>

        {orderNumber && (
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5 mb-8">
            <p className="t-label-caps c-ink-faint mb-1">Order Number</p>
            <p className="t-headline-md c-ink t-num">{orderNumber}</p>
          </div>
        )}

        <div className="bg-cream/40 border border-hairline-cream rounded-sm p-4 mb-8">
          <p className="t-body-sm c-ink">
            <span className="c-ink-faint">Payment: </span>
            Cash on Delivery
          </p>
          <p className="t-body-sm c-ink mt-1">
            <span className="c-ink-faint">Delivery: </span>
            Please have the exact amount ready for our courier.
          </p>
        </div>

        <button
          onClick={onFinish}
          className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-8 py-3.5 rounded-sm hover:bg-gold-deep transition-colors"
        >
          Continue Shopping
        </button>
      </motion.div>
    </div>
  );
}

export default CheckoutFlow;
