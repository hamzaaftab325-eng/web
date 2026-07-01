/**
 * app/loading.tsx — global loading skeleton shown while any route segment loads.
 * Matches the site's design system (cream bg, gold shimmer).
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Loader ring */}
        <div className="aura-loader-ring">
          <span className="aura-loader-dot" />
        </div>
        {/* Brand text */}
        <p className="t-label-caps c-ink-faint">Aura Living</p>
      </div>
    </div>
  );
}
