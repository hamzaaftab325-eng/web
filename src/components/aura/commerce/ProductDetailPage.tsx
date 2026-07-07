"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronDown,
  Check,
  Truck,
  RotateCcw,
  Shield,
  Heart,
  Ruler,
  Plus,
  Minus,
  Loader2,
  ShoppingBag,
  FolderOpen,
} from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import { cn, formatPrice, sleep } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/queries/use-products";
import AuraChip from "@/components/aura/ui/Chip";
import { ReadAloud } from "@/components/aura/ui/ReadAloud";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { ProductCard } from "./ProductCard";
import { ProductGallery } from "./ProductGallery";
import { ProductShare } from "./ProductShare";
import { Badge } from "@/components/aura/ui/Badge";
import { SocialProof } from "./SocialProof";
import { SizeGuide } from "./SizeGuide";
import { ReviewsSection } from "./ReviewsSection";
import { QandASection } from "./QandASection";
import { BackInStockForm } from "./BackInStockForm";
import { RecentlyViewed } from "./RecentlyViewed";
import { StickyMobileAddToCart } from "./StickyMobileAddToCart";

interface ProductDetailPageProps {
  product: Product;
  onBack?: () => void;
}

const formatSku = (id: string) =>
  `AURA-${id.split("-").map((p) => p.toUpperCase()).join("-")}`;

const formatCategory = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" & ");

export function ProductDetailPage({ product, onBack }: ProductDetailPageProps) {
  const prefersReducedMotion = useReducedMotion();
  const { toast } = useToast();
  const addToCart = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.openCart);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.slugs.includes(product.slug));
  const router = useRouter();
  const setCategory = useUIStore((s) => s.setCategory);
  const { add: addRecentlyViewed } = useRecentlyViewed();

  // Phase 5A: Embla carousel state moved to <ProductGallery /> component.
  // Phase 5A: selectedSlide + imgLoaded state moved to <ProductGallery />.

  // Local UI state
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [addingState, setAddingState] = useState<"idle" | "loading" | "success">(
    "idle"
  );
  const [openSection, setOpenSection] = useState<string | null>("description");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  // Phase 5D: Removed imgLoaded state — now managed inside <ProductGallery />
  // Phase 5D: Removed prevId state-during-render pattern — parent now passes
  // key={product.id} which remounts the component on product change, naturally
  // resetting all local state (quantity, variant, addingState, openSection, selectedSlide).

  // Scroll to top when the PDP mounts.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [product.id, prefersReducedMotion]);

  // Track this product in the recently-viewed list whenever it changes.
  useEffect(() => {
    if (product.slug) addRecentlyViewed(product.slug);
  }, [product.slug, addRecentlyViewed]);

  // Phase 5A: Embla onSelect callback + event listeners moved to <ProductGallery />.

  const onAddToCart = async () => {
    if (!product.inStock) return;
    setAddingState("loading");
    await sleep(350);
    addToCart(product, { quantity, variant });
    setAddingState("success");
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name}${variant ? ` (${variant.label})` : ""}`,
    });
    await sleep(1300);
    setAddingState("idle");
  };

  const onWishlist = () => {
    toggleWish(product.slug);
    toast({
      title: isWished ? "Removed from wishlist" : "Saved to wishlist",
      description: product.name,
    });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/shop");
    }
  };

  const onBreadcrumbCategory = () => {
    setCategory(product.category);
    router.push("/shop");
  };

  const { data: productData } = useProducts({ category: product.category, limit: 5 });
  const related = (productData?.products ?? [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const onSale =
    product.compareAtPrice && product.compareAtPrice > product.price;

  const unitPrice = product.price;

  const accordionSections = [
    {
      id: "description",
      label: "Description",
      content: (
        <div className="space-y-4">
          <p className="t-body c-ink-muted leading-relaxed">
            {product.longDescription || product.description}
          </p>
          <ReadAloud text={product.longDescription || product.description} />
        </div>
      ),
    },
    {
      id: "materials",
      label: "Materials & Care",
      content: (
        <div className="space-y-3">
          {product.materials && product.materials.length > 0 && (
            <div>
              <p className="t-label-caps c-ink-faint mb-2">Materials</p>
              <ul className="space-y-1">
                {product.materials.map((m) => (
                  <li key={m} className="t-body c-ink-muted">
                    · {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {product.careInstructions && (
            <div className={cn(product.materials && "mt-4")}>
              <p className="t-label-caps c-ink-faint mb-2">Care</p>
              <p className="t-body c-ink-muted leading-relaxed">
                {product.careInstructions}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "dimensions",
      label: "Dimensions",
      content: (
        <div className="space-y-3">
          <p className="t-body c-ink-muted leading-relaxed">
            {product.dimensions || "Dimensions vary by piece — see size guide for details."}
          </p>
          <button
            onClick={() => setSizeGuideOpen(true)}
            className="inline-flex items-center gap-2 t-body-sm c-gold-deep hover:c-ink transition-colors link-underline"
          >
            <Ruler size={14} strokeWidth={1.5} />
            Open size guide
          </button>
        </div>
      ),
    },
    {
      id: "shipping",
      label: "Shipping & Returns",
      content: (
        <div className="space-y-3 t-body c-ink-muted leading-relaxed">
          <p>
            In-stock items ship within 1-2 business days via insured ground.
            Larger pieces ship via white-glove freight in 5-10 business days.
          </p>
          <p>
            Returns accepted within 30 days of delivery in original condition.
            Living plants are final sale. See full policy at checkout.
          </p>
        </div>
      ),
    },
  ];

  return (
    <article className="bg-canvas pb-20 lg:pb-0">
      {/* Top bar: Back + Share — padded to clear the fixed Header (60px mobile / 72px desktop) */}
      <div className="border-b border-hairline pt-[60px] md:pt-[72px]">
        <div className="container-aura flex items-center justify-between py-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            Back
          </button>
          <ProductShare title={product.name} />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container-aura pt-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 t-caption c-ink-faint">
          <button
            onClick={() => router.push("/")}
            className="hover:c-gold-deep transition-colors"
          >
            Home
          </button>
          <span aria-hidden="true">/</span>
          <button
            onClick={onBreadcrumbCategory}
            className="hover:c-gold-deep transition-colors"
          >
            {formatCategory(product.category)}
          </button>
          <span aria-hidden="true">/</span>
          <span className="c-ink-muted truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main two-column layout */}
      <div className="container-aura pt-6 lg:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-10">
          {/* Gallery — Phase 5A: Extracted to <ProductGallery /> */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Info */}
          <div className="lg:col-span-5 mt-8 lg:mt-0 flex flex-col">
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              {product.badge && <Badge kind={product.badge} className="text-[0.7rem]" />}
              {!product.inStock && <Badge kind="Sold Out" className="text-[0.7rem]" />}
            </div>
            <TextBlurReveal
              as="h1"
              className="t-display-md c-ink mb-3 leading-tight"
              trigger="mount"
            >
              {product.name}
            </TextBlurReveal>
            {product.subtitle && (
              <p className="t-body-lg c-ink-muted italic mb-4">{product.subtitle}</p>
            )}

            {/* SKU + price row */}
            <div className="flex items-baseline justify-between flex-wrap gap-3 mb-3">
              <div className="flex items-baseline gap-3">
                <span className="t-headline-sm c-ink t-num font-medium">
                  {formatPrice(product.price)}
                </span>
                {onSale && (
                  <span className="t-body c-ink-faint line-through t-num">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                )}
                {onSale && (
                  <span className="t-label-caps c-gold">
                    Save {formatPrice(product.compareAtPrice! - product.price)}
                  </span>
                )}
              </div>
              <span className="t-caption c-ink-faint t-label-caps">
                SKU {formatSku(product.id)}
              </span>
            </div>

            {/* Social proof */}
            <SocialProof productName={product.name} className="mb-6" />

            <p className="t-body c-ink-muted leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="t-label-caps c-ink-faint">
                    {product.subtitle ? "Finish" : "Variant"}
                  </p>
                  {variant && (
                    <span className="t-body-sm c-ink-muted">{variant.label}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const selected = variant?.id === v.id;
                    return (
                      <AuraChip
                        key={v.id}
                        asButton
                        pressed={selected}
                        onClick={() => setVariant(v)}
                        aria-label={`Select ${v.label}`}
                      >
                        {v.swatch && (
                          <svg
                            viewBox="0 0 12 12"
                            className="w-3 h-3"
                            aria-hidden="true"
                          >
                            <circle cx="6" cy="6" r="6" fill={v.swatch} />
                          </svg>
                        )}
                        {v.label}
                      </AuraChip>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart OR Back-in-stock form */}
            {product.inStock ? (
              <>
                <div className="flex items-stretch gap-3 mb-3">
                  {/* Quantity selector */}
                  <div className="inline-flex items-center border border-hairline rounded-sm bg-paper">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="h-12 w-12 flex items-center justify-center c-ink hover:c-gold-deep disabled:opacity-30 transition-colors"
                    >
                      <Minus size={14} strokeWidth={1.5} />
                    </button>
                    <span className="w-10 text-center t-body c-ink t-num font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(q + 1, product.stockQuantity ?? 99))}
                      disabled={product.stockQuantity ? quantity >= product.stockQuantity : false}
                      aria-label="Increase quantity"
                      className="h-12 w-12 flex items-center justify-center c-ink hover:c-gold-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} strokeWidth={1.5} />
                    </button>
                  </div>

                  <button
                    onClick={onAddToCart}
                    disabled={addingState !== "idle"}
                    className={cn(
                      "flex-1 h-12 px-6 flex items-center justify-center gap-2 t-label-caps transition-all relative overflow-hidden rounded-sm btn-hover-spacing",
                      addingState === "idle"
                        ? "bg-ink c-paper"
                        : addingState === "loading"
                        ? "bg-ink c-paper opacity-85"
                        : "bg-success c-paper"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {addingState === "idle" && (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-2"
                        >
                          <ShoppingBag size={14} strokeWidth={1.5} />
                          Add to Cart · {formatPrice(unitPrice * quantity)}
                        </motion.span>
                      )}
                      {addingState === "loading" && (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-2"
                        >
                          <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
                          Adding
                        </motion.span>
                      )}
                      {addingState === "success" && (
                        <motion.span
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-2"
                        >
                          <Check size={16} strokeWidth={2} />
                          Added — view cart
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>

                {/* Quick view-cart link on success */}
                <AnimatePresence>
                  {addingState === "success" && (
                    <motion.button
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={openCart}
                      className="w-full text-center t-body-sm c-gold-deep hover:c-ink transition-colors link-underline mb-3"
                    >
                      Open your cart
                    </motion.button>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="mb-3">
                <BackInStockForm productName={product.name} />
              </div>
            )}

            {/* Wishlist + Size guide + Category link */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
              <button
                onClick={onWishlist}
                className="inline-flex items-center gap-2 t-body c-ink-muted hover:c-gold-deep transition-colors link-underline"
              >
                <Heart
                  size={16}
                  strokeWidth={1.25}
                  className={cn(isWished && "fill-gold c-gold")}
                />
                {isWished ? "Saved to wishlist" : "Save to wishlist"}
              </button>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="inline-flex items-center gap-2 t-body c-ink-muted hover:c-gold-deep transition-colors link-underline"
              >
                <Ruler size={16} strokeWidth={1.25} />
                Size guide
              </button>
              {product.category && (
                <Link
                  href={`/shop?category=${product.category}`}
                  className="inline-flex items-center gap-2 t-body c-ink-muted hover:c-gold-deep transition-colors link-underline"
                >
                  <FolderOpen size={16} strokeWidth={1.25} />
                  Browse {formatCategory(product.category)}
                </Link>
              )}
            </div>

            {/* Reassurance */}
            <div className="grid grid-cols-3 gap-3 mb-8 py-5 border-y border-hairline">
              {[
                { icon: Truck, label: "Ships in 1-2 days" },
                { icon: RotateCcw, label: "30-day returns" },
                { icon: Shield, label: "Lifetime care" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <item.icon
                    size={20}
                    strokeWidth={1.25}
                    className="mx-auto c-ink mb-2"
                  />
                  <p className="t-caption c-ink-muted">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Accordions */}
            <div className="space-y-1">
              {accordionSections.map((section) => {
                const isOpen = openSection === section.id;
                return (
                  <div
                    key={section.id}
                    className="border-b border-hairline"
                  >
                    <button
                      onClick={() =>
                        setOpenSection(isOpen ? null : section.id)
                      }
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="t-headline-sm c-ink">{section.label}</span>
                      <ChevronDown
                        size={18}
                        strokeWidth={1.25}
                        className={cn(
                          "c-ink transition-transform duration-300",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pb-5">{section.content}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 lg:mt-24">
        <ReviewsSection productName={product.name} productSlug={product.slug} />
      </div>

      {/* Q&A */}
      <div className="mt-16 lg:mt-24">
        <QandASection productSlug={product.slug} productName={product.name} />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="container-aura section-stack">
          <div className="flex items-center gap-4 mb-8">
            <span className="block h-px w-12 bg-gold" />
            <span className="t-label-caps c-gold-deep">You may also like</span>
          </div>
          <TextBlurReveal as="h2" className="t-display-md c-ink mb-8">
            Pieces that pair
          </TextBlurReveal>
          <RevealOnScroll direction="up" stagger={0.08} className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </RevealOnScroll>
        </section>
      )}

      {/* Recently viewed */}
      <RecentlyViewed excludeSlug={product.slug} />

      {/* Size guide modal */}
      <SizeGuide
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        dimensions={product.dimensions}
        materials={product.materials}
      />

      {/* Sticky mobile add-to-cart */}
      <StickyMobileAddToCart
        product={product}
        variantLabel={variant?.label}
        quantity={quantity}
      />
    </article>
  );
}

export default ProductDetailPage;
