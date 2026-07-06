/**
 * app/admin/loading.tsx — admin-specific loading skeleton.
 * Shown while admin route segments load (dashboard, products, orders, etc.).
 * Features a simple table-row skeleton that matches the admin layout.
 */

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="aura-loader-ring">
          <span className="aura-loader-dot" />
        </div>
        <p className="t-label-caps c-ink-faint">Loading admin…</p>
      </div>
    </div>
  );
}
