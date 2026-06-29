"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  ThumbsUp,
  BadgeCheck,
  Camera,
  X,
  Check,
} from "lucide-react";
import { cn, sleep } from "@/lib/utils";
import AuraChip from "@/components/aura/ui/Chip";
import { StarRating } from "./StarRating";
import { RatingSummary } from "./RatingSummary";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface Review {
  id: string;
  name: string;
  location?: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  hasPhotos: boolean;
  helpful: number;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "r-1",
    name: "Eleanor Whitfield",
    location: "Asheville, NC",
    rating: 5,
    title: "Quietly luminous",
    body:
      "The matte glaze is even warmer in person — it catches afternoon light beautifully on our console. The linen shade diffuses a soft, honeyed glow that makes the whole entryway feel calmer. Worth every penny.",
    date: "2025-04-18",
    verified: true,
    hasPhotos: true,
    helpful: 24,
  },
  {
    id: "r-2",
    name: "Marcus Tan",
    location: "Brooklyn, NY",
    rating: 5,
    title: "Better than the catalog photos",
    body:
      "I was nervous ordering a lamp online without seeing it in person, but the proportions are exactly right. The ceramic has a slight hand-thrown asymmetry that you can't see in pictures — it makes the piece feel made, not manufactured.",
    date: "2025-04-02",
    verified: true,
    hasPhotos: false,
    helpful: 18,
  },
  {
    id: "r-3",
    name: "Priya Subramanian",
    location: "Lahore, Pakistan",
    rating: 4,
    title: "Lovely, with one minor caveat",
    body:
      "Beautiful object and a warm light. The only thing I'd flag is that the brass switch is a touch stiff when new — it loosens up after a week or so. Otherwise, exactly the warm note our bedroom needed.",
    date: "2025-03-21",
    verified: true,
    hasPhotos: false,
    helpful: 11,
  },
  {
    id: "r-4",
    name: "James Okafor",
    location: "London, UK",
    rating: 5,
    title: "A future heirloom",
    body:
      "Bought a pair for our long nightstands. The proportions read as architectural in daylight and intimate after dark. The maker's mark on the base is a small, lovely detail — you can tell these are made by hand.",
    date: "2025-03-10",
    verified: true,
    hasPhotos: true,
    helpful: 31,
  },
  {
    id: "r-5",
    name: "Hannah Eriksson",
    location: "Minneapolis, MN",
    rating: 4,
    title: "Great, but plan your bulb",
    body:
      "Beautiful lamp, beautifully packaged. One note: it really wants a warm-white bulb. I tried a daylight bulb first and it read cold against the glaze. Switched to 2700K and it's exactly right.",
    date: "2025-02-26",
    verified: false,
    hasPhotos: false,
    helpful: 7,
  },
  {
    id: "r-6",
    name: "Diego Marín",
    location: "Madrid, ES",
    rating: 5,
    title: "Worth the wait",
    body:
      "Shipped from Portugal to Madrid in five days, beautifully protected. The terracotta variant is even richer in person — like a sun-warmed clay pot. Pairs beautifully with the brass arc lamp.",
    date: "2025-02-14",
    verified: true,
    hasPhotos: true,
    helpful: 15,
  },
  {
    id: "r-7",
    name: "Sarah Chen",
    location: "San Francisco, CA",
    rating: 3,
    title: "Lovely but smaller than expected",
    body:
      "The craftsmanship is genuinely beautiful. I should have read the dimensions more carefully — for our large entryway console it reads a little small. Going to keep it for the bedroom instead, where it'll be perfect.",
    date: "2025-02-01",
    verified: true,
    hasPhotos: false,
    helpful: 9,
  },
  {
    id: "r-8",
    name: "Theo Lindqvist",
    location: "Stockholm, SE",
    rating: 5,
    title: "The definition of warm minimalism",
    body:
      "We've spent years looking for a table lamp that doesn't shout. This is it. Reads as a quiet object in daylight, as a honeyed glow after dark. The shade is well-proportioned and the cord is a generous length.",
    date: "2025-01-22",
    verified: true,
    hasPhotos: false,
    helpful: 22,
  },
];

type SortKey = "recent" | "highest" | "lowest" | "helpful";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Most Recent" },
  { key: "highest", label: "Highest Rated" },
  { key: "lowest", label: "Lowest Rated" },
  { key: "helpful", label: "Most Helpful" },
];

type FilterChipKey = "rating" | "photos" | "verified";

interface ReviewsSectionProps {
  productName?: string;
  productSlug?: string;
  className?: string;
}

export function ReviewsSection({ productName, productSlug, className }: ReviewsSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [activeRatingFilter, setActiveRatingFilter] = useState<number | null>(null);
  const [chipFilters, setChipFilters] = useState<Record<FilterChipKey, boolean>>({
    rating: false,
    photos: false,
    verified: false,
  });
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [apiReviews, setApiReviews] = useState<Review[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);

  // Fetch real reviews from the API.
  useEffect(() => {
    if (!productSlug) {
      setIsLoading(false);
      return;
    }
    fetch(`/api/reviews/${productSlug}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const reviews = Array.isArray(data) ? data.map((r: { id: string; authorName: string; authorLocation?: string; rating: number; title?: string; body: string; verifiedBuyer: boolean; helpfulCount: number; createdAt: string }) => ({
          id: r.id,
          name: r.authorName,
          location: r.authorLocation,
          rating: r.rating,
          title: r.title ?? "",
          body: r.body,
          date: r.createdAt.split("T")[0],
          verified: r.verifiedBuyer,
          hasPhotos: false,
          helpful: r.helpfulCount,
        })) : [];
        setApiReviews(reviews);
      })
      .catch(() => setApiReviews([]))
      .finally(() => setIsLoading(false));
  }, [productSlug]);

  // Close sort dropdown on outside click / Esc.
  useEffect(() => {
    if (!sortOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [sortOpen]);

  const allReviews = useMemo(() => [...userReviews, ...apiReviews], [userReviews, apiReviews]);

  const distribution = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r) => {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    });
    return [5, 4, 3, 2, 1].map((stars) => ({ stars, count: counts[stars] }));
  }, [allReviews]);

  const averageRating = useMemo(() => {
    if (allReviews.length === 0) return 0;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / allReviews.length;
  }, [allReviews]);

  const filtered = useMemo(() => {
    let list = allReviews;
    if (activeRatingFilter !== null) {
      list = list.filter((r) => r.rating === activeRatingFilter);
    }
    if (chipFilters.photos) list = list.filter((r) => r.hasPhotos);
    if (chipFilters.verified) list = list.filter((r) => r.verified);
    return list;
  }, [allReviews, activeRatingFilter, chipFilters]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "recent":
        return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
      case "highest":
        return list.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return list.sort((a, b) => a.rating - b.rating);
      case "helpful":
        return list.sort(
          (a, b) =>
            b.helpful + (helpfulVotes[b.id] ? 1 : 0) - (a.helpful + (helpfulVotes[a.id] ? 1 : 0))
        );
    }
  }, [filtered, sort, helpfulVotes]);

  const hasActiveFilters =
    activeRatingFilter !== null || chipFilters.photos || chipFilters.verified;

  const clearFilters = () => {
    setActiveRatingFilter(null);
    setChipFilters({ rating: false, photos: false, verified: false });
  };

  const onHelpful = (id: string) => {
    setHelpfulVotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const submitReview = async () => {
    if (formRating === 0 || !formName.trim() || !formBody.trim()) return;
    setFormSubmitting(true);
    await sleep(600);
    const newReview: Review = {
      id: `user-${Date.now()}`,
      name: formName.trim(),
      location: undefined,
      rating: formRating,
      title: formTitle.trim() || "My review",
      body: formBody.trim(),
      date: new Date().toISOString().slice(0, 10),
      verified: true,
      hasPhotos: false,
      helpful: 0,
    };
    setUserReviews((prev) => [newReview, ...prev]);
    setFormRating(0);
    setFormName("");
    setFormTitle("");
    setFormBody("");
    setFormSubmitting(false);
    setShowForm(false);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <section className={cn("container-aura section-stack", className)}>
      {/* Section header — gold accent line pattern */}
      <div className="flex items-center gap-4 mb-8 md:mb-10">
        <span className="block h-px w-12 bg-gold" />
        <span className="t-label-caps c-gold-deep">Reviews</span>
      </div>
      <TextBlurReveal as="h2" className="t-display-md c-ink mb-8 md:mb-10">
        What readers are saying
        {productName && (
          <span className="block t-headline-sm c-ink-faint mt-2">
            about the {productName}
          </span>
        )}
      </TextBlurReveal>

      {/* Summary */}
      <RevealOnScroll direction="up" duration={0.7}>
        <RatingSummary
          averageRating={averageRating}
          total={allReviews.length}
          distribution={distribution}
          onWriteReview={() => setShowForm((s) => !s)}
          activeFilter={activeRatingFilter}
          onFilter={setActiveRatingFilter}
        />
      </RevealOnScroll>

      {/* Inline review form */}
      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-6 md:p-8 mt-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="t-headline-sm c-ink">Share your experience</h3>
                <button
                  onClick={() => setShowForm(false)}
                  aria-label="Close review form"
                  className="p-1.5 hover:c-gold-deep transition-colors"
                >
                  <X size={18} strokeWidth={1.25} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="t-label-caps c-ink-faint mb-3">Your rating</p>
                  <StarRating
                    rating={formRating}
                    size="lg"
                    interactive
                    onChange={setFormRating}
                    ariaLabel="Set your rating"
                  />
                </div>
                <div>
                  <label htmlFor="rv-name" className="block t-label-caps c-ink-faint mb-3">
                    Name
                  </label>
                  <input
                    id="rv-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-11 px-4 bg-paper border border-hairline rounded-sm t-body c-ink placeholder:c-ink-faint focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="rv-title" className="block t-label-caps c-ink-faint mb-3">
                  Title (optional)
                </label>
                <input
                  id="rv-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full h-11 px-4 bg-paper border border-hairline rounded-sm t-body c-ink placeholder:c-ink-faint focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div className="mt-5">
                <label htmlFor="rv-body" className="block t-label-caps c-ink-faint mb-3">
                  Your review
                </label>
                <textarea
                  id="rv-body"
                  rows={5}
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="What did you love? What would you change?"
                  className="w-full px-4 py-3 bg-paper border border-hairline rounded-sm t-body c-ink placeholder:c-ink-faint focus:outline-none focus:border-gold transition-colors resize-y"
                />
              </div>
              <div className="flex items-center justify-between mt-6">
                <p className="t-caption c-ink-faint">
                  {formRating === 0 || !formName.trim() || !formBody.trim()
                    ? "Rating, name, and review are required."
                    : "Ready to submit."}
                </p>
                <button
                  onClick={submitReview}
                  disabled={
                    formSubmitting ||
                    formRating === 0 ||
                    !formName.trim() ||
                    !formBody.trim()
                  }
                  className={cn(
                    "inline-flex items-center gap-2 h-11 px-6 t-label-caps transition-all",
                    formSubmitting || formRating === 0 || !formName.trim() || !formBody.trim()
                      ? "bg-cream c-ink-faint cursor-not-allowed"
                      : "bg-ink c-paper hover:bg-gold-deep"
                  )}
                >
                  {formSubmitting ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="inline-block w-3.5 h-3.5 border border-paper/30 border-t-paper rounded-full"
                      />
                      Submitting
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort + filter row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-10 mb-6">
        {/* Sort dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen((s) => !s)}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            className="inline-flex items-center gap-2 h-10 px-4 bg-paper border border-hairline rounded-sm t-body-sm c-ink hover:border-gold transition-colors"
          >
            <span className="c-ink-faint">Sort:</span>
            <span>{SORTS.find((s) => s.key === sort)?.label}</span>
            <ChevronDown
              size={14}
              strokeWidth={1.5}
              className={cn("transition-transform", sortOpen && "rotate-180")}
            />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.ul
                role="listbox"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="absolute z-20 mt-2 min-w-[180px] bg-paper border border-hairline rounded-sm shadow-elevated py-1"
              >
                {SORTS.map((s) => (
                  <li key={s.key}>
                    <button
                      role="option"
                      aria-selected={sort === s.key}
                      onClick={() => {
                        setSort(s.key);
                        setSortOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 t-body-sm transition-colors flex items-center justify-between",
                        sort === s.key
                          ? "c-gold-deep bg-gold-pale"
                          : "c-ink hover:bg-cream hover:c-gold-deep"
                      )}
                    >
                      {s.label}
                      {sort === s.key && <Check size={14} strokeWidth={1.75} />}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          <AuraChip
            asButton
            pressed={chipFilters.photos}
            onClick={() =>
              setChipFilters((p) => ({ ...p, photos: !p.photos }))
            }
            aria-label="Filter reviews with photos"
          >
            <Camera size={12} strokeWidth={1.5} />
            With Photos
          </AuraChip>
          <AuraChip
            asButton
            pressed={chipFilters.verified}
            onClick={() =>
              setChipFilters((p) => ({ ...p, verified: !p.verified }))
            }
            aria-label="Filter verified reviews"
          >
            <BadgeCheck size={12} strokeWidth={1.5} />
            Verified
          </AuraChip>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 t-body-sm c-ink-faint hover:c-gold-deep transition-colors link-underline"
            >
              <X size={12} strokeWidth={1.5} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 shimmer rounded-sm" />
                  <div className="h-2 w-20 shimmer rounded-sm" />
                </div>
              </div>
              <div className="h-3 w-2/3 shimmer rounded-sm mb-3" />
              <div className="h-2 w-full shimmer rounded-sm mb-1.5" />
              <div className="h-2 w-5/6 shimmer rounded-sm" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-10 text-center">
          <p className="t-headline-sm c-ink mb-2">No reviews match these filters</p>
          <p className="t-body-sm c-ink-muted mb-5">
            Try clearing one or two filters to see more.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((review, i) => (
            <motion.article
              key={review.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.2) }}
              className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-6"
            >
              <div className="flex items-start gap-4">
                {/* Avatar initials */}
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-cream-deep flex items-center justify-center t-label-caps c-gold-deep">
                  {initials(review.name)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="t-body c-ink font-medium">{review.name}</p>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 t-caption c-success">
                        <BadgeCheck size={12} strokeWidth={1.75} />
                        Verified buyer
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="t-caption c-ink-faint">{formatDate(review.date)}</span>
                    {review.location && (
                      <span className="t-caption c-ink-faint">· {review.location}</span>
                    )}
                  </div>
                  <h4 className="t-headline-sm c-ink mb-2">{review.title}</h4>
                  <p className="t-body c-ink-muted leading-relaxed mb-4">{review.body}</p>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {review.hasPhotos ? (
                      <span className="inline-flex items-center gap-1.5 t-caption c-gold-deep">
                        <Camera size={12} strokeWidth={1.5} />
                        Includes customer photos
                      </span>
                    ) : (
                      <span />
                    )}
                    <button
                      onClick={() => onHelpful(review.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 t-caption transition-colors",
                        helpfulVotes[review.id]
                          ? "c-gold-deep"
                          : "c-ink-muted hover:c-gold-deep"
                      )}
                      aria-pressed={!!helpfulVotes[review.id]}
                    >
                      <ThumbsUp
                        size={12}
                        strokeWidth={1.5}
                        className={cn(helpfulVotes[review.id] && "fill-gold-pale")}
                      />
                      Helpful ({review.helpful + (helpfulVotes[review.id] ? 1 : 0)})
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ReviewsSection;
