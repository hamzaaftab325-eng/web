"use client";

import { useState } from "react";
import { Instagram, Mail } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { categories } from "@/data/categories";
import { collections } from "@/data/collections";

export function Footer() {
  const setView = useUIStore((s) => s.setView);
  const setCategory = useUIStore((s) => s.setCategory);
  const setCollection = useUIStore((s) => s.setCollection);
  const resetShop = useUIStore((s) => s.resetShop);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <footer className="bg-ink c-paper mt-auto">
      <div className="container-aura py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand + newsletter */}
          <div className="md:col-span-4">
            <button
              onClick={() => setView("home")}
              className="block text-left mb-6"
              aria-label="Aura Living home"
            >
              <p className="t-display-md c-paper leading-none">Aura</p>
              <p className="t-label-caps c-gold mt-2">Living</p>
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
            </form>
          </div>

          {/* Shop */}
          <div className="md:col-span-2 md:col-start-6">
            <p className="t-label-caps c-paper/50 mb-4">Shop</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    resetShop();
                    setView("shop");
                  }}
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
                  onClick={() => setView("about")}
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView("journal")}
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline"
                >
                  Journal
                </button>
              </li>
              <li>
                <a
                  href="mailto:concierge@auraliving.com"
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline"
                >
                  Trade Program
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-2">
            <p className="t-label-caps c-paper/50 mb-4">Connect</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline inline-flex items-center gap-2"
                >
                  <Instagram size={16} strokeWidth={1.25} />
                  @auraliving
                </a>
              </li>
              <li>
                <a
                  href="mailto:concierge@auraliving.com"
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline"
                >
                  concierge@auraliving.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+15035550142"
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline"
                >
                  +1 (503) 555-0142
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-paper/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="t-caption c-paper/50">
            © {new Date().getFullYear()} Aura Living Atelier. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#" className="t-caption c-paper/50 hover:c-gold transition-colors">
              Privacy
            </a>
            <a href="#" className="t-caption c-paper/50 hover:c-gold transition-colors">
              Terms
            </a>
            <a href="#" className="t-caption c-paper/50 hover:c-gold transition-colors">
              Shipping
            </a>
            <a href="#" className="t-caption c-paper/50 hover:c-gold transition-colors">
              Returns
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
