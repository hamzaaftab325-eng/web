"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface AdminProduct {
  id: string; slug: string; name: string; price: number; stockQuantity: number;
  inStock: boolean; isActive: boolean; category?: { name: string };
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/products?limit=200")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="t-display-md c-ink">Products</h1>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-4 py-2.5 rounded-sm hover:bg-gold-deep transition-colors">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="mb-6 relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 c-ink-faint" />
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold" />
      </div>

      <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline-cream">
              <th className="text-left p-4 t-label-caps c-ink-faint">Name</th>
              <th className="text-left p-4 t-label-caps c-ink-faint">Category</th>
              <th className="text-right p-4 t-label-caps c-ink-faint">Price</th>
              <th className="text-right p-4 t-label-caps c-ink-faint">Stock</th>
              <th className="text-center p-4 t-label-caps c-ink-faint">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center t-body c-ink-faint">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center t-body c-ink-faint">No products found</td></tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="border-b border-hairline-cream last:border-b-0 hover:bg-cream/40">
                  <td className="p-4 t-body-sm c-ink">{product.name}</td>
                  <td className="p-4 t-body-sm c-ink-muted">{product.category?.name ?? "—"}</td>
                  <td className="p-4 t-body-sm c-ink t-num text-right">{formatPrice(product.price)}</td>
                  <td className="p-4 t-body-sm t-num text-right">
                    <span className={product.stockQuantity < 5 ? "c-error" : "c-ink"}>{product.stockQuantity}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/products/${product.id}/edit`} className="p-2 c-ink-faint hover:c-gold-deep transition-colors">
                        <Edit size={14} />
                      </Link>
                      <button onClick={async () => {
                        if (confirm("Delete this product?")) {
                          await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
                          setProducts(products.filter(p => p.id !== product.id));
                        }
                      }} className="p-2 c-ink-faint hover:c-error transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
