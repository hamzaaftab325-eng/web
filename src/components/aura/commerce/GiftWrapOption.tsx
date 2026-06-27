"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Gift, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface GiftWrapOptionProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  giftNote: string;
  onNoteChange: (note: string) => void;
  className?: string;
}

const GIFT_WRAP_PRICE = 8;
const MAX_NOTE_LENGTH = 200;

export function GiftWrapOption({
  checked,
  onToggle,
  giftNote,
  onNoteChange,
  className,
}: GiftWrapOptionProps) {
  const prefersReducedMotion = useReducedMotion();
  const remaining = MAX_NOTE_LENGTH - giftNote.length;
  const overLimit = remaining < 0;

  return (
    <div
      className={cn(
        "border rounded-sm p-4 transition-colors",
        checked
          ? "bg-gold-pale border-hairline-gold"
          : "bg-gradient-card-warm border-hairline-cream",
        className
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onToggle(!checked)}
        className="w-full flex items-center gap-4 text-left"
      >
        <span
          className={cn(
            "flex-shrink-0 w-5 h-5 rounded-[2px] border flex items-center justify-center transition-all",
            checked
              ? "bg-gold border-gold"
              : "bg-paper border-hairline-strong"
          )}
        >
          <AnimatePresence>
            {checked && (
              <motion.span
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                <Check size={13} strokeWidth={2.5} className="c-paper" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="flex-1">
          <span className="flex items-center gap-2">
            <Gift
              size={15}
              strokeWidth={1.5}
              className={cn(checked ? "c-gold-deep" : "c-ink")}
            />
            <span className="t-body c-ink font-medium">Add gift wrap</span>
            <span className="t-body-sm c-ink-faint t-num">
              + ${GIFT_WRAP_PRICE}
            </span>
          </span>
          <span className="block t-caption c-ink-muted mt-0.5">
            Recycled kraft wrap, hand-tied linen ribbon, and a printed note card.
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {checked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-hairline-gold">
              <label
                htmlFor="gift-note"
                className="block t-label-caps c-ink-faint mb-2"
              >
                Gift note (optional)
              </label>
              <textarea
                id="gift-note"
                rows={3}
                value={giftNote}
                onChange={(e) =>
                  onNoteChange(e.target.value.slice(0, MAX_NOTE_LENGTH))
                }
                placeholder="A line for the recipient — a birthday, an anniversary, a thank you."
                className={cn(
                  "w-full px-3 py-2.5 bg-paper border rounded-sm t-body c-ink placeholder:c-ink-faint focus:outline-none transition-colors resize-y",
                  overLimit ? "border-error focus:border-error" : "border-hairline focus:border-gold"
                )}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="t-caption c-ink-faint">
                  We'll handwrite this on a 6×4 card.
                </p>
                <p
                  className={cn(
                    "t-caption t-num",
                    overLimit ? "c-error" : "c-ink-faint"
                  )}
                >
                  {giftNote.length}/{MAX_NOTE_LENGTH}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GiftWrapOption;
