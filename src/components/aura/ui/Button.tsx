"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

/**
 * Button — Aura Living design system.
 *
 * cva-driven button with five variants and three sizes. All variants share
 * the same transition timings and focus ring. Premium hover shadows are
 * applied per-variant so the visual weight matches the surface.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-sans t-label-caps shrink-0 outline-none transition-all duration-300 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-ink c-paper hover:bg-gold-deep hover:shadow-premium-hover",
        gold: "bg-gold c-paper hover:bg-ink hover:shadow-premium-hover",
        outline:
          "border border-ink c-ink hover:bg-ink hover:c-paper hover:shadow-premium",
        ghost: "c-ink hover:c-gold-deep link-underline",
        light: "bg-paper c-ink hover:bg-gold hover:shadow-premium-hover",
      },
      size: {
        sm: "h-8 px-4 text-[0.65rem]",
        md: "h-10 px-6",
        lg: "h-12 px-8",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, fullWidth, asChild = false, type, ...props },
    ref
  ) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-slot="aura-button"
        type={asChild ? undefined : (type ?? "button")}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      />
    );
  }
);

export default Button;
