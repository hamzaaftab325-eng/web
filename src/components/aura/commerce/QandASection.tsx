"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronDown, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  authorName: string;
  question: string;
  answer: string | null;
  date: string;
}

interface QandASectionProps {
  productSlug: string;
  productName: string;
}

export function QandASection({ productSlug, productName }: QandASectionProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/products/${productSlug}/questions`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setQuestions(Array.isArray(data) ? data : []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [productSlug]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !question.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: authorName.trim(), question: question.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast({ title: "Question submitted", description: "We'll answer it soon." });
      setShowForm(false);
      setAuthorName("");
      setQuestion("");
    } catch (e) {
      toast({ title: "Failed", description: e instanceof Error ? e.message : "Please try again" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="block h-px w-12 bg-gold" />
        <span className="t-label-caps c-gold-deep">Questions & Answers</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="t-display-md c-ink">Have a question?</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-5 py-3 rounded-sm hover:bg-gold-deep transition-colors"
        >
          <MessageCircle size={14} />
          Ask a Question
        </button>
      </div>

      {/* Ask form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form onSubmit={onSubmit} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 space-y-4">
              <label className="block">
                <span className="t-label-caps c-ink-faint block mb-1.5">Your Name</span>
                <input
                  required
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors"
                  placeholder="Enter your name"
                />
              </label>
              <label className="block">
                <span className="t-label-caps c-ink-faint block mb-1.5">Your Question about {productName}</span>
                <textarea
                  required
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors"
                  placeholder="e.g. What material is this made of?"
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                {submitting ? "Submitting..." : "Submit Question"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions list */}
      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-8 text-center">
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-8 text-center">
          <MessageCircle size={32} strokeWidth={1} className="c-ink-faint mx-auto mb-3" />
          <p className="t-body c-ink-muted">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => {
            const isExpanded = expandedIds.has(q.id);
            return (
              <div key={q.id} className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="w-full flex items-start gap-4 p-5 text-left hover:bg-cream/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold">
                    <User size={16} className="c-gold-deep" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="t-body c-ink font-medium">{q.authorName}</p>
                      <span className="t-caption c-ink-faint">{q.date}</span>
                    </div>
                    <p className="t-body-sm c-ink">{q.question}</p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={cn("c-ink-faint flex-shrink-0 transition-transform mt-1", isExpanded && "rotate-180")}
                  />
                </button>
                <AnimatePresence>
                  {isExpanded && q.answer && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pl-[4.5rem]">
                        <div className="bg-cream/50 border-l-2 border-gold rounded-sm p-4">
                          <p className="t-label-caps c-gold-deep mb-1">Aura Living</p>
                          <p className="t-body-sm c-ink">{q.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QandASection;
