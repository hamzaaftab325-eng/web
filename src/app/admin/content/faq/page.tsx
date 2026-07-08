"use client";

import { useEffect, useState, type FormEvent } from "react";

import { motion } from "framer-motion";
import { HelpCircle, Plus, Trash2, ChevronDown, ChevronUp, Pencil, ArrowUp, ArrowDown } from "lucide-react";

import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string; question: string; answer: string;
  category: string | null; sortOrder: number; isActive: boolean;
}

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminFaq() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetch("/api/admin/content/faq")
      .then((r) => (r.ok ? r.json() : { faqItems: [] }))
      .then((data) => setItems(data.faqItems ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const isEditing = !!editingId;
      const url = isEditing ? `/api/admin/content/faq/${editingId}` : "/api/admin/content/faq";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, category: category || undefined }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error ?? "Failed"); }
      const data = await res.json();
      const returned = data.faqItem;
      if (isEditing) setItems(items.map(i => i.id === editingId ? returned : i));
      else setItems([...items, returned]);
      cancelForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/content/faq/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) setItems(items.map((i) => (i.id === id ? { ...i, isActive: !current } : i)));
    } catch { /* ignore */ }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this FAQ item?")) return;
    try {
      const res = await fetch(`/api/admin/content/faq/${id}`, { method: "DELETE" });
      if (res.ok) setItems(items.filter((i) => i.id !== id));
    } catch { /* ignore */ }
  };

  const resetForm = () => { setQuestion(""); setAnswer(""); setCategory(""); setEditingId(null); };

  const startEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setQuestion(item.question);
    setAnswer(item.answer);
    setCategory(item.category ?? "");
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => { setShowForm(false); resetForm(); };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/admin/content/faq/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: b.sortOrder }) }),
      fetch(`/api/admin/content/faq/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);
    setItems((prev) => prev.map((s) => {
      if (s.id === a.id) return { ...s, sortOrder: b.sortOrder };
      if (s.id === b.id) return { ...s, sortOrder: a.sortOrder };
      return s;
    }));
  };

  const isEditing = !!editingId;

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />Support
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">FAQ</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">Frequently asked questions about shipping, returns, materials, and care.</p>
          </div>
          <button onClick={() => { if (isEditing) cancelForm(); else { resetForm(); setShowForm(!showForm); } }} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0">
            <Plus size={16} strokeWidth={1.5} className={cn("transition-transform", showForm && !isEditing && "rotate-45")} />
            {showForm ? (isEditing ? "Cancel Edit" : "Cancel") : "Add Item"}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6">
          <h2 className="t-headline-sm c-ink mb-4">{isEditing ? "Edit FAQ Item" : "New FAQ Item"}</h2>
          {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Question *</span>
              <input required value={question} onChange={(e) => setQuestion(e.target.value)} className={inputCls} placeholder="How long does shipping take?" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Answer *</span>
              <textarea required value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} className={inputCls} placeholder="Orders are typically delivered within 3-5 business days..." />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Category *</span>
              <input required value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} placeholder="Shipping" />
            </label>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
                {saving ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Item")}
              </button>
              <button type="button" onClick={cancelForm} className="t-label-caps c-ink-faint hover:c-ink">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <HelpCircle size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No FAQ items</p>
          <p className="t-body c-ink-muted mb-6">Add questions and answers to help your customers.</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
            <Plus size={14} /> Add Item
          </button>
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {[...items].sort((a, b) => a.sortOrder - b.sortOrder).map((item, idx, arr) => (
            <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <div className="flex items-center gap-1">
                  <button onClick={() => moveItem(item.id, "up")} disabled={idx === 0} className="p-1.5 c-ink-faint hover:c-gold hover:bg-gold/10 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move up"><ArrowUp size={14} /></button>
                  <button onClick={() => moveItem(item.id, "down")} disabled={idx === arr.length - 1} className="p-1.5 c-ink-faint hover:c-gold hover:bg-gold/10 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move down"><ArrowDown size={14} /></button>
                </div>
                <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} className="flex-1 text-left flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0">
                    <HelpCircle size={14} className="c-gold-deep" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("t-body c-ink font-medium", !item.isActive && "opacity-50")}>{item.question}</p>
                    {item.category && <span className="t-caption c-ink-faint">{item.category}</span>}
                  </div>
                  {expanded === item.id ? <ChevronUp size={16} className="c-ink-faint" /> : <ChevronDown size={16} className="c-ink-faint" />}
                </button>
                <button onClick={() => startEdit(item)} className="inline-flex items-center gap-1 px-3 py-1.5 t-label-caps c-ink hover:c-gold hover:bg-gold/10 rounded-sm transition-all"><Pencil size={10} />Edit</button>
                <button onClick={() => toggleActive(item.id, item.isActive)} className={cn("px-3 py-1.5 t-label-caps rounded-sm transition-all", item.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>
                  {item.isActive ? "Hide" : "Show"}
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-2 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              {expanded === item.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-5 pt-0">
                  <div className="pt-4 border-t border-hairline-cream">
                    <p className="t-body-sm c-ink-muted">{item.answer}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
