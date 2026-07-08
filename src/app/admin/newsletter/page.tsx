"use client";

import { useState, type FormEvent } from "react";

import { Send, Mail, Users } from "lucide-react";

import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminNewsletter() {
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  const checkSubscribers = async () => {
    const res = await fetch("/api/admin/subscribers?limit=1");
    const data = await res.json();
    setSubscriberCount(data.total ?? 0);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!confirm(`Send newsletter to all subscribers? This cannot be undone.`)) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, bodyHtml }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(data.message);
      setSubject("");
      setBodyHtml("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />Marketing
          </p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Newsletter</TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">Compose and send a newsletter email to all subscribers.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gold-pale flex items-center justify-center ring-1 ring-hairline-gold">
          <Users size={20} className="c-gold-deep" />
        </div>
        <div>
          <p className="t-body c-ink font-medium">{subscriberCount !== null ? `${subscriberCount} subscribers` : "Subscribers"}</p>
          <button onClick={checkSubscribers} className="t-caption c-gold-deep hover:c-ink transition-colors">Check count</button>
        </div>
      </div>

      {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
      {result && <div className="bg-success/10 border border-success/30 c-success p-3 rounded-sm mb-4 t-body-sm">✓ {result}</div>}

      <form onSubmit={onSubmit} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 space-y-5 max-w-2xl">
        <label className="block">
          <span className="t-label-caps c-ink-faint block mb-1.5">Subject *</span>
          <input required value={subject} onChange={e => setSubject(e.target.value)} className={inputCls} placeholder="New arrivals — The Summer Edit" />
        </label>

        <label className="block">
          <span className="t-label-caps c-ink-faint block mb-1.5">Body (HTML) *</span>
          <textarea
            required
            value={bodyHtml}
            onChange={e => setBodyHtml(e.target.value)}
            rows={10}
            className={inputCls}
            placeholder="<p>Our Summer Edit has landed...</p>"
          />
          <p className="t-caption c-ink-faint mt-1">Write your newsletter in HTML. The template adds the header, footer, and unsubscribe link automatically.</p>
        </label>

        {/* Preview */}
        {bodyHtml && (
          <div className="bg-paper border border-hairline-cream rounded-sm p-4">
            <p className="t-label-caps c-ink-faint mb-2">Preview</p>
            <div className="t-body-sm c-ink-muted" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          </div>
        )}

        <button type="submit" disabled={sending || !subject || !bodyHtml} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
          <Send size={14} /> {sending ? "Sending..." : "Send Newsletter"}
        </button>

        <div className="bg-gold-pale/30 border border-hairline-gold rounded-sm p-4 flex items-start gap-3">
          <Mail size={18} className="c-gold-deep flex-shrink-0 mt-0.5" />
          <div>
            <p className="t-body-sm c-ink font-medium mb-1">Email configuration</p>
            <p className="t-caption c-ink-muted">
              Emails are sent via Resend. If RESEND_API_KEY is not configured, emails will be logged to console instead of sent.
              Add the API key to Vercel environment variables to enable sending.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
