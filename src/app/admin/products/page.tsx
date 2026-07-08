"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Package, EyeOff, Download, CheckSquare, Square } from "lucide-react";

import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { formatPrice, cn } from "@/lib/utils";

interface AdminProduct {
  id: string; slug: string; name: string; price: number; stockQuantity: number;
  inStock: boolean; isActive: boolean; featured: boolean; variantCount: number;
  category?: { name: string; slug: string } | null; images: string[];
}
interface Category { id: string; name: string; slug: string; }

const inputCls = "w-full pl-12 pr-4 py-3 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchProducts = (p: number = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(p), limit: "20", sort,
      ...(search && { search }),
      ...(categoryFilter !== "all" && { category: categoryFilter }),
      ...(stockFilter !== "all" && { stock: stockFilter }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
    });
    fetch(`/api/admin/products?${params}`)
      .then(r => r.ok ? r.json() : { products: [], total: 0, totalPages: 0 })
      .then(data => {
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setPage(p);
        setSelected(new Set());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.categories ?? []);
        setCategories(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Phase 7E: Inlined fetchProducts to fix exhaustive-deps warning.
    // Previously: fetchProducts was defined outside useEffect and called
    // from inside it, requiring eslint-disable. Now: fetch logic is inline
    // so deps are correct.
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ page: "1", limit: "20" });
      if (search) params.set("search", search);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (stockFilter !== "all") params.set("stock", stockFilter);
      if (sort) params.set("sort", sort);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      fetch(`/api/admin/products?${params}`)
        .then(r => r.json())
        .then(data => { setProducts(data.products ?? []); setTotal(data.total ?? 0); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, stockFilter, sort, minPrice, maxPrice]);

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this product? It will be hidden from the shop but kept in the database.")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts(page);
    } catch { /* ignore */ }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map(p => p.id)));
  };

  const bulkAction = async (action: string) => {
    if (selected.size === 0) return;
    if (!confirm(`${action} ${selected.size} products?`)) return;
    try {
      await fetch("/api/admin/products/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      fetchProducts(page);
    } catch { /* ignore */ }
  };

  const bulkSetCategory = async (categoryId: string) => {
    if (selected.size === 0) return;
    try {
      await fetch("/api/admin/products/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action: "setCategory", categoryId }),
      });
      fetchProducts(page);
    } catch { /* ignore */ }
  };

  const exportCSV = () => {
    window.open("/api/admin/products/export", "_blank");
  };

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Catalog</p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Products</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">{total} product{total === 1 ? "" : "s"} in your catalog.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="inline-flex items-center gap-2 bg-cream-deep c-ink t-label-caps px-4 py-3.5 rounded-sm hover:bg-gold-pale hover:c-gold-deep transition-colors">
              <Download size={14} /> Export
            </button>
            <Link href="/admin/products/new" className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0">
              <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none" />
          <input type="text" placeholder="Search by name or slug..." value={search} onChange={e => setSearch(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-2 t-body-sm c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="px-4 py-2 t-body-sm c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold">
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="px-4 py-2 t-body-sm c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold">
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min ₨" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-24 px-3 py-2 t-body-sm c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold" />
            <span className="t-caption c-ink-faint">to</span>
            <input type="number" placeholder="Max ₨" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-24 px-3 py-2 t-body-sm c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold" />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="bg-ink c-paper rounded-sm px-5 py-3 mb-4 flex items-center gap-4 flex-wrap">
          <span className="t-body-sm font-medium">{selected.size} selected</span>
          <button onClick={() => bulkAction("activate")} className="t-label-caps c-paper/70 hover:c-gold transition-colors">Activate</button>
          <button onClick={() => bulkAction("deactivate")} className="t-label-caps c-paper/70 hover:c-gold transition-colors">Deactivate</button>
          <button onClick={() => bulkAction("feature")} className="t-label-caps c-paper/70 hover:c-gold transition-colors">Feature</button>
          <button onClick={() => bulkAction("unfeature")} className="t-label-caps c-paper/70 hover:c-gold transition-colors">Unfeature</button>
          <select onChange={(e) => { if (e.target.value) { bulkSetCategory(e.target.value); e.target.value = ""; } }} className="px-3 py-1.5 t-label-caps c-ink bg-paper rounded-sm border border-hairline" defaultValue="">
            <option value="" disabled>Set Category</option>
            <option value="none">None</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => bulkAction("delete")} className="t-label-caps c-error hover:c-paper transition-colors ml-auto">Delete</button>
          <button onClick={() => setSelected(new Set())} className="t-label-caps c-paper/50 hover:c-paper">Cancel</button>
        </div>
      )}

      {/* Products list */}
      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div>
      ) : products.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <Package size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No products found</p>
          <p className="t-body c-ink-muted mb-6">Try a different search term or filter, or add a new product.</p>
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors"><Plus size={14} /> Add Product</Link>
        </div>
      ) : (
        <>
          {/* Select all */}
          <div className="flex items-center gap-3 mb-2 px-1">
            <button onClick={selectAll} className="inline-flex items-center gap-2 t-label-caps c-ink-faint hover:c-ink transition-colors">
              {selected.size === products.length && products.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
              {selected.size === products.length && products.length > 0 ? "Deselect All" : "Select All"}
            </button>
          </div>

          <RevealOnScroll stagger={0.03} className="space-y-3">
            {products.map((product) => (
              <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="group bg-gradient-card-warm border border-hairline-cream rounded-sm p-4 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button onClick={() => toggleSelect(product.id)} className="flex-shrink-0 p-1">
                    {selected.has(product.id) ? <CheckSquare size={18} className="c-gold-deep" /> : <Square size={18} className="c-ink-faint" />}
                  </button>

                  {/* Thumbnail */}
                  <div className="relative w-12 h-12 bg-cream border border-hairline-cream overflow-hidden flex-shrink-0 rounded-sm">
                    {product.images[0] ? ( 
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center"><Package size={16} className="c-ink-faint" /></div>)}
                    {!product.isActive && <div className="absolute inset-0 bg-ink/60 flex items-center justify-center"><EyeOff size={14} className="c-paper" /></div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="t-body-sm c-ink font-medium truncate">{product.name}</p>
                      {product.featured && <span className="chip bg-gold-pale c-gold-deep t-label-caps text-[9px] px-1.5 py-0.5">Featured</span>}
                      {product.variantCount > 0 && <span className="chip bg-cream-deep c-ink-faint t-label-caps text-[9px] px-1.5 py-0.5">{product.variantCount} variants</span>}
                      {!product.isActive && <span className="chip bg-cream-deep c-ink-faint t-label-caps text-[9px] px-1.5 py-0.5">Inactive</span>}
                    </div>
                    <p className="t-caption c-ink-faint">{product.category?.name ?? "Uncategorized"} · /{product.slug}</p>
                  </div>

                  {/* Price + Stock */}
                  <div className="text-right hidden md:block">
                    <p className="t-body-sm c-ink t-num font-medium">{formatPrice(product.price)}</p>
                    <p className={cn("t-caption t-num", product.stockQuantity === 0 ? "c-error" : product.stockQuantity < 5 ? "c-gold-deep" : "c-ink-faint")}>{product.stockQuantity} in stock</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => router.push(`/admin/products/${product.id}/edit`)} className="p-2 c-ink-faint hover:c-gold-deep hover:bg-gold-pale/50 rounded-sm transition-all" aria-label="Edit"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all" aria-label="Deactivate"><Trash2 size={14} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </RevealOnScroll>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => fetchProducts(page - 1)} disabled={page <= 1} className="px-4 py-2 t-label-caps c-ink border border-hairline-cream rounded-sm hover:border-gold disabled:opacity-30 disabled:pointer-events-none transition-colors">Previous</button>
              <span className="t-body-sm c-ink-muted px-4">Page {page} of {totalPages}</span>
              <button onClick={() => fetchProducts(page + 1)} disabled={page >= totalPages} className="px-4 py-2 t-label-caps c-ink border border-hairline-cream rounded-sm hover:border-gold disabled:opacity-30 disabled:pointer-events-none transition-colors">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
