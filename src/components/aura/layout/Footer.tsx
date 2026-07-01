"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Instagram, Mail, Facebook, Twitter } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { useCategories, useCollections } from "@/hooks/queries/use-catalog";
import { useSettings } from "@/hooks/use-settings";

export function Footer() {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { data: collections = [] } = useCollections();
  const settings = useSettings();
  const setCategory = useUIStore((s) => s.setCategory);
  const setCollection = useUIStore((s) => s.setCollection);
  const resetShop = useUIStore((s) => s.resetShop);

  const [email, setEmail] = useState("");

  const go = (path: string) => {
    if (path === "/shop") resetShop();
    router.push(path);
  };

  const goCategory = (slug: string) => {
    setCategory(slug as never);
    router.push("/shop");
  };

  const goCollection = (slug: string) => {
    setCollection(slug);
    router.push("/shop");
  };
  const [submitted, setSubmitted] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribeError(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubscribeError(data.error ?? "Something went wrong");
        return;
      }

      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setSubscribeError("Network error. Please try again.");
    }
  };

  return (
    <footer className="bg-ink c-paper mt-auto pb-[56px] lg:pb-0 safe-area-bottom">
      <div className="container-aura py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand + newsletter */}
          <div className="md:col-span-4">
            <button
              onClick={() => go("/")}
              className="block text-left mb-6"
              aria-label="Aura Living home"
            >
              <img
                src="/logo-white.svg"
                alt="Aura Living"
                className="h-10 w-auto"
                fetchPriority="low"
              />
            </button>
            <p className="t-body c-paper/70 max-w-xs leading-relaxed mb-6">
              Considered objects for the considered home. Sourced from small
              workshops, made to be lived with.
            </p>

            <form onSubmit={submit} className="max-w-sm">
              <label className="t-label-caps c-paper/50 block mb-2">
                Join the list
              </label>
              <div className="flex items-center gap-2 border-b border-paper/20 focus-within:border-gold transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-paper placeholder:text-paper/40 t-body py-2 outline-none"
                  required
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="text-paper hover:text-gold transition-colors p-1"
                >
                  <Mail size={18} strokeWidth={1.25} />
                </button>
              </div>
              {submitted && (
                <p className="t-caption c-gold mt-2">
                  Welcome to the family. Check your inbox.
                </p>
              )}
              {subscribeError && (
                <p className="t-caption c-error mt-2">
                  {subscribeError}
                </p>
              )}
            </form>
          </div>

          {/* Shop */}
          <div className="md:col-span-2 md:col-start-6">
            <p className="t-label-caps c-paper/50 mb-4">Shop</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => go("/shop")}
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline"
                >
                  All Products
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <button
                    onClick={() => setCategory(c.slug)}
                    className="t-body c-paper/80 hover:c-gold transition-colors link-underline text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div className="md:col-span-2">
            <p className="t-label-caps c-paper/50 mb-4">Collections</p>
            <ul className="space-y-2">
              {collections.map((col) => (
                <li key={col.slug}>
                  <button
                    onClick={() => setCollection(col.slug)}
                    className="t-body c-paper/80 hover:c-gold transition-colors link-underline text-left"
                  >
                    {col.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <p className="t-label-caps c-paper/50 mb-4">Company</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => go("/about")}
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline text-left"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => go("/journal")}
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline text-left"
                >
                  Journal
                </button>
              </li>
              <li>
                <button
                  onClick={() => go("/contact")}
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Discover */}
          <div className="md:col-span-2">
            <p className="t-label-caps c-paper/50 mb-4">Discover</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => go("/care")}
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline text-left"
                >
                  Care Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-2">
            <p className="t-label-caps c-paper/50 mb-4">Connect</p>
            <ul className="space-y-2">
              {settings.socialInstagram && (
                <li>
                  <a href={settings.socialInstagram} target="_blank" rel="noreferrer" className="t-body c-paper/80 hover:c-gold transition-colors link-underline inline-flex items-center gap-2">
                    <Instagram size={16} strokeWidth={1.25} /> Instagram
                  </a>
                </li>
              )}
              {settings.socialFacebook && (
                <li>
                  <a href={settings.socialFacebook} target="_blank" rel="noreferrer" className="t-body c-paper/80 hover:c-gold transition-colors link-underline inline-flex items-center gap-2">
                    <Facebook size={16} strokeWidth={1.25} /> Facebook
                  </a>
                </li>
              )}
              {settings.socialTwitter && (
                <li>
                  <a href={settings.socialTwitter} target="_blank" rel="noreferrer" className="t-body c-paper/80 hover:c-gold transition-colors link-underline inline-flex items-center gap-2">
                    <Twitter size={16} strokeWidth={1.25} /> Twitter / X
                  </a>
                </li>
              )}
              {settings.storeEmail && (
                <li>
                  <a href={`mailto:${settings.storeEmail}`} className="t-body c-paper/80 hover:c-gold transition-colors link-underline inline-flex items-center gap-2">
                    <Mail size={16} strokeWidth={1.25} /> {settings.storeEmail}
                  </a>
                </li>
              )}
              {settings.storePhone && (
                <li>
                  <a href={`tel:${settings.storePhone}`} className="t-body c-paper/80 hover:c-gold transition-colors link-underline">
                    {settings.storePhone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-paper/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="t-caption c-paper/50">
            © {new Date().getFullYear()} {settings.storeName} Atelier. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={() => go("/shipping-info")}
              className="t-caption c-paper/50 hover:c-gold transition-colors text-left"
            >
              Shipping
            </button>
            <button
              onClick={() => go("/returns")}
              className="t-caption c-paper/50 hover:c-gold transition-colors text-left"
            >
              Returns
            </button>
            <button
              onClick={() => go("/privacy")}
              className="t-caption c-paper/50 hover:c-gold transition-colors text-left"
            >
              Privacy
            </button>
            <button
              onClick={() => go("/terms")}
              className="t-caption c-paper/50 hover:c-gold transition-colors text-left"
            >
              Terms
            </button>
            <button
              onClick={() => go("/contact")}
              className="t-caption c-paper/50 hover:c-gold transition-colors text-left"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
