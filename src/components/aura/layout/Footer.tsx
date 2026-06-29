"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Instagram, Mail } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { useCategories, useCollections } from "@/hooks/queries/use-catalog";

export function Footer() {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { data: collections = [] } = useCollections();
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 4000);
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
                <a
                  href="mailto:concierge@auraliving.com"
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Discover */}
          <div className="md:col-span-2">
            <p className="t-label-caps c-paper/50 mb-4">Discover</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => go("/artisans")}
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline text-left"
                >
                  Artisans
                </button>
              </li>
              <li>
                <button
                  onClick={() => go("/sustainability")}
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline text-left"
                >
                  Sustainability
                </button>
              </li>
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
                  href="tel:+923001234567"
                  className="t-body c-paper/80 hover:c-gold transition-colors link-underline"
                >
                  +92 300 1234567
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
            <button
              onClick={() => go("/care")}
              className="t-caption c-paper/50 hover:c-gold transition-colors text-left"
            >
              Shipping
            </button>
            <button
              onClick={() => go("/care")}
              className="t-caption c-paper/50 hover:c-gold transition-colors text-left"
            >
              Returns
            </button>
            <a href="#" className="t-caption c-paper/50 hover:c-gold transition-colors">
              Privacy
            </a>
            <a href="#" className="t-caption c-paper/50 hover:c-gold transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
