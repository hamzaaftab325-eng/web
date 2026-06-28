/**
 * app/loading.tsx — branded route-level loader (server component).
 *
 * Shows while route segments are loading. A simple, calm pulse
 * using the Aura gold accent. Uses CSS animations only (no
 * framer-motion) so it can be a server component.
 */

export default function Loading() {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center bg-canvas"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="aura-loader-ring">
          <span className="aura-loader-dot" />
        </div>
        <p className="t-label-caps c-ink-faint">Loading</p>
      </div>
    </div>
  );
}
