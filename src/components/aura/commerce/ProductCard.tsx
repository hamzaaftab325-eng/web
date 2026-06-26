"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";
import { useUIStore } from "@/store/use-ui-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useCartStore } from "@/store/use-cart-store";
import { formatPrice, cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const openProduct = useUIStore((s) => s.openProduct);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.slugs.includes(product.slug));
  const addToCart = useCartStore((s) => s.addLine);
  const prefersReducedMotion = useReducedMotion();

  const [imgLoaded, setImgLoaded] = useState(false);

  const open = () => openProduct(product.slug);

  const onAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product, { quantity: 1 });
  };

  const onWish = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWish(product.slug);
  };

  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <motion.article
      layout={!prefersReducedMotion}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      className="group cursor-pointer"
      onClick={open}
      aria-label={`${product.name} — view details`}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-cream to-cream-deep animate-pulse" />
        )}
        <motion.img
          src={product.images[0]}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setImgLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            imgLoaded ? "opacity-100" : "opacity-0",
            prefersReducedMotion ? "" : "group-hover:scale-[1.03]"
          )}
        />

        {/* Badge */}
        {product.badge && (
          <span
            className={cn(
              "absolute top-4 left-4 t-label-caps px-2.5 py-1.5",
              product.badge === "Sold Out" && "bg-ink c-paper",
              product.badge === "Sale" && "bg-gold c-paper",
              product.badge === "New" && "bg-paper c-ink border border-hairline",
              product.badge === "Bestseller" && "bg-paper c-ink border border-hairline"
            )}
          >
            {product.badge}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={onWish}
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-4 right-4 p-2 bg-paper/80 backdrop-blur-sm rounded-full hover:bg-paper transition-colors"
        >
          <motion.span
            animate={isWished ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="block"
          >
            <Heart
              size={18}
              strokeWidth={1.25}
              className={cn(isWished ? "fill-gold c-gold" : "c-ink")}
            />
          </motion.span>
        </button>

        {/* Quick add */}
        {product.inStock && (
          <motion.button
            onClick={onAdd}
            initial={false}
            whileHover={{ backgroundColor: "rgba(17,17,17,0.92)" }}
            className={cn(
              "absolute left-4 right-4 bottom-4 bg-ink/85 backdrop-blur-sm c-paper t-label-caps",
              "py-3.5 flex items-center justify-center gap-2 transition-opacity duration-300",
              prefersReducedMotion
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            )}
            aria-label={`Quick add ${product.name} to cart`}
          >
            <Plus size={14} strokeWidth={1.5} />
            Quick Add
          </motion.button>
        )}
      </div>

      {/* Text */}
      <div className="pt-4">
        <p className="t-caption c-ink-faint mb-1">{product.subtitle}</p>
        <h3 className="t-headline-sm c-ink mb-1.5">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="t-body c-ink t-num font-medium">{formatPrice(product.price)}</span>
          {onSale && (
            <span className="t-body-sm c-ink-faint line-through t-num">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;
