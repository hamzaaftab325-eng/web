"use client";

import { motion } from "framer-motion";

import { EmptyState } from "@/components/aura/ui/EmptyState";
import type { Product } from "@/types";

import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  priorityCount?: number;
}

export function ProductGrid({ products, priorityCount = 0 }: ProductGridProps) {
  if (!products.length) {
    return (
      <EmptyState
        title="No pieces match this filter."
        body="Try clearing a filter or two."
      />
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 product-grid-container"
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </motion.div>
  );
}

export default ProductGrid;
