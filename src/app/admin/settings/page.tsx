"use client";

export default function AdminSettings() {
  return (
    <div className="p-8">
      <h1 className="t-display-md c-ink mb-8">Settings</h1>
      <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-8">
        <h2 className="t-headline-md c-ink mb-4">Store Configuration</h2>
        <div className="space-y-4">
          <div>
            <p className="t-label-caps c-ink-faint mb-1">Currency</p>
            <p className="t-body c-ink">PKR (₨) — Pakistani Rupee</p>
          </div>
          <div>
            <p className="t-label-caps c-ink-faint mb-1">Payment Method</p>
            <p className="t-body c-ink">COD (Cash on Delivery)</p>
          </div>
          <div>
            <p className="t-label-caps c-ink-faint mb-1">Country</p>
            <p className="t-body c-ink">Pakistan</p>
          </div>
          <div>
            <p className="t-label-caps c-ink-faint mb-1">Database</p>
            <p className="t-body c-ink">Supabase (PostgreSQL)</p>
          </div>
          <div>
            <p className="t-label-caps c-ink-faint mb-1">Image Hosting</p>
            <p className="t-body c-ink">Cloudinary</p>
          </div>
        </div>
        <p className="t-body-sm c-ink-faint mt-6">Full settings panel coming in B10. Manage promo codes, shipping methods, and marketing config in Supabase dashboard.</p>
      </div>
    </div>
  );
}
