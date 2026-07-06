"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Loader2, Check, Send } from "lucide-react";
import { PageHero } from "@/components/aura/layout/PageHero";
import { useSettings } from "@/hooks/use-settings";

export default function ContactPage() {
  const settings = useSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setState("error");
        return;
      }

      setState("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setState("idle"), 5000);
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  };

  return (
    <>
      <PageHero
        image="/hero/about.webp"
        alt="The Aura Living atelier — a quiet space with considered objects and a writing desk."
        eyebrow="Concierge"
        headline="Contact Us"
      />

      <section className="container-aura py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left — intro + direct contact details */}
          <div className="lg:col-span-5">
            <p className="t-overline c-gold-deep mb-3">We are here to help</p>
            <h1 className="font-display text-3xl md:text-4xl c-ink mb-6">
              Let&apos;s talk
            </h1>
            <p className="t-body c-ink-muted leading-relaxed mb-10">
              Whether you have a question about a piece, a custom order enquiry,
              or a press request — we read every message and reply within two
              business days. For order-specific questions, please include your
              order number so we can find your details quickly.
            </p>

            <div className="space-y-5">
              {settings.storeEmail && (
                <a
                  href={`mailto:${settings.storeEmail}`}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0 group-hover:bg-gold-pale transition-colors">
                    <Mail size={16} strokeWidth={1.5} className="c-gold-deep" />
                  </div>
                  <div>
                    <p className="t-label-caps c-ink-faint mb-1">Email</p>
                    <p className="t-body c-ink group-hover:c-gold-deep transition-colors">
                      {settings.storeEmail}
                    </p>
                  </div>
                </a>
              )}
              {settings.storePhone && (
                <a
                  href={`tel:${settings.storePhone}`}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0 group-hover:bg-gold-pale transition-colors">
                    <Phone size={16} strokeWidth={1.5} className="c-gold-deep" />
                  </div>
                  <div>
                    <p className="t-label-caps c-ink-faint mb-1">Phone</p>
                    <p className="t-body c-ink group-hover:c-gold-deep transition-colors">
                      {settings.storePhone}
                    </p>
                    <p className="t-caption c-ink-faint">Mon–Sat, 10am–7pm PKT</p>
                  </div>
                </a>
              )}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} strokeWidth={1.5} className="c-gold-deep" />
                </div>
                <div>
                  <p className="t-label-caps c-ink-faint mb-1">Atelier</p>
                  <p className="t-body c-ink">
                    {settings.storeName ?? "Aura Living"} Atelier
                  </p>
                  <p className="t-body c-ink-muted">Lahore, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-7">
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={onSubmit}
              className="bg-paper border border-hairline rounded-sm p-6 md:p-10 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="t-label-caps c-ink-faint block mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-cream/50 border border-hairline-cream px-4 h-12 t-body c-ink outline-none focus:border-gold transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="t-label-caps c-ink-faint block mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-cream/50 border border-hairline-cream px-4 h-12 t-body c-ink outline-none focus:border-gold transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="t-label-caps c-ink-faint block mb-2">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-cream/50 border border-hairline-cream px-4 h-12 t-body c-ink outline-none focus:border-gold transition-colors"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="t-label-caps c-ink-faint block mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-cream/50 border border-hairline-cream px-4 py-3 t-body c-ink outline-none focus:border-gold transition-colors resize-none"
                  placeholder="Tell us how we can help..."
                />
                <p className="t-caption c-ink-faint mt-1">
                  {form.message.length}/5000 characters
                </p>
              </div>

              {error && (
                <p className="t-body-sm c-error">{error}</p>
              )}

              {state === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-success/10 border border-success/30 rounded-sm"
                >
                  <Check size={18} strokeWidth={2} className="c-success flex-shrink-0" />
                  <p className="t-body-sm c-ink">
                    Thank you — your message has been received. We will reply
                    within two business days.
                  </p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={state === "loading" || state === "success"}
                className="inline-flex items-center gap-2 px-6 h-12 bg-ink c-paper t-label-caps hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {state === "loading" ? (
                  <>
                    <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                    Sending
                  </>
                ) : state === "success" ? (
                  <>
                    <Check size={14} strokeWidth={2} />
                    Sent
                  </>
                ) : (
                  <>
                    <Send size={14} strokeWidth={1.75} />
                    Send message
                  </>
                )}
              </button>
            </motion.form>
          </div>
        </div>
      </section>
    </>
  );
}
