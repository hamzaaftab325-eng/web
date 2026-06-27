"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  ShoppingBag,
  Link2,
  Check,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { AccountLayout } from "./AccountLayout";
import { useUIStore } from "@/store/use-ui-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useCartStore } from "@/store/use-cart-store";
import { cn, formatPrice } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import AuraButton from "@/components/aura/ui/Button";
import { ProductCard } from "@/components/aura/commerce/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { productBySlug } from "@/data/products";
import type { Product } from "@/types";

/**
 * AccountWishlist — grid of saved products with sorting, bulk-add-to-cart,
 * share, and a running total. The wishlist store persists an ordered slug
 * list; we hydrate the full product records via `productBySlug` and filter
 * out any stale slugs that no longer resolve.
 */

type SortKey = "recent" | "price-asc" | "price-desc";

const sortOptions: { key: SortKey; label: string; icon: typeof ArrowUpDown }[] =
  [
    { key: "recent", label: "Recently added", icon: ArrowUpDown },
    { key: "price-asc", label: "Price ↑", icon: ArrowUp },
    { key: "price-desc", label: "Price ↓", icon: ArrowDown },
  ];

export function AccountWishlist() {
  const { setView } = useUIStore();
  const { toast } = useToast();

  const slugs = useWishlistStore((s) => s.slugs);
  const removeFromWishlist = useWishlistStore((s) => s.remove);
  const clearWishlist = useWishlistStore((s) => s.clear);
  const addLine = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.openCart);

  const [sort, setSort] = useState<SortKey>("recent");
  const [adding, setAdding] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Hydrate and de-dupe — guard against slugs that no longer map to a product.
  const products = useMemo<Product[]>(() => {
    const resolved: Product[] = [];
    for (const slug of slugs) {
      const p = productBySlug(slug);
      if (p) resolved.push(p);
    }
    return resolved;
  }, [slugs]);

  // Sort — "recent" preserves insertion order (newest first when reversed).
  const sorted = useMemo<Product[]>(() => {
    const list = [...products];
    if (sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else {
      // Most recently added first — store appends to the tail.
      list.reverse();
    }
    return list;
  }, [products, sort]);

  const totalValue = useMemo(
    () => sorted.reduce((sum, p) => sum + p.price, 0),
    [sorted]
  );

  const inStockCount = useMemo(
    () => sorted.filter((p) => p.inStock).length,
    [sorted]
  );

  const handleAddAll = async () => {
    if (sorted.length === 0) return;
    setAdding(true);
    const inStock = sorted.filter((p) => p.inStock);
    if (inStock.length === 0) {
      toast({
        title: "Nothing to add",
        description: "Your wishlist is fully sold out at the moment.",
      });
      setAdding(false);
      return;
    }
    // Simulate a short async so the button shows feedback.
    await new Promise((r) => setTimeout(r, 450));
    inStock.forEach((p) => addLine(p, { quantity: 1 }));
    setAdding(false);
    toast({
      title: `${inStock.length} piece${inStock.length === 1 ? "" : "s"} added`,
      description: "Your wishlist is on its way to your cart.",
    });
    openCart();
  };

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/?wishlist=${slugs.join(",")}`
        : "";
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers / insecure contexts.
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setShareCopied(true);
      toast({
        title: "Wishlist link copied",
        description: "Share it with anyone who asks what you're dreaming of.",
      });
      setTimeout(() => setShareCopied(false), 2200);
    } catch {
      toast({
        title: "Couldn't copy link",
        description: "Please copy the URL from your browser's address bar.",
      });
    }
  };

  const handleClearAll = () => {
    clearWishlist();
    toast({
      title: "Wishlist cleared",
      description: "All saved pieces have been removed.",
    });
  };

  return (
    <AccountLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div className="relative">
          <div
            className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none"
            aria-hidden
          />
          <div className="relative">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              Saved Pieces
            </p>
            <TextBlurReveal
              as="h1"
              className="t-display-md c-ink leading-tight"
            >
              Your Wishlist
            </TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg mt-3">
              The pieces you keep coming back to. Add them all to your cart, or
              share the list with someone who loves you.
            </p>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyWishlist onBrowse={() => setView("shop")} />
      ) : (
        <>
          {/* Summary + actions */}
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-5 md:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
              <div className="flex items-center gap-6 flex-1">
                <div>
                  <p className="t-label-caps c-ink-faint mb-1">
                    Pieces saved
                  </p>
                  <p className="t-display-sm c-ink t-num">
                    {sorted.length}
                  </p>
                </div>
                <div className="w-px h-12 bg-hairline-cream" aria-hidden />
                <div>
                  <p className="t-label-caps c-ink-faint mb-1">
                    Total value
                  </p>
                  <p className="t-display-sm c-gold-deep t-num">
                    {formatPrice(totalValue)}
                  </p>
                </div>
                <div className="w-px h-12 bg-hairline-cream hidden sm:block" aria-hidden />
                <div className="hidden sm:block">
                  <p className="t-label-caps c-ink-faint mb-1">
                    In stock
                  </p>
                  <p className="t-display-sm c-ink t-num">
                    {inStockCount}
                    <span className="t-body c-ink-faint ml-1">
                      / {sorted.length}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleShare}
                  aria-label="Share wishlist"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-sm t-label-caps border border-hairline-cream bg-cream/60 c-ink hover:border-gold hover:c-gold-deep hover:shadow-card-modern transition-all duration-300"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {shareCopied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-2"
                      >
                        <Check size={14} strokeWidth={2} />
                        Copied
                      </motion.span>
                    ) : (
                      <motion.span
                        key="share"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-2"
                      >
                        <Share2 size={14} strokeWidth={1.5} />
                        Share
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <button
                  onClick={handleAddAll}
                  disabled={adding}
                  aria-label="Add all wishlist items to cart"
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-sm t-label-caps bg-ink c-paper hover:bg-gold-deep transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                >
                  {adding ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="inline-block"
                      >
                        <Sparkles size={14} strokeWidth={1.5} />
                      </motion.span>
                      Adding…
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} strokeWidth={1.5} />
                      Add All to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sort + secondary actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-1 p-1 bg-gradient-to-r from-cream to-cream-deep rounded-full border border-hairline-cream w-fit">
              {sortOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 t-body-sm rounded-full transition-all duration-300",
                    sort === opt.key
                      ? "bg-gradient-to-r from-gold-pale to-cream c-gold-deep font-semibold shadow-gold-glow border border-gold/20"
                      : "c-ink-faint hover:c-ink hover:bg-cream/50"
                  )}
                >
                  <opt.icon size={13} strokeWidth={1.5} />
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 t-label-caps c-ink-faint hover:c-error transition-colors link-underline w-fit"
            >
              <Trash2 size={13} strokeWidth={1.5} />
              Clear wishlist
            </button>
          </div>

          {/* Grid */}
          <RevealOnScroll
            stagger={0.05}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {sorted.map((product) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="relative group"
              >
                <ProductCard product={product} />
                <button
                  onClick={() => {
                    removeFromWishlist(product.slug);
                    toast({
                      title: "Removed from wishlist",
                      description: product.name,
                    });
                  }}
                  aria-label={`Remove ${product.name} from wishlist`}
                  className="absolute top-3 right-3 z-20 p-2 bg-paper/90 backdrop-blur-sm rounded-full c-ink-faint hover:c-error hover:bg-paper opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 shadow-ambient"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </motion.div>
            ))}
          </RevealOnScroll>

          {/* Footer share hint */}
          <div className="mt-10 bg-gradient-to-br from-gold-pale to-cream border border-hairline-gold rounded-sm p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-gold-glow">
            <div className="w-11 h-11 rounded-full bg-paper flex items-center justify-center ring-1 ring-hairline-gold shrink-0">
              <Link2 size={18} strokeWidth={1.5} className="c-gold-deep" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="t-headline-sm c-ink mb-0.5">
                Share your wishlist
              </p>
              <p className="t-body-sm c-ink-muted">
                Send the link to family, friends, or a partner ahead of a
                celebration. The list updates live as you save new pieces.
              </p>
            </div>
            <AuraButton variant="primary" onClick={handleShare} className="shrink-0">
              <Share2 size={14} strokeWidth={1.5} />
              Copy link
            </AuraButton>
          </div>
        </>
      )}
    </AccountLayout>
  );
}

/** Empty-state component — gold-pale icon circle with a Heart icon. */
function EmptyWishlist({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-10 md:p-16 text-center">
      <div className="w-20 h-20 rounded-full bg-gold-pale flex items-center justify-center ring-1 ring-hairline-gold mx-auto mb-6 shadow-gold-glow">
        <Heart size={28} strokeWidth={1.25} className="c-gold-deep" />
      </div>
      <h3 className="t-headline-sm c-ink mb-2">No saved pieces yet</h3>
      <p className="t-body c-ink-muted max-w-md mx-auto mb-6">
        Tap the heart on any product to keep it here. Your wishlist is a quiet
        shelf — a place to consider before you commit.
      </p>
      <AuraButton onClick={onBrowse}>
        <ShoppingBag size={14} strokeWidth={1.5} />
        Browse the shop
      </AuraButton>
    </div>
  );
}

export default AccountWishlist;
