"use client";

import type { RefObject } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2 } from "lucide-react";

import AuraButton from "@/components/aura/ui/Button";

/**
 * Delete address confirmation dialog.
 *
 * Phase 5A: Extracted from AccountAddresses.tsx (was inline at lines 687-772).
 * Accessible alertdialog with focus trap (managed by parent via ref).
 */

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  label?: string;
  isDefault?: boolean;
}

export interface DeleteAddressDialogProps {
  target: Address | null;
  dialogRef: RefObject<HTMLDivElement | null>;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAddressDialog({ target, dialogRef, onCancel, onConfirm }: DeleteAddressDialogProps) {
  return (
    <AnimatePresence>
      {target && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onCancel}
            className="fixed inset-0 z-modal overlay-dark"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-addr-title"
            aria-describedby="delete-addr-desc"
            className="fixed inset-0 z-modal-elevated flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              ref={dialogRef}
              className="pointer-events-auto w-full max-w-md bg-gradient-card-warm border border-hairline-cream shadow-modal rounded-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-error/10 to-cream px-6 py-5 border-b border-hairline-cream flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center ring-1 ring-error/20 shrink-0">
                  <AlertTriangle size={18} strokeWidth={1.5} className="c-error" />
                </div>
                <div className="min-w-0">
                  <p className="t-label-caps c-error">Confirm deletion</p>
                  <h3 id="delete-addr-title" className="t-headline-sm c-ink truncate">
                    Remove {target.label || "address"}?
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <p id="delete-addr-desc" className="t-body c-ink-muted mb-6">
                  This will permanently remove{" "}
                  <span className="c-ink font-medium">
                    {target.firstName} {target.lastName}
                  </span>
                  &apos;s{" "}
                  <span className="c-ink font-medium">
                    {target.label || "address"}
                  </span>{" "}
                  from your address book.
                  {target.isDefault
                    ? " Your next remaining address will become the default."
                    : ""}
                </p>
                <div className="flex items-center justify-end gap-3">
                  <AuraButton type="button" variant="ghost" onClick={onCancel}>
                    Keep address
                  </AuraButton>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-sm t-label-caps bg-error c-paper hover:bg-ink transition-all duration-300 active:scale-[0.98]"
                  >
                    <Trash2 size={14} strokeWidth={1.75} />
                    Delete address
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DeleteAddressDialog;
