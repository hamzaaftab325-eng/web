import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline | Aura Living",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-md">
        <p className="t-overline c-gold-deep mb-3">Connection lost</p>
        <h1 className="font-display text-3xl md:text-4xl c-ink mb-4">
          You are offline
        </h1>
        <p className="t-body c-ink-muted mb-8">
          We couldn&apos;t reach the Aura Living atelier. Some pages you have
          visited before may still be available. Please reconnect to continue
          browsing our full collection of considered objects for the considered
          home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 h-12 bg-ink c-paper t-label-caps hover:bg-gold-deep transition-colors"
          >
            Try again
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 h-12 border border-hairline c-ink t-label-caps hover:border-gold transition-colors"
          >
            Browse shop
          </Link>
        </div>
      </div>
    </main>
  );
}
