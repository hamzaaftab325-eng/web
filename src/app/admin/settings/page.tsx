"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Save, Store, CreditCard, Mail, Globe, Share2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("store");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.ok ? r.json() : null)
      .then(data => setSettings(data?.settings ?? {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div>;

  const tabs = [
    { key: "store", label: "Store", icon: Store },
    { key: "payment", label: "Payment", icon: CreditCard },
    { key: "email", label: "Email", icon: Mail },
    { key: "social", label: "Social", icon: Share2 },
    { key: "seo", label: "SEO", icon: Globe },
  ];

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Configuration</p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Settings</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">Configure your store, payment methods, email, social links, and SEO.</p>
          </div>
          {saved && <div className="bg-success/10 border border-success/30 c-success px-4 py-2 rounded-sm t-body-sm flex items-center gap-2">✓ Settings saved</div>}
        </div>
      </div>

      {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gradient-to-r from-cream to-cream-deep rounded-full border border-hairline-cream mb-6 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("inline-flex items-center gap-2 px-4 py-2 t-body-sm rounded-full transition-all", activeTab === tab.key ? "bg-gradient-to-r from-gold-pale to-cream c-gold-deep font-semibold shadow-gold-glow border border-gold/20" : "c-ink-faint hover:c-ink")}>
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
        {activeTab === "store" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 space-y-5">
            <h2 className="t-headline-sm c-ink flex items-center gap-3"><span className="w-6 h-px bg-gold" aria-hidden />Store Information</h2>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Store Name</span><input value={settings.storeName ?? ""} onChange={e => update("storeName", e.target.value)} className={inputCls} /></label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Contact Email</span><input type="email" value={settings.storeEmail ?? ""} onChange={e => update("storeEmail", e.target.value)} className={inputCls} /></label>
              <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Contact Phone</span><input value={settings.storePhone ?? ""} onChange={e => update("storePhone", e.target.value)} className={inputCls} placeholder="+92 300 0000000" /></label>
            </div>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Store Address</span><input value={settings.storeAddress ?? ""} onChange={e => update("storeAddress", e.target.value)} className={inputCls} /></label>
            <h2 className="t-headline-sm c-ink flex items-center gap-3 pt-4"><span className="w-6 h-px bg-gold" aria-hidden />Pricing & Shipping</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Currency</span><input value={settings.currency ?? "PKR"} onChange={e => update("currency", e.target.value)} className={inputCls} /></label>
              <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Currency Symbol</span><input value={settings.currencySymbol ?? "₨"} onChange={e => update("currencySymbol", e.target.value)} className={inputCls} /></label>
              <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Tax Rate (%)</span><input type="number" value={settings.taxRate ?? "0"} onChange={e => update("taxRate", e.target.value)} className={inputCls} /></label>
              <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Order Number Prefix</span><input value={settings.orderNumberPrefix ?? "AURA"} onChange={e => update("orderNumberPrefix", e.target.value)} className={inputCls} /></label>
              <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Default Shipping Cost (PKR)</span><input type="number" value={settings.defaultShippingCost ?? "150"} onChange={e => update("defaultShippingCost", e.target.value)} className={inputCls} /></label>
              <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Free Shipping Threshold (PKR)</span><input type="number" value={settings.freeShippingThreshold ?? "10000"} onChange={e => update("freeShippingThreshold", e.target.value)} className={inputCls} /></label>
            </div>
          </motion.div>
        )}

        {activeTab === "payment" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 space-y-4">
            <h2 className="t-headline-sm c-ink flex items-center gap-3"><span className="w-6 h-px bg-gold" aria-hidden />Payment Methods</h2>
            {[
              { key: "paymentCOD", label: "Cash on Delivery (COD)", desc: "Customers pay in cash when their order is delivered." },
              { key: "paymentJazzCash", label: "JazzCash", desc: "Online payment via JazzCash mobile wallet. Requires merchant account." },
              { key: "paymentEasyPaisa", label: "EasyPaisa", desc: "Online payment via EasyPaisa mobile wallet. Requires merchant account." },
              { key: "paymentBankTransfer", label: "Bank Transfer", desc: "Customers transfer money to your bank account manually." },
            ].map(method => (
              <label key={method.key} className="flex items-center gap-4 cursor-pointer p-3 border border-hairline-cream rounded-sm hover:border-gold/40 transition-colors">
                <button type="button" role="switch" aria-checked={settings[method.key] === "true"} onClick={() => update(method.key, settings[method.key] === "true" ? "false" : "true")}
                  className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0", settings[method.key] === "true" ? "bg-ink" : "bg-cream-deep border border-hairline")}>
                  <span className={cn("inline-block h-4 w-4 rounded-full bg-paper shadow-ambient transition-all", settings[method.key] === "true" ? "ml-auto mr-1.5" : "ml-1.5")} />
                </button>
                <div className="flex-1">
                  <p className="t-body c-ink font-medium">{method.label}</p>
                  <p className="t-caption c-ink-muted">{method.desc}</p>
                </div>
                {settings[method.key] === "true" ? <Eye size={16} className="c-success" /> : <EyeOff size={16} className="c-ink-faint" />}
              </label>
            ))}
            <p className="t-caption c-ink-faint bg-cream/40 p-3 rounded-sm">Note: JazzCash and EasyPaisa require merchant account credentials in environment variables to process payments. COD is always available.</p>
          </motion.div>
        )}

        {activeTab === "email" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 space-y-5">
            <h2 className="t-headline-sm c-ink flex items-center gap-3"><span className="w-6 h-px bg-gold" aria-hidden />Email Configuration</h2>
            <label className="flex items-center gap-4 cursor-pointer p-3 border border-hairline-cream rounded-sm">
              <button type="button" role="switch" aria-checked={settings.emailEnabled === "true"} onClick={() => update("emailEnabled", settings.emailEnabled === "true" ? "false" : "true")}
                className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0", settings.emailEnabled === "true" ? "bg-ink" : "bg-cream-deep border border-hairline")}>
                <span className={cn("inline-block h-4 w-4 rounded-full bg-paper shadow-ambient transition-all", settings.emailEnabled === "true" ? "ml-auto mr-1.5" : "ml-1.5")} />
              </button>
              <div><p className="t-body c-ink font-medium">Enable Email Sending</p><p className="t-caption c-ink-muted">When enabled, transactional emails are sent via Resend.</p></div>
            </label>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Email Provider</span><input value={settings.emailProvider ?? "resend"} onChange={e => update("emailProvider", e.target.value)} className={inputCls} readOnly /></label>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">From Email Address</span><input type="email" value={settings.emailFrom ?? ""} onChange={e => update("emailFrom", e.target.value)} className={inputCls} placeholder="hello@auraliving.com" /></label>
            <div className="bg-gold-pale/30 border border-hairline-gold rounded-sm p-4">
              <p className="t-body-sm c-ink font-medium mb-1">Setup Instructions</p>
              <p className="t-caption c-ink-muted">1. Sign up at <span className="c-gold-deep">resend.com</span> (free: 100 emails/day)<br />2. Add <span className="c-gold-deep font-medium">RESEND_API_KEY</span> to Vercel environment variables<br />3. Verify your sending domain<br />4. Set the From Email above to your verified address<br />5. Enable email sending with the toggle above</p>
            </div>
            <p className="t-caption c-ink-faint">Emails sent: Order confirmation, order status updates, welcome email, review approved, newsletter.</p>
          </motion.div>
        )}

        {activeTab === "social" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 space-y-5">
            <h2 className="t-headline-sm c-ink flex items-center gap-3"><span className="w-6 h-px bg-gold" aria-hidden />Social Media Links</h2>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Instagram URL</span><input value={settings.socialInstagram ?? ""} onChange={e => update("socialInstagram", e.target.value)} className={inputCls} placeholder="https://instagram.com/auraliving" /></label>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Facebook URL</span><input value={settings.socialFacebook ?? ""} onChange={e => update("socialFacebook", e.target.value)} className={inputCls} placeholder="https://facebook.com/auraliving" /></label>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Twitter / X URL</span><input value={settings.socialTwitter ?? ""} onChange={e => update("socialTwitter", e.target.value)} className={inputCls} placeholder="https://twitter.com/auraliving" /></label>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Pinterest URL</span><input value={settings.socialPinterest ?? ""} onChange={e => update("socialPinterest", e.target.value)} className={inputCls} placeholder="https://pinterest.com/auraliving" /></label>
          </motion.div>
        )}

        {activeTab === "seo" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 space-y-5">
            <h2 className="t-headline-sm c-ink flex items-center gap-3"><span className="w-6 h-px bg-gold" aria-hidden />SEO — Meta Tags</h2>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Home Page Title</span><input value={settings.metaHomeTitle ?? ""} onChange={e => update("metaHomeTitle", e.target.value)} className={inputCls} /></label>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Home Page Description</span><textarea value={settings.metaHomeDescription ?? ""} onChange={e => update("metaHomeDescription", e.target.value)} rows={2} className={inputCls} /></label>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Shop Page Title</span><input value={settings.metaShopTitle ?? ""} onChange={e => update("metaShopTitle", e.target.value)} className={inputCls} /></label>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Shop Page Description</span><textarea value={settings.metaShopDescription ?? ""} onChange={e => update("metaShopDescription", e.target.value)} rows={2} className={inputCls} /></label>
            <p className="t-caption c-ink-faint">Meta tags help search engines understand your pages. Keep titles under 60 characters and descriptions under 160 characters.</p>
          </motion.div>
        )}

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
          <Save size={14} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
