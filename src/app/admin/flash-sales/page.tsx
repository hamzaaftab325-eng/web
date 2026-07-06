"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Zap,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Pencil,
  X,
  Save,
  Users,
  RotateCcw,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

/* ─── Types ─── */
interface Sale {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  discountPercent: number | null;
  promoCode: string | null;
  maxUses: number | null;
  usesCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type SaleStatus = "scheduled" | "live" | "expired" | "exhausted" | "draft";

function getSaleStatus(sale: Sale): SaleStatus {
  const now = new Date();
  const start = new Date(sale.startDate);
  const end = new Date(sale.endDate);
  if (sale.maxUses && sale.usesCount >= sale.maxUses) return "exhausted";
  if (!sale.isActive) return "draft";
  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return "live";
}

const statusConfig: Record<SaleStatus, { label: string; color: string; bg: string; border: string; icon: typeof Zap }> = {
  live:       { label: "Live Now",    color: "c-success",    bg: "bg-success/10",    border: "border-success/30",    icon: Zap },
  scheduled:  { label: "Scheduled",   color: "c-sky-500",    bg: "bg-sky-500/10",    border: "border-sky-500/30",    icon: Clock },
  expired:    { label: "Expired",     color: "c-ink-faint",  bg: "bg-cream-deep/60", border: "border-hairline-cream", icon: XCircle },
  exhausted:  { label: "Limit Hit",   color: "c-error",      bg: "bg-error/10",      border: "border-error/30",      icon: AlertTriangle },
  draft:      { label: "Inactive",    color: "c-ink-muted",  bg: "bg-cream-deep/60", border: "border-hairline-cream", icon: XCircle },
};

/* ─── Helpers ─── */
function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

/* ─── Toggle Component ─── */
function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="t-body-sm c-ink font-medium">{label}</p>
        <p className="t-caption c-ink-faint mt-0.5">
          {checked
            ? "Visible on storefront during the date range"
            : "Hidden from storefront regardless of dates"}
        </p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-[52px] flex-shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
          checked
            ? "bg-success shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
            : "bg-ink/20",
          disabled && "opacity-40 cursor-not-allowed"
        )}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300",
            checked ? "translate-x-[27px]" : "translate-x-[3px]",
            checked && "shadow-success/30"
          )}
        />
      </button>
    </div>
  );
}

/* ─── Input classes ─── */
const inputCls =
  "w-full px-4 py-3 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-ink-faint/40";
const labelCls = "t-label-caps c-ink-faint block mb-2 tracking-wider text-[11px]";

/* ─── Form defaults ─── */
const emptyForm = {
  name: "",
  description: "",
  discountPercent: "15",
  promoCode: "",
  startDate: "",
  endDate: "",
  isActive: true,
  maxUses: "",
};

export default function AdminFlashSales() {
  const [items, setItems] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Form state
  const [mode, setMode] = useState<"idle" | "create" | "edit">("idle");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ─── Fetch ─── */
  const fetchSales = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/flash-sales");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setItems(data.flashSales ?? []);
    } catch {
      setGlobalError("Failed to load flash sales. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  /* ─── Create / Update ─── */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!form.startDate || !form.endDate) throw new Error("Start and end dates are required");
      if (new Date(form.endDate) <= new Date(form.startDate)) throw new Error("End date must be after start date");

      const maxUsesVal = form.maxUses.trim() ? parseInt(form.maxUses, 10) : null;
      if (maxUsesVal !== null && (isNaN(maxUsesVal) || maxUsesVal < 1)) throw new Error("Max uses must be at least 1 or left empty for unlimited");

      const body: Record<string, unknown> = {
        name: form.name,
        description: form.description || undefined,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : undefined,
        promoCode: form.promoCode.trim() || undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        isActive: form.isActive,
        maxUses: maxUsesVal,
      };

      if (mode === "edit" && editId) {
        const res = await fetch(`/api/admin/flash-sales/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Update failed");
        }
        showToast("Flash sale updated");
      } else {
        const res = await fetch("/api/admin/flash-sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Create failed");
        }
        showToast("Flash sale created");
      }

      setMode("idle");
      setForm(emptyForm);
      setEditId(null);
      await fetchSales();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Toggle active/inactive ─── */
  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/flash-sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Toggle failed");
      }
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !current } : i)));
      showToast(!current ? "Sale activated" : "Sale deactivated");
    } catch (e) {
      setGlobalError(e instanceof Error ? e.message : "Failed to toggle sale status.");
    }
  };

  /* ─── Reset usage ─── */
  const resetUsage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/flash-sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetUsesCount: true }),
      });
      if (!res.ok) throw new Error();
      await fetchSales();
      showToast("Usage count reset and sale re-activated");
    } catch {
      setGlobalError("Failed to reset usage count.");
    }
  };

  /* ─── Delete ─── */
  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/flash-sales/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== id));
      setDeleteConfirmId(null);
      showToast("Sale deleted");
    } catch {
      setGlobalError("Failed to delete. Please try again.");
    }
  };

  /* ─── Edit ─── */
  const startEdit = (sale: Sale) => {
    setMode("edit");
    setEditId(sale.id);
    setForm({
      name: sale.name,
      description: sale.description ?? "",
      discountPercent: sale.discountPercent ? String(sale.discountPercent) : "",
      promoCode: sale.promoCode ?? "",
      startDate: toLocalDatetimeValue(sale.startDate),
      endDate: toLocalDatetimeValue(sale.endDate),
      isActive: sale.isActive,
      maxUses: sale.maxUses ? String(sale.maxUses) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => {
    setMode("idle");
    setForm(emptyForm);
    setEditId(null);
    setError(null);
  };

  const isFormOpen = mode === "create" || mode === "edit";

  return (
    <div className="relative">
      {/* ─── Toast ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={cn(
              "fixed top-6 left-1/2 z-[100] px-6 py-3 rounded-sm shadow-lg t-body-sm font-medium flex items-center gap-2",
              toast.type === "success" ? "bg-success text-white" : "bg-error text-white"
            )}
          >
            {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Page Header ─── */}
      <div className="mb-10">
        <div className="relative">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-gradient-to-br from-gold-pale/60 via-gold/10 to-transparent rounded-full blur-3xl pointer-events-none" aria-hidden />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-deep flex items-center justify-center shadow-gold-glow">
                  <Zap size={18} className="c-paper" strokeWidth={2} />
                </div>
                <div>
                  <p className="t-label-caps c-gold-deep text-[10px] tracking-[0.15em]">Marketing</p>
                </div>
              </div>
              <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">
                Flash Sales
              </TextBlurReveal>
              <p className="t-body c-ink-muted max-w-lg leading-relaxed">
                Time-limited events with optional customer limits. Only <strong className="c-ink">active</strong> sales within their date range appear on the storefront.
              </p>
            </div>
            <button
              onClick={() => {
                if (isFormOpen) cancelForm();
                else { setMode("create"); setForm({ ...emptyForm, isActive: true }); }
              }}
              className={cn(
                "group inline-flex items-center gap-2.5 t-label-caps px-7 py-3.5 rounded-sm transition-all duration-300 flex-shrink-0 shadow-sm",
                isFormOpen
                  ? "bg-paper c-ink border border-hairline-cream hover:bg-cream/60"
                  : "bg-ink c-paper hover:bg-gold-deep hover:shadow-gold-glow"
              )}
            >
              {isFormOpen ? (
                <><X size={15} strokeWidth={2} /> Cancel</>
              ) : (
                <><Plus size={15} strokeWidth={2} /> New Sale</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Global Error ─── */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-error/8 border border-error/20 c-error p-4 rounded-sm mb-6 t-body-sm flex items-center gap-3"
          >
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span className="flex-1">{globalError}</span>
            <button onClick={() => setGlobalError(null)} className="hover:opacity-60 transition-opacity">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Create / Edit Form ─── */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-paper border border-hairline-cream rounded-lg p-6 md:p-8 shadow-sm">
              {/* Form header */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-hairline-cream/60">
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center",
                  mode === "edit" ? "bg-gold-pale" : "bg-ink/5"
                )}>
                  {mode === "edit" ? <Pencil size={14} className="c-gold-deep" /> : <Plus size={14} className="c-ink-muted" />}
                </div>
                <div>
                  <h2 className="t-headline-sm c-ink">
                    {mode === "edit" ? "Edit Flash Sale" : "Create New Flash Sale"}
                  </h2>
                  <p className="t-caption c-ink-faint">
                    {mode === "edit" ? "Changes are live immediately after saving." : "The sale will be active by default."}
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-error/8 border border-error/20 c-error p-3.5 rounded-sm mb-5 t-body-sm flex items-center gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Row 1: Name */}
                <div>
                  <label className={labelCls}>Sale Name *</label>
                  <input
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                    placeholder="e.g. Summer Luxe Flash Sale — 25% Off"
                  />
                  <div className="flex justify-end mt-1.5">
                    <span className="t-caption c-ink-faint text-[10px]">{form.name.length}/120</span>
                  </div>
                </div>

                {/* Row 2: Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    maxLength={600}
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className={cn(inputCls, "resize-none")}
                    placeholder="Describe the sale — appears on the storefront banner."
                  />
                  <div className="flex justify-end mt-1.5">
                    <span className="t-caption c-ink-faint text-[10px]">{form.description.length}/600</span>
                  </div>
                </div>

                {/* Row 3: Discount + Promo Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Discount %</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={form.discountPercent}
                        onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                        className={cn(inputCls, "pr-10")}
                        placeholder="25"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 t-body c-ink-faint">%</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Promo Code</label>
                    <input
                      value={form.promoCode}
                      onChange={(e) => setForm((f) => ({ ...f, promoCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") }))}
                      className={cn(inputCls, "t-num tracking-[0.15em] uppercase")}
                      placeholder="e.g. FLASH25"
                    />
                    <p className="t-caption c-ink-faint mt-1.5 text-[10px]">Letters, numbers, hyphens only</p>
                  </div>
                </div>

                {/* Row 4: Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Start Date *</label>
                    <input
                      required
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                      className={inputCls}
                    />
                    {form.startDate && new Date(form.startDate) > new Date() && (
                      <p className="t-caption c-sky-500 mt-1.5 flex items-center gap-1.5 text-[11px]">
                        <Clock size={11} /> Sale will start in the future
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>End Date *</label>
                    <input
                      required
                      type="datetime-local"
                      value={form.endDate}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Row 5: Max Uses + Toggle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Customer Limit</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={form.maxUses}
                        onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                        className={cn(inputCls, "pr-20")}
                        placeholder="Unlimited"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 t-caption c-ink-faint">customers</span>
                    </div>
                    <p className="t-caption c-ink-faint mt-1.5 text-[10px]">Leave empty for unlimited use</p>
                  </div>

                  <div className="flex flex-col justify-center">
                    <Toggle
                      checked={form.isActive}
                      onChange={(val) => setForm((f) => ({ ...f, isActive: val }))}
                      label="Active"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-3 border-t border-hairline-cream/40">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2.5 bg-ink c-paper t-label-caps px-7 py-3 rounded-sm hover:bg-gold-deep transition-all duration-300 disabled:opacity-40 shadow-sm"
                  >
                    <Save size={14} strokeWidth={2} />
                    {saving
                      ? mode === "edit" ? "Saving..." : "Creating..."
                      : mode === "edit" ? "Save Changes" : "Create Flash Sale"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="t-body c-ink-muted hover:c-ink px-5 py-3 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Sale List ─── */}
      {loading ? (
        <div className="bg-paper border border-hairline-cream rounded-lg p-16 text-center">
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-paper border border-hairline-cream rounded-lg p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-ink/5 flex items-center justify-center mx-auto mb-5">
            <Zap size={28} strokeWidth={1.2} className="c-ink-faint" />
          </div>
          <p className="t-headline-sm c-ink mb-2">No flash sales yet</p>
          <p className="t-body c-ink-muted max-w-sm mx-auto leading-relaxed">
            Create a time-limited sale to boost revenue and drive urgency among your customers.
          </p>
        </div>
      ) : (
        <RevealOnScroll stagger={0.05} className="space-y-4">
          {items.map((item) => {
            const status = getSaleStatus(item);
            const cfg = statusConfig[status];
            const StatusIcon = cfg.icon;
            const usagePercent = item.maxUses ? Math.round((item.usesCount / item.maxUses) * 100) : 0;
            const isExhausted = status === "exhausted";

            return (
              <motion.div
                key={item.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className={cn(
                  "bg-paper border rounded-lg p-5 md:p-6 transition-all duration-300",
                  status === "live"
                    ? "border-success/30 shadow-[0_0_0_1px_rgba(34,197,94,0.08)]"
                    : "border-hairline-cream hover:border-hairline-gold/50",
                  isExhausted && "opacity-70"
                )}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title + badges */}
                    <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                      <h3
                        className={cn(
                          "t-headline-sm c-ink",
                          status === "draft" && "opacity-50",
                          status === "expired" && "line-through opacity-60"
                        )}
                      >
                        {item.name}
                      </h3>

                      {/* Status chip */}
                      <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] t-label-caps tracking-wider font-medium", cfg.bg, cfg.border, cfg.color)}>
                        <StatusIcon size={10} strokeWidth={2} />
                        {cfg.label}
                      </span>

                      {/* Discount chip */}
                      {item.discountPercent != null && item.discountPercent > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold-deep text-[10px] t-label-caps t-num font-semibold tracking-wider">
                          {Number(item.discountPercent)}% OFF
                        </span>
                      )}

                      {/* Promo code chip */}
                      {item.promoCode && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ink/5 border border-hairline-cream text-ink-muted text-[10px] t-num tracking-[0.12em] font-medium">
                          {item.promoCode}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="t-body-sm c-ink-muted mb-3 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}

                    {/* Date + usage row */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <p className="t-caption c-ink-faint flex items-center gap-1.5">
                        <CalendarClock size={13} strokeWidth={1.5} />
                        {formatDisplayDate(item.startDate)} — {formatDisplayDate(item.endDate)}
                      </p>

                      {/* Usage bar */}
                      {item.maxUses ? (
                        <div className="flex items-center gap-2.5">
                          <Users size={13} className="c-ink-faint" strokeWidth={1.5} />
                          <div className="w-28 h-1.5 bg-ink/5 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                usagePercent >= 100 ? "bg-error" : usagePercent >= 75 ? "bg-amber-500" : "bg-success"
                              )}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                          <span className="t-caption t-num c-ink-faint">
                            <span className={cn("font-medium", isExhausted && "c-error")}>{item.usesCount}</span>
                            <span className="c-ink-faint/60">/{item.maxUses}</span>
                          </span>
                        </div>
                      ) : (
                        <p className="t-caption c-ink-faint flex items-center gap-1.5">
                          <TrendingUp size={13} strokeWidth={1.5} />
                          <span className="t-num">{item.usesCount}</span> uses (unlimited)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Toggle switch — inline compact */}
                    <div className="flex items-center gap-2 px-2 py-1">
                      <span className={cn("text-[10px] t-label-caps tracking-wider", item.isActive ? "c-success" : "c-ink-faint")}>
                        {item.isActive ? "ON" : "OFF"}
                      </span>
                      <button
                        onClick={() => toggleActive(item.id, item.isActive)}
                        disabled={isExhausted}
                        className={cn(
                          "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-all duration-300",
                          item.isActive
                            ? "bg-success shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                            : "bg-ink/15",
                          isExhausted && "opacity-40 cursor-not-allowed"
                        )}
                        role="switch"
                        aria-checked={item.isActive}
                        aria-label={item.isActive ? "Deactivate sale" : "Activate sale"}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all duration-300",
                            item.isActive ? "translate-x-[18px]" : "translate-x-[2px]"
                          )}
                        />
                      </button>
                    </div>

                    <div className="w-px h-5 bg-hairline-cream mx-1" />

                    {/* Reset usage (only if has maxUses and used) */}
                    {item.maxUses && item.usesCount > 0 && (
                      <button
                        onClick={() => resetUsage(item.id)}
                        title="Reset usage count & reactivate"
                        className="p-2 c-ink-faint hover:c-sky-500 hover:bg-sky-500/8 rounded-md transition-all"
                      >
                        <RotateCcw size={13} strokeWidth={1.8} />
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => startEdit(item)}
                      title="Edit sale"
                      className="p-2 c-ink-faint hover:c-gold-deep hover:bg-gold-pale/30 rounded-md transition-all"
                    >
                      <Pencil size={13} strokeWidth={1.8} />
                    </button>

                    {/* Delete */}
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="px-3 py-1.5 bg-error c-paper t-label-caps rounded-md text-[10px] tracking-wider font-medium transition-colors hover:bg-error/80 shadow-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1.5 t-label-caps c-ink-faint rounded-md text-[10px] border border-hairline-cream hover:bg-cream/60 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        title="Delete sale"
                        className="p-2 c-ink-faint hover:c-error hover:bg-error/5 rounded-md transition-all"
                      >
                        <Trash2 size={13} strokeWidth={1.8} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info banners */}
                {status === "scheduled" && (
                  <div className="mt-4 flex items-center gap-2.5 bg-sky-500/5 border border-sky-500/15 rounded-md px-4 py-3">
                    <Clock size={14} className="c-sky-500 flex-shrink-0" strokeWidth={1.5} />
                    <p className="t-caption c-sky-500 leading-relaxed">
                      Scheduled to go live on <strong>{formatDisplayDate(item.startDate)}</strong> and auto-expire on <strong>{formatDisplayDate(item.endDate)}</strong>.
                    </p>
                  </div>
                )}

                {isExhausted && (
                  <div className="mt-4 flex items-center gap-2.5 bg-error/5 border border-error/15 rounded-md px-4 py-3">
                    <AlertTriangle size={14} className="c-error flex-shrink-0" strokeWidth={1.5} />
                    <p className="t-caption c-error leading-relaxed flex-1">
                      Customer limit reached ({item.usesCount}/{item.maxUses}). The sale has been auto-deactivated.
                    </p>
                    <button
                      onClick={() => resetUsage(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error/10 c-error border border-error/20 rounded-md t-label-caps text-[10px] tracking-wider hover:bg-error/20 transition-colors flex-shrink-0"
                    >
                      <RotateCcw size={10} /> Reset & Reactivate
                    </button>
                  </div>
                )}

                {status === "expired" && !isExhausted && (
                  <div className="mt-4 flex items-center gap-2.5 bg-cream-deep/40 border border-hairline-cream rounded-md px-4 py-3">
                    <XCircle size={14} className="c-ink-faint flex-shrink-0" strokeWidth={1.5} />
                    <p className="t-caption c-ink-muted leading-relaxed">
                      This sale has ended. Update the dates or create a new one.
                    </p>
                  </div>
                )}

                {status === "live" && item.maxUses && usagePercent >= 75 && !isExhausted && (
                  <div className="mt-4 flex items-center gap-2.5 bg-amber-500/5 border border-amber-500/20 rounded-md px-4 py-3">
                    <ShieldCheck size={14} className="c-amber-500 flex-shrink-0" strokeWidth={1.5} />
                    <p className="t-caption c-amber-600 leading-relaxed">
                      Usage is at {usagePercent}% ({item.usesCount}/{item.maxUses}). The sale will auto-deactivate when the limit is reached.
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </RevealOnScroll>
      )}
    </div>
  );
}