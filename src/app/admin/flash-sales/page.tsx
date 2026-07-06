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
  Eye,
  EyeOff,
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
  isActive: boolean;
  createdAt: string;
}

type SaleStatus = "scheduled" | "live" | "expired" | "draft";

function getSaleStatus(sale: Sale): SaleStatus {
  const now = new Date();
  const start = new Date(sale.startDate);
  const end = new Date(sale.endDate);
  if (!sale.isActive) return "draft";
  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return "live";
}

const statusConfig: Record<SaleStatus, { label: string; color: string; bg: string; icon: typeof Zap }> = {
  live: { label: "Live Now", color: "c-success", bg: "bg-success/10 border-success/30", icon: Zap },
  scheduled: { label: "Scheduled", color: "c-blue-500", bg: "bg-blue-500/10 border-blue-500/30", icon: Clock },
  expired: { label: "Expired", color: "c-ink-faint", bg: "bg-cream-deep border-hairline-cream", icon: XCircle },
  draft: { label: "Inactive", color: "c-error", bg: "bg-error/10 border-error/30", icon: EyeOff },
};

/* ─── Helpers ─── */
function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso);
  // Format for <input type="datetime-local"> — local timezone
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ─── Input classes ─── */
const inputCls =
  "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors placeholder:text-ink-faint/50";
const labelCls = "t-label-caps c-ink-faint block mb-1.5";

/* ─── Form defaults ─── */
const emptyForm = {
  name: "",
  description: "",
  discountPercent: "15",
  promoCode: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

export default function AdminFlashSales() {
  const [items, setItems] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Form state
  const [mode, setMode] = useState<"idle" | "create" | "edit">("idle");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  /* ─── Create ─── */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Client-side validation
      if (!form.startDate || !form.endDate) throw new Error("Start and end dates are required");
      if (new Date(form.endDate) <= new Date(form.startDate)) throw new Error("End date must be after start date");

      const body: Record<string, unknown> = {
        name: form.name,
        description: form.description || undefined,
        discountPercent: Number(form.discountPercent) || undefined,
        promoCode: form.promoCode.trim() || undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        isActive: form.isActive,
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
      }

      // Reset and refresh
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
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !current } : i)));
    } catch {
      setGlobalError("Failed to toggle sale status. Please try again.");
    }
  };

  /* ─── Delete ─── */
  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/flash-sales/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== id));
      setDeleteConfirmId(null);
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
    <div>
      {/* ─── Page Header ─── */}
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              Marketing
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">
              Flash Sales
            </TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">
              Create time-limited discount events. Only <strong className="c-ink">active</strong> sales within their date range appear on the storefront.
            </p>
          </div>
          <button
            onClick={() => {
              if (isFormOpen) {
                cancelForm();
              } else {
                setMode("create");
                setForm({ ...emptyForm, isActive: true });
              }
            }}
            className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"
          >
            {isFormOpen ? (
              <>
                <X size={16} /> Cancel
              </>
            ) : (
              <>
                <Plus size={16} className={cn("transition-transform")} /> Add Sale
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Global Error ─── */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-error/10 border border-error/30 c-error p-4 rounded-sm mb-6 t-body-sm flex items-center gap-3"
          >
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span className="flex-1">{globalError}</span>
            <button onClick={() => setGlobalError(null)} className="hover:opacity-70 transition-opacity">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Create / Edit Form ─── */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 md:p-8 mb-8">
              <h2 className="t-headline-sm c-ink mb-1">
                {mode === "edit" ? "Edit Flash Sale" : "New Flash Sale"}
              </h2>
              <p className="t-caption c-ink-muted mb-6">
                {mode === "edit"
                  ? "Update the sale details below. Changes are live immediately."
                  : "Fill in the details below. The sale will be active by default."}
              </p>

              {error && (
                <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-5 t-body-sm flex items-center gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                {/* Row 1: Name */}
                <label className="block">
                  <span className={labelCls}>Sale Name *</span>
                  <input
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                    placeholder="e.g. Summer Luxe Flash Sale – 25% Off"
                  />
                  <span className="t-caption c-ink-faint mt-1 block">
                    {form.name.length}/120 characters
                  </span>
                </label>

                {/* Row 2: Description */}
                <label className="block">
                  <span className={labelCls}>Description</span>
                  <textarea
                    maxLength={600}
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className={cn(inputCls, "resize-none")}
                    placeholder="Describe the sale — this appears on the storefront banner."
                  />
                  <span className="t-caption c-ink-faint mt-1 block">
                    {form.description.length}/600 characters
                  </span>
                </label>

                {/* Row 3: Discount + Promo Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className={labelCls}>Discount %</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.discountPercent}
                      onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                      className={inputCls}
                      placeholder="25"
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Promo Code</span>
                    <input
                      value={form.promoCode}
                      onChange={(e) => setForm((f) => ({ ...f, promoCode: e.target.value.toUpperCase() }))}
                      className={cn(inputCls, "t-num tracking-wider")}
                      placeholder="e.g. FLASH25"
                    />
                  </label>
                </div>

                {/* Row 4: Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className={labelCls}>Start Date *</span>
                    <input
                      required
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                      className={inputCls}
                    />
                    {form.startDate && new Date(form.startDate) > new Date() && (
                      <p className="t-caption c-blue-500 mt-1 flex items-center gap-1">
                        <Clock size={10} /> This sale will start in the future
                      </p>
                    )}
                  </label>
                  <label className="block">
                    <span className={labelCls}>End Date *</span>
                    <input
                      required
                      type="datetime-local"
                      value={form.endDate}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                      className={inputCls}
                    />
                  </label>
                </div>

                {/* Row 5: Active Toggle */}
                <div className="flex items-center justify-between bg-cream/40 border border-hairline-cream rounded-sm px-5 py-4">
                  <div>
                    <p className="t-body c-ink font-medium flex items-center gap-2">
                      {form.isActive ? (
                        <><CheckCircle2 size={16} className="c-success" /> Active</>
                      ) : (
                        <><XCircle size={16} className="c-error" /> Inactive</>
                      )}
                    </p>
                    <p className="t-caption c-ink-muted mt-0.5">
                      {form.isActive
                        ? "This sale is visible on the storefront during its date range."
                        : "This sale is hidden from the storefront even during its date range."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                    className={cn(
                      "relative w-12 h-7 rounded-full transition-colors duration-300 flex-shrink-0",
                      form.isActive ? "bg-success" : "bg-cream-deep"
                    )}
                    aria-label={form.isActive ? "Deactivate sale" : "Activate sale"}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 w-6 h-6 rounded-full bg-paper shadow-sm transition-transform duration-300",
                        form.isActive ? "translate-x-5.5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50"
                  >
                    <Save size={14} />
                    {saving
                      ? mode === "edit"
                        ? "Saving..."
                        : "Creating..."
                      : mode === "edit"
                        ? "Save Changes"
                        : "Create Flash Sale"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="t-body c-ink-muted hover:c-ink px-4 py-3 transition-colors"
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
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <div className="aura-loader-ring mx-auto">
            <span className="aura-loader-dot" />
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <Zap size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No flash sales yet</p>
          <p className="t-body c-ink-muted">
            Create a time-limited sale to boost revenue and drive urgency.
          </p>
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {items.map((item) => {
            const status = getSaleStatus(item);
            const cfg = statusConfig[status];
            const StatusIcon = cfg.icon;

            return (
              <motion.div
                key={item.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className={cn(
                  "bg-gradient-card-warm border rounded-sm p-5 transition-colors",
                  status === "live" ? "border-success/30 shadow-gold-glow/20" : "border-hairline-cream"
                )}
              >
                {/* Top row: info + actions */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title line with badges */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <p
                        className={cn(
                          "t-body c-ink font-medium",
                          status === "draft" && "opacity-50",
                          status === "expired" && "line-through opacity-60"
                        )}
                      >
                        {item.name}
                      </p>

                      {/* Status badge */}
                      <span
                        className={cn(
                          "chip border t-label-caps flex items-center gap-1",
                          cfg.bg,
                          cfg.color
                        )}
                      >
                        <StatusIcon size={10} />
                        {cfg.label}
                      </span>

                      {/* Discount badge */}
                      {item.discountPercent != null && item.discountPercent > 0 && (
                        <span className="chip bg-gold-pale c-gold-deep t-label-caps">
                          {item.discountPercent}% off
                        </span>
                      )}

                      {/* Promo code badge */}
                      {item.promoCode && (
                        <span className="chip bg-cream-deep c-ink-faint t-label-caps t-num">
                          {item.promoCode}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="t-caption c-ink-muted mb-2 line-clamp-2">{item.description}</p>
                    )}

                    {/* Date range */}
                    <p className="t-caption c-ink-faint flex items-center gap-1.5">
                      <CalendarClock size={12} />
                      {formatDisplayDate(item.startDate)} — {formatDisplayDate(item.endDate)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Toggle active/inactive — with label */}
                    <button
                      onClick={() => toggleActive(item.id, item.isActive)}
                      title={item.isActive ? "Deactivate sale" : "Activate sale"}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 t-label-caps rounded-sm transition-all text-xs",
                        item.isActive
                          ? "bg-success/10 c-success hover:bg-error/10 hover:c-error border border-success/20"
                          : "bg-cream-deep c-ink-faint hover:bg-success/10 hover:c-success border border-hairline-cream"
                      )}
                    >
                      {item.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span className="hidden md:inline">{item.isActive ? "Active" : "Inactive"}</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => startEdit(item)}
                      title="Edit sale"
                      className="p-2 c-ink-faint hover:c-gold-deep hover:bg-gold-pale/30 rounded-sm transition-all"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Delete */}
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="px-3 py-2 bg-error c-paper t-label-caps rounded-sm text-xs transition-colors hover:bg-error/80"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-2 t-label-caps c-ink-faint rounded-sm text-xs border border-hairline-cream hover:bg-cream/60 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        title="Delete sale"
                        className="p-2 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scheduled warning */}
                {status === "scheduled" && (
                  <div className="mt-3 flex items-center gap-2 bg-blue-500/5 border border-blue-500/15 rounded-sm px-4 py-2.5">
                    <Clock size={14} className="c-blue-500 flex-shrink-0" />
                    <p className="t-caption c-blue-500">
                      This sale is scheduled. It will go live on {formatDisplayDate(item.startDate)} and auto-expire on {formatDisplayDate(item.endDate)}.
                    </p>
                  </div>
                )}

                {/* Expired notice */}
                {status === "expired" && (
                  <div className="mt-3 flex items-center gap-2 bg-cream-deep/50 border border-hairline-cream rounded-sm px-4 py-2.5">
                    <AlertTriangle size={14} className="c-ink-faint flex-shrink-0" />
                    <p className="t-caption c-ink-muted">
                      This sale has ended. Toggle it active and update the dates to re-use, or delete it.
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