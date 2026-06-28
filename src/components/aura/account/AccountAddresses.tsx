"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Star,
  Phone,
  Mail,
  Gift,
  Sparkles,
} from "lucide-react";
import { AccountLayout } from "./AccountLayout";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import AuraButton from "@/components/aura/ui/Button";
import { AuraInput } from "@/components/aura/ui/AuraInput";
import { useToast } from "@/hooks/use-toast";

/**
 * AccountAddresses — full CRUD for shipping addresses.
 *
 * Local state holds the address book (seeded with one mock entry). Adding and
 * editing share a single focus-trapped modal; deletion is gated behind a
 * compact confirmation dialog. While the initial list hydrates we show shimmer
 * placeholders, and an empty state renders a gold-pale icon circle.
 */

interface Address {
  id: string;
  userId: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const initialAddresses: Address[] = [
  {
    id: "a1",
    userId: "u1",
    label: "Home",
    firstName: "Anna",
    lastName: "Reeves",
    street: "123 NW Hoyt St",
    apartment: "Apt 4B",
    city: "Portland",
    state: "OR",
    zip: "97209",
    country: "United States",
    phone: "+1 (503) 555-0142",
    isDefault: true,
  },
];

type AddressForm = Omit<Address, "id" | "userId">;

const emptyForm: AddressForm = {
  label: "",
  firstName: "",
  lastName: "",
  street: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  phone: "",
  isDefault: false,
};

const requiredFields: (keyof AddressForm)[] = [
  "firstName",
  "lastName",
  "street",
  "city",
  "state",
  "zip",
  "country",
  "phone",
];

export function AccountAddresses() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, modalOpen);
  useFocusTrap(deleteRef, !!deleteTarget);

  // Simulate a brief hydrating load so the shimmer state is visible.
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    const { id: _id, userId: _userId, ...rest } = addr;
    setForm(rest);
    setEditingId(addr.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // Close on Escape — modals and dialogs.
  useEffect(() => {
    if (!modalOpen && !deleteTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (deleteTarget) setDeleteTarget(null);
      else if (modalOpen) closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, deleteTarget]);

  const setField = <K extends keyof AddressForm>(key: K, value: AddressForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const saveAddress = () => {
    const missing = requiredFields.filter((k) => !String(form[k] ?? "").trim());
    if (missing.length > 0) {
      toast({
        title: "Missing fields",
        description: "Please complete all required fields before saving.",
      });
      return;
    }

    if (editingId) {
      setAddresses((list) => {
        let next = list.map((a) =>
          a.id === editingId ? { ...a, ...form } : a
        );
        if (form.isDefault) {
          next = next.map((a) => ({ ...a, isDefault: a.id === editingId }));
        }
        return next;
      });
      toast({
        title: "Address updated",
        description: `${form.label || "Address"} has been saved.`,
      });
    } else {
      const newAddr: Address = {
        id: `a${Date.now()}`,
        userId: user?.id ?? "u1",
        ...form,
      };
      setAddresses((list) => {
        let next = [...list, newAddr];
        if (form.isDefault) {
          next = next.map((a) => ({ ...a, isDefault: a.id === newAddr.id }));
        }
        return next;
      });
      toast({
        title: "Address added",
        description: `${form.label || "New address"} is now on file.`,
      });
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const wasDefault = deleteTarget.isDefault;
    const label = deleteTarget.label || "Address";
    setAddresses((list) => {
      const next = list.filter((a) => a.id !== deleteTarget.id);
      if (wasDefault && next.length > 0) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
    toast({ title: "Address removed", description: `${label} was deleted.` });
    setDeleteTarget(null);
  };

  const makeDefault = (id: string) => {
    setAddresses((list) => list.map((a) => ({ ...a, isDefault: a.id === id })));
    toast({
      title: "Default updated",
      description: "Your default shipping address has changed.",
    });
  };

  return (
    <AccountLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div className="relative">
          <div
            className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none"
            aria-hidden
          />
          <div className="relative">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              Shipping &amp; Billing
            </p>
            <TextBlurReveal
              as="h1"
              className="t-display-md c-ink leading-tight"
            >
              Saved Addresses
            </TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg mt-3">
              Keep your delivery details current. Aura Living uses the default
              address at checkout unless you choose otherwise.
            </p>
          </div>
        </div>
        <AuraButton onClick={openAdd} className="shrink-0">
          <Plus size={14} strokeWidth={1.5} />
          Add Address
        </AuraButton>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-56 shimmer border border-hairline-cream rounded-sm"
            />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyAddresses onAdd={openAdd} />
      ) : (
        <RevealOnScroll stagger={0.07} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <motion.article
              key={addr.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-5 md:p-6 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-deep border border-hairline-cream t-label-caps c-ink truncate">
                    <MapPin size={12} strokeWidth={1.5} className="c-gold-deep" />
                    {addr.label || "Address"}
                  </span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-pale border border-hairline-gold t-label-caps c-gold-deep">
                      <Star
                        size={11}
                        strokeWidth={1.75}
                        className="fill-gold c-gold"
                      />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(addr)}
                    aria-label={`Edit ${addr.label || "address"}`}
                    className="p-2 c-ink-faint hover:c-gold-deep hover:bg-gold-pale transition-colors rounded-sm"
                  >
                    <Pencil size={15} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(addr)}
                    aria-label={`Delete ${addr.label || "address"}`}
                    className="p-2 c-ink-faint hover:c-error hover:bg-error/5 transition-colors rounded-sm"
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="t-body-sm c-ink leading-relaxed flex-1">
                <p className="c-ink font-medium t-body">
                  {addr.firstName} {addr.lastName}
                </p>
                <p className="c-ink-muted">{addr.street}</p>
                {addr.apartment && (
                  <p className="c-ink-muted">{addr.apartment}</p>
                )}
                <p className="c-ink-muted">
                  {addr.city}, {addr.state} {addr.zip}
                </p>
                <p className="c-ink-muted">{addr.country}</p>
                <p className="c-ink-muted mt-2 flex items-center gap-1.5">
                  <Phone
                    size={12}
                    strokeWidth={1.5}
                    className="c-gold-deep"
                  />
                  <span className="t-num">{addr.phone}</span>
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-hairline-cream">
                {addr.isDefault ? (
                  <p className="t-label-caps c-gold-deep flex items-center gap-1.5">
                    <Check size={12} strokeWidth={2} />
                    Default shipping address
                  </p>
                ) : (
                  <button
                    onClick={() => makeDefault(addr.id)}
                    className="t-label-caps c-ink-faint hover:c-gold-deep transition-colors link-underline"
                  >
                    Set as default
                  </button>
                )}
              </div>
            </motion.article>
          ))}
        </RevealOnScroll>
      )}

      {/* Tips strip */}
      {!isLoading && addresses.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: Gift,
              title: "Gift shipping",
              body: "Mark a gift address to skip the receipt in the box.",
            },
            {
              icon: Mail,
              title: "Billing match",
              body: "Billing defaults to your shipping address unless split.",
            },
            {
              icon: Sparkles,
              title: "White glove",
              body: "Large items ship to the default address by default.",
            },
          ].map((tip) => (
            <div
              key={tip.title}
              className="bg-cream/60 border border-hairline-cream rounded-sm p-4 flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-gold-pale flex items-center justify-center ring-1 ring-hairline-gold shrink-0">
                <tip.icon
                  size={15}
                  strokeWidth={1.5}
                  className="c-gold-deep"
                />
              </div>
              <div className="min-w-0">
                <p className="t-label-caps c-ink mb-1">{tip.title}</p>
                <p className="t-caption c-ink-muted">{tip.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeModal}
              className="fixed inset-0 z-modal overlay-dark"
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="address-modal-title"
              className="fixed inset-0 z-modal-elevated flex items-end md:items-center justify-center p-0 md:p-6 pointer-events-none"
            >
              <div
                ref={modalRef}
                className="pointer-events-auto w-full md:max-w-2xl max-h-[92vh] overflow-y-auto scrollbar-thin bg-gradient-card-warm border border-hairline-cream shadow-modal rounded-sm flex flex-col"
              >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-gold-pale to-cream px-6 py-5 border-b border-hairline-cream flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center ring-1 ring-hairline-gold shrink-0">
                      <MapPin
                        size={17}
                        strokeWidth={1.5}
                        className="c-gold-deep"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="t-label-caps c-gold-deep">
                        {editingId ? "Edit address" : "Add address"}
                      </p>
                      <h2
                        id="address-modal-title"
                        className="t-headline-sm c-ink truncate"
                      >
                        {editingId ? "Update details" : "New shipping address"}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    aria-label="Close dialog"
                    className="p-2 c-ink-faint hover:c-gold-deep hover:bg-paper transition-colors rounded-sm shrink-0"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveAddress();
                  }}
                  className="p-6 flex flex-col gap-5"
                >
                  <AuraInput
                    label="Label"
                    placeholder="Home, Studio, Office…"
                    value={form.label}
                    onChange={(e) => setField("label", e.target.value)}
                    hint="A short nickname so you can pick this address quickly."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AuraInput
                      label="First name"
                      required
                      value={form.firstName}
                      onChange={(e) => setField("firstName", e.target.value)}
                    />
                    <AuraInput
                      label="Last name"
                      required
                      value={form.lastName}
                      onChange={(e) => setField("lastName", e.target.value)}
                    />
                  </div>

                  <AuraInput
                    label="Street address"
                    required
                    value={form.street}
                    onChange={(e) => setField("street", e.target.value)}
                  />

                  <AuraInput
                    label="Apartment, suite (optional)"
                    value={form.apartment ?? ""}
                    onChange={(e) => setField("apartment", e.target.value)}
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <AuraInput
                      label="City"
                      required
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                    />
                    <AuraInput
                      label="State"
                      required
                      value={form.state}
                      onChange={(e) => setField("state", e.target.value)}
                    />
                    <AuraInput
                      label="ZIP"
                      required
                      value={form.zip}
                      onChange={(e) => setField("zip", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AuraInput
                      label="Country"
                      required
                      value={form.country}
                      onChange={(e) => setField("country", e.target.value)}
                    />
                    <AuraInput
                      label="Phone"
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      hint="For delivery updates only."
                    />
                  </div>

                  <label className="flex items-start gap-3 p-4 bg-cream/60 border border-hairline-cream rounded-sm cursor-pointer hover:border-hairline-gold transition-colors">
                    <span className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={form.isDefault}
                        onChange={(e) => setField("isDefault", e.target.checked)}
                        className="peer sr-only"
                      />
                      <span
                        className="w-5 h-5 rounded-sm border border-hairline-strong bg-paper flex items-center justify-center transition-colors peer-checked:bg-gold peer-checked:border-gold"
                        aria-hidden
                      >
                        <Check
                          size={13}
                          strokeWidth={2.5}
                          className="c-paper opacity-0 peer-checked:opacity-100 transition-opacity"
                        />
                      </span>
                    </span>
                    <span className="flex-1">
                      <span className="t-body c-ink font-medium block">
                        Set as default shipping address
                      </span>
                      <span className="t-caption c-ink-muted block mt-0.5">
                        Aura Living pre-selects this address at checkout.
                      </span>
                    </span>
                  </label>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-hairline-cream">
                    <AuraButton
                      type="button"
                      variant="ghost"
                      onClick={closeModal}
                    >
                      Cancel
                    </AuraButton>
                    <AuraButton type="submit" variant="primary">
                      <Check size={14} strokeWidth={1.75} />
                      {editingId ? "Save changes" : "Save address"}
                    </AuraButton>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDeleteTarget(null)}
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
                ref={deleteRef}
                className="pointer-events-auto w-full max-w-md bg-gradient-card-warm border border-hairline-cream shadow-modal rounded-sm overflow-hidden"
              >
                <div className="bg-gradient-to-r from-error/10 to-cream px-6 py-5 border-b border-hairline-cream flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center ring-1 ring-error/20 shrink-0">
                    <AlertTriangle
                      size={18}
                      strokeWidth={1.5}
                      className="c-error"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="t-label-caps c-error">Confirm deletion</p>
                    <h3
                      id="delete-addr-title"
                      className="t-headline-sm c-ink truncate"
                    >
                      Remove {deleteTarget.label || "address"}?
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p
                    id="delete-addr-desc"
                    className="t-body c-ink-muted mb-6"
                  >
                    This will permanently remove{" "}
                    <span className="c-ink font-medium">
                      {deleteTarget.firstName} {deleteTarget.lastName}
                    </span>
                    &apos;s{" "}
                    <span className="c-ink font-medium">
                      {deleteTarget.label || "address"}
                    </span>{" "}
                    from your address book.
                    {deleteTarget.isDefault
                      ? " Your next remaining address will become the default."
                      : ""}
                  </p>
                  <div className="flex items-center justify-end gap-3">
                    <AuraButton
                      type="button"
                      variant="ghost"
                      onClick={() => setDeleteTarget(null)}
                    >
                      Keep address
                    </AuraButton>
                    <button
                      type="button"
                      onClick={confirmDelete}
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

      {/* Footer hint */}
      <p className="t-caption c-ink-faint mt-10 text-center md:text-left">
        Need a freight or trade address?{" "}
        <button
          onClick={() => router.push("/account")}
          className="c-gold-deep hover:c-ink transition-colors link-underline"
        >
          Contact concierge
        </button>
        .
      </p>
    </AccountLayout>
  );
}

/** Empty-state component — gold-pale icon circle with a call to action. */
function EmptyAddresses({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-10 md:p-16 text-center">
      <div className="w-20 h-20 rounded-full bg-gold-pale flex items-center justify-center ring-1 ring-hairline-gold mx-auto mb-6 shadow-gold-glow">
        <MapPin size={28} strokeWidth={1.25} className="c-gold-deep" />
      </div>
      <h3 className="t-headline-sm c-ink mb-2">No addresses saved yet</h3>
      <p className="t-body c-ink-muted max-w-md mx-auto mb-6">
        Add a shipping address to speed up checkout. You can keep several on
        file for home, studio, or gifting.
      </p>
      <AuraButton onClick={onAdd}>
        <Plus size={14} strokeWidth={1.5} />
        Add your first address
      </AuraButton>
    </div>
  );
}

export default AccountAddresses;
