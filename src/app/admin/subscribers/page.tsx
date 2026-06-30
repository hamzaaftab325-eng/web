"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Search, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface Subscriber {
  id: string; email: string; source: string | null;
  promoCode: string | null; createdAt: string;
}

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/subscribers?limit=500")
      .then((r) => (r.ok ? r.json() : { subscribers: [] }))
      .then((data) => setSubscribers(data.subscribers ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const csv = "email,source,subscribed_at\n" + filtered.map((s) =>
      `${s.email},${s.source ?? "unknown"},${s.createdAt}`
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />Newsletter
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Subscribers</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">
              {subscribers.length} email subscriber{subscribers.length === 1 ? "" : "s"} collected from newsletter signups and exit-intent popups.
            </p>
          </div>
          {subscribers.length > 0 && (
            <button
              onClick={exportCSV}
              className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"
            >
              <Download size={16} strokeWidth={1.5} className="group-hover:translate-y-0.5 transition-transform" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {subscribers.length > 0 && (
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none" />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors"
          />
        </div>
      )}

      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <Mail size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">
            {subscribers.length === 0 ? "No subscribers yet" : "No matches found"}
          </p>
          <p className="t-body c-ink-muted">
            {subscribers.length === 0
              ? "When visitors subscribe to your newsletter, they&apos;ll appear here."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <RevealOnScroll stagger={0.03} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((sub) => (
            <motion.div
              key={sub.id}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-4 flex items-center gap-3"
            >
              <div className="relative w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold">
                <Mail size={16} className="c-gold-deep" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="t-body-sm c-ink font-medium truncate">{sub.email}</p>
                <p className="t-caption c-ink-faint">
                  {sub.source ?? "newsletter"} · {sub.createdAt}
                </p>
              </div>
              {sub.promoCode && (
                <span className={cn("chip bg-gold-pale c-gold-deep t-label-caps t-num")}>{sub.promoCode}</span>
              )}
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
