"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Check, X, Trash2, MessageSquare, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface Review {
  id: string; authorName: string; authorLocation: string | null;
  rating: number; title: string | null; body: string;
  status: string; verifiedBuyer: boolean; helpfulCount: number;
  createdAt: string;
  product: { name: string; slug: string } | null;
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "c-gold-deep", bg: "bg-gold-pale", label: "Pending" },
  approved: { color: "c-success", bg: "bg-success/10", label: "Approved" },
  rejected: { color: "c-error", bg: "bg-error/10", label: "Rejected" },
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/reviews?limit=100")
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((data) => setReviews(data.reviews ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  const filters = [
    { key: "all", label: "All", count: reviews.length },
    { key: "pending", label: "Pending", count: reviews.filter((r) => r.status === "pending").length },
    { key: "approved", label: "Approved", count: reviews.filter((r) => r.status === "approved").length },
    { key: "rejected", label: "Rejected", count: reviews.filter((r) => r.status === "rejected").length },
  ];

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReviews(reviews.map((r) => (r.id === id ? { ...r, status } : r)));
      }
    } catch { /* ignore */ }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Permanently delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== id));
      }
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />Moderation
          </p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Reviews</TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">Approve, reject, or delete customer reviews before they appear on product pages.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 p-1 bg-gradient-to-r from-cream to-cream-deep rounded-full border border-hairline-cream mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-4 py-2 t-body-sm rounded-full transition-all duration-300 flex items-center gap-2",
              filter === f.key
                ? "bg-gradient-to-r from-gold-pale to-cream c-gold-deep font-semibold shadow-gold-glow border border-gold/20"
                : "c-ink-faint hover:c-ink hover:bg-cream/50"
            )}
          >
            {f.label}
            <span className={cn("t-caption t-num px-1.5 py-0.5 rounded-full", filter === f.key ? "bg-gold c-paper" : "bg-cream-deep")}>{f.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <MessageSquare size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No reviews</p>
          <p className="t-body c-ink-muted">
            {reviews.length === 0 ? "When customers submit reviews, they&apos;ll appear here for moderation." : "No reviews with this status."}
          </p>
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {filtered.map((review) => {
            const status = statusConfig[review.status] ?? statusConfig.pending!;
            return (
              <motion.div
                key={review.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-ink to-ink/80 flex items-center justify-center flex-shrink-0">
                      <span className="t-label-caps c-paper">{review.authorName[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="t-body c-ink font-medium">{review.authorName}</p>
                        {review.verifiedBuyer && (
                          <span className="chip bg-success/10 c-success t-label-caps">Verified</span>
                        )}
                      </div>
                      <p className="t-caption c-ink-faint">
                        {review.authorLocation && <span>{review.authorLocation} · </span>}
                        {review.createdAt}
                      </p>
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full t-label-caps border border-hairline-gold", status.bg, status.color)}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={cn(star <= review.rating ? "fill-gold c-gold" : "c-ink-faint/30")}
                      />
                    ))}
                  </div>
                  {review.title && <p className="t-body-sm c-ink font-medium">{review.title}</p>}
                </div>

                <p className="t-body-sm c-ink-muted mb-3">{review.body}</p>

                {review.product && (
                  <p className="t-caption c-ink-faint mb-3">
                    On: <span className="c-gold-deep">{review.product.name}</span>
                  </p>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-hairline-cream">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(review.id, "approved")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 t-label-caps bg-success/10 c-success hover:bg-success hover:c-paper rounded-sm transition-all"
                    >
                      <Check size={12} /> Approve
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(review.id, "rejected")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 t-label-caps bg-error/10 c-error hover:bg-error hover:c-paper rounded-sm transition-all"
                    >
                      <X size={12} /> Reject
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 t-label-caps c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all ml-auto"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </RevealOnScroll>
      )}
    </div>
  );
}
