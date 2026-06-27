"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  Mail,
  FileText,
  Percent,
  Truck,
  Headphones,
  Repeat,
  Clock,
  Sparkles,
} from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { AuraInput, AuraTextarea } from "@/components/aura/ui/AuraInput";
import { cn } from "@/lib/utils";

/**
 * TradeView — trade program landing with six benefit cards and a
 * three-step application form (Business → Contact → References).
 * Includes a progress indicator and a success state on submission.
 */

interface Benefit {
  icon: typeof Percent;
  title: string;
  body: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: Percent,
    title: "Tiered trade pricing",
    body: "15% off catalogue for active projects, 20% for repeat orders, and 25% for designers hitting annual thresholds. No minimum order.",
  },
  {
    icon: Truck,
    title: "Free freight, threshold-free",
    body: "Complimentary white-glove freight on every trade order — no minimum. Includes inside delivery, unpack, and debris removal.",
  },
  {
    icon: Headphones,
    title: "A dedicated concierge",
    body: "Your own trade concierge — Anna, by name — answers every order, every question, every CAD request within one business day.",
  },
  {
    icon: Repeat,
    title: "Sample loan program",
    body: "Borrow up to six samples per project at no cost. We ship them, you live with them, you return them in the included prepaid box.",
  },
  {
    icon: Clock,
    title: "Lead-time guarantees",
    body: "Every order ships within the published lead time or you receive 10% off. We've never missed a lead time on a trade order.",
  },
  {
    icon: Sparkles,
    title: "Exclusive pre-launch access",
    body: "Trade members see new pieces two weeks before they appear in the public catalogue — so you can specify them first.",
  },
];

const STEP_LABELS = ["Business", "Contact", "References"] as const;

interface TradeFormState {
  // Step 1 — Business
  businessName: string;
  businessType: string;
  website: string;
  yearsInBusiness: string;
  // Step 2 — Contact
  contactName: string;
  email: string;
  phone: string;
  role: string;
  // Step 3 — References
  reference1: string;
  reference2: string;
  projectDescription: string;
}

const INITIAL_STATE: TradeFormState = {
  businessName: "",
  businessType: "",
  website: "",
  yearsInBusiness: "",
  contactName: "",
  email: "",
  phone: "",
  role: "",
  reference1: "",
  reference2: "",
  projectDescription: "",
};

export function TradeView() {
  const setView = useUIStore((s) => s.setView);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<TradeFormState>(INITIAL_STATE);

  const update = (key: keyof TradeFormState, value: string) =>
    setForm((cur) => ({ ...cur, [key]: value }));

  const canAdvance = () => {
    if (step === 0) {
      return Boolean(form.businessName && form.businessType && form.yearsInBusiness);
    }
    if (step === 1) {
      return Boolean(form.contactName && form.email && form.phone);
    }
    return Boolean(form.reference1 && form.projectDescription);
  };

  const handleNext = () => {
    if (!canAdvance()) return;
    if (step < 2) setStep((s) => (s + 1) as 0 | 1 | 2);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => (s - 1) as 0 | 1 | 2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdvance()) return;
    // Simulate a successful submit — no backend in this phase.
    setSubmitted(true);
  };

  return (
    <div className="bg-gradient-to-b from-canvas to-cream/20 pt-[72px] md:pt-[88px] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full bg-gold-pale opacity-60 blur-3xl"
          aria-hidden
        />
        <div className="container-aura relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            Trade Program
          </p>
          <TextBlurReveal
            as="h1"
            className="t-display-lg c-ink leading-[1.05] max-w-3xl mb-6"
          >
            For designers who specify slowly.
          </TextBlurReveal>
          <TextBlurReveal
            as="p"
            delay={0.2}
            className="t-body-lg c-ink-muted max-w-xl"
          >
            Tiered pricing, dedicated concierge, freight included. We work
            with interior designers, stylists, and architects who put their
            name on the rooms they finish.
          </TextBlurReveal>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="pb-16 md:pb-24">
        <div className="container-aura">
          <RevealOnScroll
            stagger={0.08}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-6 md:p-8"
              >
                <div className="flex items-start justify-between mb-5">
                  <benefit.icon size={26} strokeWidth={1.25} className="c-gold-deep" />
                  <span className="t-caption c-ink-faint t-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="t-headline-sm c-ink mb-3">{benefit.title}</h3>
                <p className="t-body-sm c-ink-muted leading-relaxed">
                  {benefit.body}
                </p>
              </motion.div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* Application form */}
      <section className="pb-20 md:pb-32" id="apply">
        <div className="container-aura">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-6 md:p-10 lg:p-12">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <SuccessState
                    key="success"
                    contactName={form.contactName}
                    onContinue={() => setView("shop")}
                  />
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Header */}
                    <div className="mb-8 md:mb-10">
                      <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
                        <span className="w-6 h-px bg-gold" aria-hidden />
                        Apply
                      </p>
                      <h2 className="t-display-md c-ink leading-tight mb-2">
                        Trade application
                      </h2>
                      <p className="t-body c-ink-muted">
                        Three steps, about five minutes. We respond within two
                        business days.
                      </p>
                    </div>

                    {/* Progress indicator */}
                    <ProgressIndicator currentStep={step} />

                    {/* Form steps */}
                    <form onSubmit={handleSubmit} className="mt-8 md:mt-10">
                      <AnimatePresence mode="wait">
                        {step === 0 && (
                          <StepBusiness
                            key="step-0"
                            form={form}
                            update={update}
                          />
                        )}
                        {step === 1 && (
                          <StepContact
                            key="step-1"
                            form={form}
                            update={update}
                          />
                        )}
                        {step === 2 && (
                          <StepReferences
                            key="step-2"
                            form={form}
                            update={update}
                          />
                        )}
                      </AnimatePresence>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-hairline-cream">
                        <button
                          type="button"
                          onClick={handleBack}
                          disabled={step === 0}
                          className={cn(
                            "inline-flex items-center gap-2 t-label-caps transition-colors",
                            step === 0
                              ? "c-ink-faint cursor-not-allowed"
                              : "c-ink hover:c-gold-deep link-underline"
                          )}
                        >
                          <ArrowLeft size={14} strokeWidth={1.5} />
                          Back
                        </button>

                        <div className="flex items-center gap-3">
                          <span className="hidden sm:inline t-caption c-ink-faint t-num">
                            Step {step + 1} of {STEP_LABELS.length}
                          </span>
                          {step < 2 ? (
                            <button
                              type="button"
                              onClick={handleNext}
                              disabled={!canAdvance()}
                              className={cn(
                                "group inline-flex items-center gap-2 t-label-caps px-6 py-3 rounded-sm transition-colors",
                                canAdvance()
                                  ? "bg-ink c-paper hover:bg-gold-deep"
                                  : "bg-ink/30 c-paper/60 cursor-not-allowed"
                              )}
                            >
                              Continue
                              <ArrowRight
                                size={14}
                                strokeWidth={1.5}
                                className="transition-transform group-hover:translate-x-1"
                              />
                            </button>
                          ) : (
                            <button
                              type="submit"
                              disabled={!canAdvance()}
                              className={cn(
                                "group inline-flex items-center gap-2 t-label-caps px-6 py-3 rounded-sm transition-colors",
                                canAdvance()
                                  ? "bg-gold-deep c-paper hover:bg-ink"
                                  : "bg-gold-deep/40 c-paper/60 cursor-not-allowed"
                              )}
                            >
                              Submit application
                              <Check size={14} strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress indicator                                                         */
/* -------------------------------------------------------------------------- */

function ProgressIndicator({ currentStep }: { currentStep: 0 | 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 md:gap-4">
      {STEP_LABELS.map((label, i) => {
        const isComplete = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={label} className="flex-1 flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div
                className={cn(
                  "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0",
                  isComplete && "bg-gold-deep border-gold-deep c-paper",
                  isActive && "bg-ink border-ink c-paper",
                  !isComplete && !isActive && "bg-transparent border-hairline c-ink-faint"
                )}
              >
                {isComplete ? (
                  <Check size={14} strokeWidth={2} />
                ) : (
                  <span className="t-caption t-num">{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "t-label-caps hidden sm:inline truncate",
                  isActive ? "c-ink" : "c-ink-faint"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="flex-1 h-px bg-hairline relative overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ scaleX: i < currentStep ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 bg-gold-deep origin-left"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step components                                                            */
/* -------------------------------------------------------------------------- */

type StepProps = {
  form: TradeFormState;
  update: (key: keyof TradeFormState, value: string) => void;
};

function StepBusiness({ form, update }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Building2 size={16} strokeWidth={1.5} className="c-gold-deep" />
        <p className="t-label-caps c-ink">Your business</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AuraInput
          label="Business name"
          required
          value={form.businessName}
          onChange={(e) => update("businessName", e.target.value)}
          placeholder="Studio Voss Interiors"
        />
        <AuraInput
          label="Business type"
          required
          value={form.businessType}
          onChange={(e) => update("businessType", e.target.value)}
          placeholder="Interior design studio"
          hint="Designer, stylist, architect, retailer…"
        />
        <AuraInput
          label="Website"
          type="url"
          value={form.website}
          onChange={(e) => update("website", e.target.value)}
          placeholder="https://"
        />
        <AuraInput
          label="Years in business"
          required
          type="number"
          min={0}
          value={form.yearsInBusiness}
          onChange={(e) => update("yearsInBusiness", e.target.value)}
          placeholder="5"
        />
      </div>
    </motion.div>
  );
}

function StepContact({ form, update }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Mail size={16} strokeWidth={1.5} className="c-gold-deep" />
        <p className="t-label-caps c-ink">Primary contact</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AuraInput
          label="Full name"
          required
          value={form.contactName}
          onChange={(e) => update("contactName", e.target.value)}
          placeholder="Anna Voss"
        />
        <AuraInput
          label="Role"
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
          placeholder="Principal designer"
        />
        <AuraInput
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="anna@studiovoss.com"
        />
        <AuraInput
          label="Phone"
          type="tel"
          required
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+1 (503) 555-0142"
        />
      </div>
    </motion.div>
  );
}

function StepReferences({ form, update }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <FileText size={16} strokeWidth={1.5} className="c-gold-deep" />
        <p className="t-label-caps c-ink">References & projects</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AuraInput
          label="Reference 1"
          required
          value={form.reference1}
          onChange={(e) => update("reference1", e.target.value)}
          placeholder="Showroom, vendor, or client contact"
          hint="Name and email of a trade reference."
        />
        <AuraInput
          label="Reference 2"
          value={form.reference2}
          onChange={(e) => update("reference2", e.target.value)}
          placeholder="Showroom, vendor, or client contact"
        />
      </div>
      <AuraTextarea
        label="Tell us about a recent project"
        required
        rows={5}
        value={form.projectDescription}
        onChange={(e) => update("projectDescription", e.target.value)}
        placeholder="One paragraph — what you made, who you made it for, and how Aura pieces might have fit."
      />
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Success state                                                              */
/* -------------------------------------------------------------------------- */

function SuccessState({
  contactName,
  onContinue,
}: {
  contactName: string;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-8 md:py-12"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gold-deep c-paper mx-auto mb-6 flex items-center justify-center"
      >
        <Check size={28} strokeWidth={2} />
      </motion.div>
      <p className="t-label-caps c-gold-deep mb-3 flex items-center justify-center gap-2">
        <span className="w-6 h-px bg-gold" aria-hidden />
        Application received
        <span className="w-6 h-px bg-gold" aria-hidden />
      </p>
      <TextBlurReveal
        as="h2"
        className="t-display-md c-ink leading-tight mb-4"
      >
        Thank you{contactName ? `, ${contactName.split(" ")[0]}` : ""}.
      </TextBlurReveal>
      <p className="t-body-lg c-ink-muted max-w-md mx-auto mb-8 leading-relaxed">
        Anna will review your application and write back within two business
        days. In the meantime, you're welcome to browse the catalogue.
      </p>
      <button
        onClick={onContinue}
        className="group inline-flex items-center gap-3 bg-ink c-paper t-label-caps px-8 py-4 hover:bg-gold-deep transition-colors rounded-sm"
      >
        Browse the shop
        <ArrowRight
          size={14}
          strokeWidth={1.5}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </motion.div>
  );
}

export default TradeView;
