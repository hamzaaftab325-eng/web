"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, Plus, Check, ShoppingBag } from "lucide-react";

import type { Product } from "@/types";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useCartStore } from "@/store/use-cart-store";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, cn } from "@/lib/utils";
import { getCardUrl } from "@/lib/cloudinary-client";
import { Badge } from "@/components/aura/ui/Badge";

/**
 * Minimal product shape that ProductCard needs.
 * Accepts both the full `Product` type and the lighter `ProductListItem`
 * returned by the product service (which uses `category: string` instead
 * of `category: CategorySlug`). ProductCard doesn't use the category field,
 * so the looser type is safe.
 */
type ProductCardProduct = Pick<
  Product,
  "id" | "slug" | "name" | "subtitle" | "price" | "compareAtPrice" | "badge" | "inStock" | "images"
>;

interface ProductCardProps {
  product: ProductCardProduct;
  priority?: boolean;
}

/**
 * Phase 5B: Wrapped in React.memo + changed cart selector.
 *
 * Previously: `const cartLines = useCartStore((s) => s.lines)` — every cart
 * mutation re-rendered EVERY visible ProductCard (because the lines array
 * identity changed). On /shop with 24+ cards, this was 24 wasted re-renders
 * per cart add.
 *
 * Now: selector returns only the relevant line for THIS product. Cart mutations
 * only re-render the card whose product is in the cart.
 *
 * React.memo prevents re-renders when parent re-renders but props are unchanged.
 */
export const ProductCard = memo(function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const toggleWish = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.slugs.includes(product.slug));
  const addToCart = useCartStore((s) => s.addLine);
  // Phase 5B: Select only the cart line for THIS product — not the entire lines array.
  // This prevents N re-renders per cart mutation on /shop.
  const cartLine = useCartStore(
    (s) => s.lines.find((l) => l.productId === product.id || l.slug === product.slug) ?? null,
  );
  const prefersReducedMotion = useReducedMotion();
  const { toast } = useToast();

  const [imgLoaded, setImgLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isInCart = Boolean(cartLine);
  const cartQty = cartLine?.quantity ?? 0;

  const open = () => router.push(`/product/${product.slug}`);

  const onAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product, { quantity: 1 });
    // Brief "Added" feedback
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    toast({
      title: "Added to cart",
      description: product.name,
    });
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
      className="group cursor-pointer product-card-compact"
      onClick={open}
      aria-label={`${product.name} — view details`}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-cream product-card-image">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-cream to-cream-deep animate-pulse" />
        )}
        <motion.img
          src={product.images?.[0] ? getCardUrl(product.images[0]) : "/hero/placeholder.webp"}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setImgLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            imgLoaded ? "opacity-100" : "opacity-0",
            prefersReducedMotion ? "" : "group-hover:scale-[1.03]"
          )}
        />

        {/* Badge — auto-show "Sold Out" when out of stock */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.badge && <Badge kind={product.badge} />}
          {!product.inStock && <Badge kind="Sold Out" />}
        </div>

        {/* Wishlist */}
        <button
          onClick={onWish}
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-4 right-4 z-20 p-2 bg-paper/80 backdrop-blur-sm rounded-full hover:bg-paper transition-colors"
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

        {/* Quick add — always visible on mobile, hover-reveal on desktop */}
        {product.inStock && (
          <motion.button
            onClick={onAdd}
            initial={false}
            whileHover={{ backgroundColor: "rgba(17,17,17,0.92)" }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            className={cn(
              "absolute left-4 right-4 bottom-4 z-20 backdrop-blur-sm t-label-caps",
              "py-3.5 flex items-center justify-center gap-2 transition-all duration-300",
              /* Always visible on touch devices (no hover); hover-reveal on desktop */
              "opacity-100 lg:opacity-0 lg:group-hover:opacity-100",
              justAdded
                ? "bg-success/90 c-paper"
                : "bg-ink/85 c-paper"
            )}
            aria-label={`Quick add ${product.name} to cart`}
          >
            {justAdded ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                Added
              </>
            ) : isInCart ? (
              <>
                <ShoppingBag size={14} strokeWidth={1.5} />
                Add More
              </>
            ) : (
              <>
                <Plus size={14} strokeWidth={1.5} />
                Quick Add
              </>
            )}
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
        {/* Show cart quantity indicator below price when item is in cart */}
        {isInCart && cartQty > 0 && (
          <p className="t-caption c-gold-deep mt-1.5 flex items-center gap-1">
            <ShoppingBag size={11} strokeWidth={1.5} />
            {cartQty} in cart
          </p>
        )}
      </div>
    </motion.article>
  );
});

export default ProductCard;