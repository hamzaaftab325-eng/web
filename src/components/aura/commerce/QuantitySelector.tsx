"use client";

import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  size = "md",
  className,
}: QuantitySelectorProps) {
  const dims =
    size === "sm"
      ? { btn: "h-8 w-8", text: "t-body-sm min-w-[28px]" }
      : size === "lg"
      ? { btn: "h-12 w-12", text: "t-body min-w-[48px]" }
      : { btn: "h-10 w-10", text: "t-body min-w-[36px]" };

  return (
    <div
      className={cn(
        "inline-flex items-center border border-hairline rounded-[2px] bg-paper",
        className
      )}
    >
      <button
        onClick={onDecrement}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className={cn(
          dims.btn,
          "flex items-center justify-center c-ink hover:c-gold transition-colors disabled:opacity-30 disabled:hover:c-ink"
        )}
      >
        <Minus size={14} strokeWidth={1.5} />
      </button>
      <motion.span
        key={quantity}
        initial={{ scale: 0.85, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className={cn(dims.text, "text-center c-ink t-num font-medium")}
      >
        {quantity}
      </motion.span>
      <button
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={cn(
          dims.btn,
          "flex items-center justify-center c-ink hover:c-gold transition-colors"
        )}
      >
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

export default QuantitySelector;
