"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

/**
 * Product image gallery with Embla carousel + thumbnail strip.
 *
 * Phase 5A: Extracted from ProductDetailPage.tsx (was inline at lines 293-344).
 * Self-contained — manages its own Embla instance, slide selection, and image
 * loading state.
 */

export interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 30,
    dragFree: false,
  });
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] md:aspect-[3/4] bg-cream flex items-center justify-center">
        <p className="t-body c-ink-faint">No images available</p>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-6">
      {/* Main carousel */}
      <div className="overflow-hidden bg-cream" ref={emblaRef}>
        <div className="flex">
          {images.map((src, i) => (
            <div
              key={i}
              className="flex-[0_0_100%] aspect-[4/5] md:aspect-[3/4] relative"
            >
              {!imgLoaded[i] && (
                <div className="absolute inset-0 bg-gradient-to-br from-cream to-cream-deep animate-pulse" />
              )}
              <img
                src={src}
                alt={`${productName} — view ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                onLoad={() =>
                  setImgLoaded((prev) => ({ ...prev, [i]: true }))
                }
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-700",
                  imgLoaded[i] ? "opacity-100" : "opacity-0"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "flex-shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden border-2 transition-colors",
                selectedSlide === i
                  ? "border-gold"
                  : "border-transparent hover:border-hairline-gold"
              )}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
