"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * AuraInput — labelled text input with built-in error and hint slots.
 *
 * The label uses the design system's `t-label-caps` micro-caption treatment,
 * and the field surface is transparent so the form panel's gradient shows
 * through. An error state swaps the hairline border for the error token and
 * renders an accessible message below the field.
 */
export interface AuraInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  inputClassName?: string;
}

export const AuraInput = React.forwardRef<HTMLInputElement, AuraInputProps>(
  function AuraInput(
    {
      id,
      label,
      error,
      hint,
      className,
      containerClassName,
      inputClassName,
      required,
      disabled,
      ...props
    },
    ref
  ) {
    const autoId = React.useId();
    const fieldId = id ?? autoId;
    const describedById = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={fieldId}
            className="t-label-caps c-ink-faint block mb-2"
          >
            {label}
            {required && (
              <span className="c-gold-deep ml-1" aria-hidden>
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedById}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full bg-transparent border border-hairline px-4 py-3 t-body c-ink",
            "placeholder:c-ink-faint focus:border-ink focus:outline-none transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-error focus:border-error",
            inputClassName,
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${fieldId}-error`} className="t-caption c-error mt-1.5" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${fieldId}-hint`} className="t-caption c-ink-faint mt-1.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

/**
 * AuraTextarea — multi-line companion to AuraInput with the same surface
 * treatment. Defaults to four rows and disables manual resize.
 */
export interface AuraTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  textareaClassName?: string;
}

export const AuraTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AuraTextareaProps
>(function AuraTextarea(
  {
    id,
    label,
    error,
    hint,
    className,
    containerClassName,
    textareaClassName,
    required,
    disabled,
    rows = 4,
    ...props
  },
  ref
) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const describedById = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={fieldId}
          className="t-label-caps c-ink-faint block mb-2"
        >
          {label}
          {required && (
            <span className="c-gold-deep ml-1" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedById}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        required={required}
        className={cn(
          "w-full bg-transparent border border-hairline px-4 py-3 t-body c-ink resize-none",
          "placeholder:c-ink-faint focus:border-ink focus:outline-none transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-error focus:border-error",
          textareaClassName,
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${fieldId}-error`} className="t-caption c-error mt-1.5" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${fieldId}-hint`} className="t-caption c-ink-faint mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
});

export default AuraInput;
