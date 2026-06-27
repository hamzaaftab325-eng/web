"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Chip — pill-shaped tag for filters, categories, and small metadata.
 *
 * cva-driven with four variants. When `asButton` is true, the chip renders as
 * a real <button> with `aria-pressed` reflecting the `pressed` state. The
 * pressed state visually forces the `active` variant for clear feedback.
 */
export const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 t-body-sm border transition-all duration-300 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-cream c-ink border-hairline hover:border-hairline-gold hover:shadow-card-modern hover:-translate-y-0.5",
        active: "bg-ink c-paper border-ink shadow-premium",
        outline:
          "bg-transparent c-ink border-hairline-strong hover:border-gold",
        gold: "bg-gold/10 c-gold-deep border-hairline-gold hover:bg-gold/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ChipBaseProps
  extends VariantProps<typeof chipVariants> {
  asButton?: boolean;
  pressed?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface ChipSpanProps extends ChipBaseProps {
  asButton?: false;
  pressed?: boolean;
  onClick?: never;
  type?: never;
  disabled?: never;
  "aria-label"?: string;
}

export interface ChipButtonProps extends ChipBaseProps {
  asButton: true;
  pressed?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
}

export type ChipProps = ChipSpanProps | ChipButtonProps;

export function Chip(props: ChipProps) {
  const {
    className,
    variant,
    asButton = false,
    pressed = false,
    children,
  } = props;

  // When pressed is true we visually force the `active` appearance.
  const resolvedVariant = pressed ? "active" : variant;
  const classes = cn(chipVariants({ variant: resolvedVariant }), className);

  if (asButton) {
    const {
      type = "button",
      disabled = false,
      onClick,
      "aria-label": ariaLabel,
    } = props as ChipButtonProps;
    return (
      <button
        type={type}
        aria-pressed={pressed}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={onClick}
        className={classes}
        data-slot="aura-chip"
      >
        {children}
      </button>
    );
  }

  const { "aria-label": ariaLabel } = props as ChipSpanProps;
  return (
    <span
      aria-pressed={pressed || undefined}
      aria-label={ariaLabel}
      className={classes}
      data-slot="aura-chip"
    >
      {children}
    </span>
  );
}

export default Chip;
