"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface Question {
  id: string; authorName: string; authorEmail: string | null;
  question: string; answer: string | null; isAnswered: boolean;
  productSlug: string; productName: string;
  createdAt: string; answeredAt: string | null;
}

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/questions?filter=${filter}`)
      .then(r => r.ok ? r.json() : { questions: [] })
      .then(d => setQuestions(d.questions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const answerQuestion = async (id: string, e: FormEvent) => {
    e.preventDefault();
    const answer = answers[id];
    if (!answer?.trim()) return;
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      if (res.ok) {
        setQuestions(questions.map(q => q.id === id ? { ...q, answer, isAnswered: true, answeredAt: new Date().toISOString().split("T")[0] } : q));
        setAnswers({ ...answers, [id]: "" });
      }
    } catch {} finally { setSaving(null); }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    setQuestions(questions.filter(q => q.id !== id));
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "unanswered", label: "Unanswered" },
    { key: "answered", label: "Answered" },
  ];

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Customer Engagement</p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Q&amp;A</TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">Answer customer questions about products. Answered questions appear on the product page.</p>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-gradient-to-r from-cream to-cream-deep rounded-full border border-hairline-cream mb-6 w-fit">
        {filters.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setLoading(true); }} className={cn("px-4 py-2 t-body-sm rounded-full transition-all", filter === f.key ? "bg-gradient-to-r from-gold-pale to-cream c-gold-deep font-semibold shadow-gold-glow border border-gold/20" : "c-ink-faint hover:c-ink")}>{f.label}</button>
        ))}
      </div>

      {loading ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div> : questions.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><MessageCircle size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" /><p className="t-headline-sm c-ink mb-2">No questions</p><p className="t-body c-ink-muted">When customers ask questions, they&apos;ll appear here.</p></div>
      ) : (
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {questions.map(q => (
            <motion.div key={q.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="t-body c-ink font-medium">{q.authorName}</p>
                    {q.isAnswered ? <span className="chip bg-success/10 c-success t-label-caps flex items-center gap-1"><Check size={8} />Answered</span> : <span className="chip bg-gold-pale c-gold-deep t-label-caps">Pending</span>}
                    <span className="t-caption c-ink-faint">{q.createdAt}</span>
                  </div>
                  <p className="t-body-sm c-ink-muted mb-1">On: <span className="c-gold-deep">{q.productName}</span></p>
                  <p className="t-body c-ink mt-2">{q.question}</p>
                </div>
                <button onClick={() => deleteQuestion(q.id)} className="p-2 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all flex-shrink-0"><Trash2 size={14} /></button>
              </div>

              {q.isAnswered && q.answer ? (
                <div className="bg-cream/40 border border-hairline-cream rounded-sm p-3 mt-3">
                  <p className="t-label-caps c-gold-deep mb-1">Answer</p>
                  <p className="t-body-sm c-ink">{q.answer}</p>
                  {q.answeredAt && <p className="t-caption c-ink-faint mt-1">Answered on {q.answeredAt}</p>}
                </div>
              ) : (
                <form onSubmit={(e) => answerQuestion(q.id, e)} className="mt-3">
                  <textarea value={answers[q.id] ?? ""} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder="Type your answer..." rows={2} className={inputCls} />
                  <button type="submit" disabled={saving === q.id || !answers[q.id]?.trim()} className="mt-2 inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-4 py-2 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
                    <Send size={12} /> {saving === q.id ? "Sending..." : "Submit Answer"}
                  </button>
                </form>
              )}
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
