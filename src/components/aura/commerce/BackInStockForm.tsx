"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Check, Loader2 } from "lucide-react";
import { cn, sleep } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BackInStockFormProps {
  productName?: string;
  className?: string;
}

export function BackInStockForm({ productName, className }: BackInStockFormProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({
        title: "Please enter a valid email",
        description: "We'll only use it to alert you when this piece returns.",
      });
      return;
    }
    setStatus("loading");
    await sleep(700);
    setStatus("success");
    toast({
      title: "You're on the list",
      description: productName
        ? `We'll email you when the ${productName} is back in stock.`
        : "We'll email you when this piece is back in stock.",
    });
  };

  return (
    <div className={cn(className)}>
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-gold-pale border border-hairline-gold rounded-sm p-5 flex items-center gap-4"
          >
            <span className="flex-shrink-0 w-11 h-11 rounded-full bg-paper flex items-center justify-center shadow-gold-glow">
              <Check size={20} strokeWidth={2} className="c-gold-deep" />
            </span>
            <div className="flex-1">
              <p className="t-headline-sm c-ink">You're on the list</p>
              <p className="t-body-sm c-ink-muted mt-0.5">
                We'll email <span className="c-ink font-medium">{email}</span> the moment this
                piece returns.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={onSubmit}
            className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-5"
          >
            <p className="t-label-caps c-gold-deep mb-1">Currently sold out</p>
            <p className="t-body-sm c-ink-muted mb-4">
              Enter your email and we'll let you know as soon as it's back.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail size={16} strokeWidth={1.5} className="c-ink-faint" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="w-full h-11 pl-10 pr-4 bg-paper border border-hairline rounded-sm t-body c-ink placeholder:c-ink-faint focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className={cn(
                  "inline-flex items-center justify-center gap-2 h-11 px-5 t-label-caps transition-colors whitespace-nowrap",
                  status === "loading"
                    ? "bg-cream c-ink-faint cursor-wait"
                    : "bg-ink c-paper hover:bg-gold-deep"
                )}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
                    Subscribing
                  </>
                ) : (
                  "Notify Me"
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BackInStockForm;
