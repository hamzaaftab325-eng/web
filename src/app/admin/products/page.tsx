"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Package, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  stockQuantity: number;
  inStock: boolean;
  isActive: boolean;
  featured: boolean;
  category?: { name: string; slug: string } | null;
  images: string[];
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "lowstock">("all");

  useEffect(() => {
    fetch("/api/admin/products?limit=200")
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && p.isActive) ||
      (filter === "inactive" && !p.isActive) ||
      (filter === "lowstock" && p.stockQuantity < 5);
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { key: "all" as const, label: "All", count: products.length },
    { key: "active" as const, label: "Active", count: products.filter((p) => p.isActive).length },
    { key: "inactive" as const, label: "Inactive", count: products.filter((p) => !p.isActive).length },
    { key: "lowstock" as const, label: "Low Stock", count: products.filter((p) => p.stockQuantity < 5).length },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this product? It will be hidden from the shop but kept in the database.")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.map((p) => (p.id === id ? { ...p, isActive: false, inStock: false } : p)));
      }
    } catch { /* ignore */ }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />Catalog
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Products</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">Manage your atelier's catalog — pricing, inventory, and visibility.</p>
          </div>
          <Link
            href="/admin/products/new"
            className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors shadow-premium flex-shrink-0"
          >
            <Plus size={16} strokeWidth={1.5} className="group-hover:rotate-90 transition-transform" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-gradient-to-r from-cream to-cream-deep rounded-full border border-hairline-cream">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-4 py-2 t-body-sm rounded-full transition-all duration-300 flex items-center gap-2",
                filter === f.key
                  ? "bg-gradient-to-r from-gold-pale to-cream c-gold-deep font-semibold shadow-gold-glow border border-gold/20"
                  : "c-ink-faint hover:c-ink hover:bg-cream/50"
              )}
            >
              {f.label}
              <span className={cn("t-caption t-num px-1.5 py-0.5 rounded-full", filter === f.key ? "bg-gold c-paper" : "bg-cream-deep")}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Products list */}
      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <Package size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">
            {products.length === 0 ? "No products yet" : "No matches found"}
          </p>
          <p className="t-body c-ink-muted mb-6">
            {products.length === 0
              ? "Add your first product to start building your catalog."
              : "Try a different search term or filter."}
          </p>
          {products.length === 0 && (
            <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
              <Plus size={14} /> Add Your First Product
            </Link>
          )}
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {filtered.map((product) => (
            <motion.div
              key={product.id}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="group bg-gradient-card-warm border border-hairline-cream rounded-sm p-5 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Thumbnail */}
                <div className="relative w-16 h-16 bg-cream border border-hairline-cream overflow-hidden flex-shrink-0 rounded-sm">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} strokeWidth={1} className="c-ink-faint" />
                    </div>
                  )}
                  {!product.isActive && (
                    <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
                      <EyeOff size={16} className="c-paper" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="t-body c-ink font-medium truncate">{product.name}</p>
                    {product.featured && (
                      <span className="chip bg-gold-pale c-gold-deep t-label-caps">Featured</span>
                    )}
                    {product.stockQuantity < 5 && product.isActive && (
                      <span className="inline-flex items-center gap-1 chip bg-error/10 c-error t-label-caps">
                        <AlertCircle size={10} /> Low Stock
                      </span>
                    )}
                    {!product.isActive && (
                      <span className="chip bg-cream-deep c-ink-faint t-label-caps">Inactive</span>
                    )}
                  </div>
                  <p className="t-caption c-ink-faint">
                    {product.category?.name ?? "Uncategorized"} · /{product.slug}
                  </p>
                </div>

                {/* Price + Stock */}
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="text-left md:text-right">
                    <p className="t-body c-ink t-num font-medium">{formatPrice(product.price)}</p>
                    <p className="t-caption c-ink-faint">Price</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className={cn("t-body t-num font-medium", product.stockQuantity === 0 ? "c-error" : product.stockQuantity < 5 ? "c-gold-deep" : "c-ink")}>
                      {product.stockQuantity}
                    </p>
                    <p className="t-caption c-ink-faint">In stock</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                    className="p-2.5 c-ink-faint hover:c-gold-deep hover:bg-gold-pale/50 rounded-sm transition-all"
                    aria-label="Edit product"
                  >
                    <Edit size={16} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2.5 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all"
                    aria-label="Deactivate product"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
