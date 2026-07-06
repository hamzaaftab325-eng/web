/**
 * Product detail page loading skeleton — matches the product page layout.
 */

export default function ProductLoading() {
  return (
    <div className="container-aura pt-[60px] md:pt-[72px] py-6 lg:pt-[72px]">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-16 bg-cream-deep rounded animate-pulse" />
        <span className="c-ink-faint">/</span>
        <div className="h-3 w-20 bg-cream-deep rounded animate-pulse" />
        <span className="c-ink-faint">/</span>
        <div className="h-3 w-32 bg-cream-deep rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-10">
        {/* Gallery skeleton */}
        <div className="lg:col-span-7">
          <div className="aspect-[4/5] bg-cream-deep rounded animate-pulse" />
          <div className="flex gap-2 mt-3">
            <div className="w-16 h-20 bg-cream-deep rounded animate-pulse" />
            <div className="w-16 h-20 bg-cream-deep rounded animate-pulse" />
          </div>
        </div>

        {/* Info skeleton */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 mt-6 lg:mt-0">
          <div className="h-3 w-24 bg-cream-deep rounded animate-pulse mb-3" />
          <div className="h-8 w-3/4 bg-cream-deep rounded animate-pulse mb-3" />
          <div className="h-4 w-1/2 bg-cream-deep rounded animate-pulse mb-6" />
          <div className="h-6 w-28 bg-cream-deep rounded animate-pulse mb-6" />
          <div className="h-4 w-full bg-cream-deep rounded animate-pulse mb-2" />
          <div className="h-4 w-full bg-cream-deep rounded animate-pulse mb-2" />
          <div className="h-4 w-2/3 bg-cream-deep rounded animate-pulse mb-8" />
          <div className="h-12 w-full bg-cream-deep rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
