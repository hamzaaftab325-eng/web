"use client";

import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { motion } from "framer-motion";

interface ProductGridProps {
  products: Product[];
  priorityCount?: number;
}

export function ProductGrid({ products, priorityCount = 0 }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="py-20 text-center">
        <p className="t-headline-md c-ink-muted">No pieces match this filter.</p>
        <p className="t-body c-ink-faint mt-2">Try clearing a filter or two.</p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </motion.div>
  );
}

export default ProductGrid;
