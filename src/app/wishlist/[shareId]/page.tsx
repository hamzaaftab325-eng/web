"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { getCardUrl } from "@/lib/cloudinary-client";

interface WishlistProduct {
  id: string; slug: string; name: string; price: number;
  images: string[]; badge?: string; inStock: boolean;
}

export default function SharedWishlistPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Decode the user ID from the share ID
    try {
      const userId = Buffer.from(shareId, "base64url").toString("utf-8");
      // Fetch the user's wishlist
      fetch(`/api/wishlist/public?userId=${encodeURIComponent(userId)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.products) setProducts(data.products);
          else setError(true);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [shareId]);

  if (loading) return <div className="min-h-screen bg-canvas flex items-center justify-center"><div className="aura-loader-ring"><span className="aura-loader-dot" /></div></div>;

  if (error || products.length === 0) return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-gold-pale flex items-center justify-center mx-auto mb-6">
          <Heart size={28} strokeWidth={1.25} className="c-gold-deep" />
        </div>
        <h1 className="t-display-md c-ink mb-3">Wishlist not found</h1>
        <p className="t-body c-ink-muted mb-6">This wishlist may have been removed or is no longer shared.</p>
        <Link href="/shop" className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
          Browse the Shop <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas pt-24 md:pt-28 pb-12">
      <div className="container-aura">
        <div className="mb-10 text-center">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />Shared Wishlist<span className="w-6 h-px bg-gold" aria-hidden />
          </p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">{products.length} saved piece{products.length === 1 ? "" : "s"}</TextBlurReveal>
          <p className="t-body c-ink-muted">A curated selection from an Aura Living wishlist.</p>
        </div>

        <RevealOnScroll stagger={0.06} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
              <Link href={`/product/${product.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-cream rounded-sm mb-3">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getCardUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={24} className="c-ink-faint" /></div>
                  )}
                  {product.badge && <span className="absolute top-3 left-3 chip bg-gold-pale c-gold-deep t-label-caps">{product.badge}</span>}
                </div>
                <p className="t-body c-ink font-medium truncate group-hover:c-gold-deep transition-colors">{product.name}</p>
                <p className="t-body-sm c-gold-deep t-num font-medium">{formatPrice(product.price)}</p>
              </Link>
            </motion.div>
          ))}
        </RevealOnScroll>
      </div>
    </div>
  );
}
