/**
 * Shop page loading skeleton — grid of product card placeholders.
 */

export default function ShopLoading() {
  return (
    <div className="bg-canvas">
      {/* Hero skeleton */}
      <div className="aspect-[3/1] bg-cream-deep animate-pulse" />

      <div className="container-aura py-8">
        {/* Title skeleton */}
        <div className="h-8 w-48 bg-cream-deep rounded animate-pulse mb-8" />

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] bg-cream-deep rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-cream-deep rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-cream-deep rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
