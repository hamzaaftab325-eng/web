import Link from "next/link";

import { Package, Plus, ChevronRight, AlertCircle } from "lucide-react";

import { db } from "@/lib/db";
import { formatPrice, cn } from "@/lib/utils";

/**
 * Admin Products — Server Component.
 *
 * Phase 4A-2: Converted from "use client" to Server Component.
 * - No loading spinner — data fetched server-side
 * - Shows product table with image, name, price, stock, status
 * - Search/filter can be added as a client component wrapper if needed
 */
export default async function AdminProducts() {
  const products = await db.product.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });

  const total = await db.product.count({ where: { isActive: true } });

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />Products
          </p>
          <h1 className="t-display-sm c-ink leading-tight mb-2">Catalog & Inventory</h1>
          <p className="t-body c-ink-muted">{total} active products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-4 py-2.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"
        >
          <Plus size={14} strokeWidth={1.5} />
          Add Product
        </Link>
      </div>

      {/* Products table */}
      <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
            <p className="t-headline-sm c-ink mb-2">No products yet</p>
            <p className="t-body c-ink-muted mb-6">Add your first product to start selling.</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors"
            >
              <Plus size={14} strokeWidth={1.5} />
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-hairline-cream">
            {products.map((product) => {
              const isLowStock = product.stockQuantity <= 5 && product.stockQuantity > 0;
              const isOutOfStock = product.stockQuantity === 0;
              return (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}/edit`}
                  className="group w-full p-4 flex items-center gap-4 hover:bg-cream/40 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-sm overflow-hidden bg-cream border border-hairline-cream flex-shrink-0">
                    {product.images[0] ? (
                      <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="c-ink-faint" />
                      </div>
                    )}
                  </div>

                  {/* Name + category */}
                  <div className="flex-1 min-w-0">
                    <p className="t-body c-ink font-medium truncate">{product.name}</p>
                    <p className="t-caption c-ink-faint">{product.category?.name ?? "Uncategorized"}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right hidden md:block">
                    <p className="t-body c-ink t-num font-medium">{formatPrice(Number(product.price))}</p>
                    {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                      <p className="t-caption c-ink-faint line-through t-num">{formatPrice(Number(product.compareAtPrice))}</p>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="text-right hidden sm:block">
                    {isOutOfStock ? (
                      <p className="t-body-sm c-error font-medium">Out of stock</p>
                    ) : isLowStock ? (
                      <p className="t-body-sm c-gold-deep font-medium flex items-center gap-1 justify-end">
                        <AlertCircle size={12} />
                        {product.stockQuantity} left
                      </p>
                    ) : (
                      <p className="t-body-sm c-ink-muted">{product.stockQuantity} in stock</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="hidden lg:block">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full t-label-caps border",
                      product.isActive
                        ? "bg-success/10 c-success border-success/20"
                        : "bg-ink-faint/10 c-ink-faint border-hairline"
                    )}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <ChevronRight size={16} strokeWidth={1.5} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
