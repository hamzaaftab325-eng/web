"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";
import { Mail, Search, Download, Upload, X } from "lucide-react";

import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { cn } from "@/lib/utils";

interface Subscriber {
  id: string; email: string; source: string | null;
  promoCode: string | null; createdAt: string;
}

const inputCls = "w-full pl-12 pr-4 py-3 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sources, setSources] = useState<Array<{ source: string; count: number }>>([]);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const fetchSubscribers = () => {
    setLoading(true);
    // Bug #19 fix: pass search to API (was fetching 500 and filtering client-side)
    const params = new URLSearchParams({
      limit: "1000",
      ...(sourceFilter !== "all" && { source: sourceFilter }),
      ...(search.trim() && { search: search.trim() }),
    });
    fetch(`/api/admin/subscribers?${params}`)
      .then(r => r.ok ? r.json() : { subscribers: [], sources: [] })
      .then(data => {
        setSubscribers(data.subscribers ?? []);
        setSources(data.sources ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Phase 7E: Inlined fetchSubscribers to fix exhaustive-deps warning.
    setLoading(true);
    const params = new URLSearchParams({
      limit: "1000",
      ...(sourceFilter !== "all" && { source: sourceFilter }),
      ...(search.trim() && { search: search.trim() }),
    });
    fetch(`/api/admin/subscribers?${params}`)
      .then(r => r.ok ? r.json() : { subscribers: [], sources: [] })
      .then(data => {
        setSubscribers(data.subscribers ?? []);
        setSources(data.sources ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sourceFilter, search]);

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const csv = "email,source,promoCode,subscribed_at\n" + filtered.map(s =>
      `${s.email},${s.source ?? "unknown"},${s.promoCode ?? ""},${s.createdAt}`
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/admin/subscribers/import", {
        method: "POST",
        body: importText,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setImportResult(data.message);
      setImportText("");
      fetchSubscribers();
    } catch (e) {
      setImportResult(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Newsletter</p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Subscribers</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">{subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}{sources.length > 0 && ` · ${sources.map(s => `${s.count} ${s.source}`).join(", ")}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImport(!showImport)} className="inline-flex items-center gap-2 bg-cream-deep c-ink t-label-caps px-4 py-3.5 rounded-sm hover:bg-gold-pale hover:c-gold-deep transition-colors">
              <Upload size={14} /> Import
            </button>
            {subscribers.length > 0 && (
              <button onClick={exportCSV} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-4 py-3.5 rounded-sm hover:bg-gold-deep transition-colors">
                <Download size={14} /> Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Import panel */}
      {showImport && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="t-headline-sm c-ink">Import Subscribers</h2>
            <button onClick={() => setShowImport(false)} className="p-1 c-ink-faint hover:c-ink"><X size={16} /></button>
          </div>
          <p className="t-caption c-ink-faint mb-3">Paste emails below — one per line or comma-separated.</p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={5} className={inputCls} placeholder={"user1@email.com\nuser2@email.com\nuser3@email.com"} />
          {importResult && <p className={cn("t-body-sm mt-2", importResult.includes("failed") ? "c-error" : "c-success")}>{importResult}</p>}
          <button onClick={handleImport} disabled={importing || !importText.trim()} className="mt-3 inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-4 py-2.5 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
            <Upload size={12} /> {importing ? "Importing..." : "Import Emails"}
          </button>
        </motion.div>
      )}

      {/* Search + Source filter */}
      {subscribers.length > 0 && (
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none" />
            <input type="text" placeholder="Search subscribers..." value={search} onChange={e => setSearch(e.target.value)} className={inputCls} />
          </div>
          {sources.length > 0 && (
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="px-4 py-3 t-body-sm c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold">
              <option value="all">All Sources</option>
              {sources.map(s => <option key={s.source} value={s.source ?? "unknown"}>{s.source ?? "unknown"} ({s.count})</option>)}
            </select>
          )}
        </div>
      )}

      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <Mail size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">{subscribers.length === 0 ? "No subscribers yet" : "No matches found"}</p>
          <p className="t-body c-ink-muted">{subscribers.length === 0 ? "When visitors subscribe to your newsletter, they'll appear here." : "Try a different search term or source."}</p>
        </div>
      ) : (
        <RevealOnScroll stagger={0.03} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(sub => (
            <motion.div key={sub.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-4 flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold">
                <Mail size={16} className="c-gold-deep" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="t-body-sm c-ink font-medium truncate">{sub.email}</p>
                <p className="t-caption c-ink-faint">{sub.source ?? "newsletter"} · {sub.createdAt}</p>
              </div>
              {sub.promoCode && <span className={cn("chip bg-gold-pale c-gold-deep t-label-caps t-num")}>{sub.promoCode}</span>}
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
