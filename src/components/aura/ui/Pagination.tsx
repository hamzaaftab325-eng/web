"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pagination — page-based pagination with prev/next + numbered pages.
 *
 * Features:
 * - Active page highlighted with gold accent
 * - Prev/next buttons disabled at boundaries
 * - Ellipsis (...) for large page counts
 * - Accessible: aria-current="page" on active, aria-label on controls
 * - Honors prefers-reduced-motion
 */

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Generate page numbers with ellipsis for large ranges. */
function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const prefersReducedMotion = useReducedMotion();

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  const buttonBase =
    "flex items-center justify-center transition-colors rounded-sm";

  return (
    <nav
      className={cn("flex items-center gap-1", className)}
      aria-label="Pagination"
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={cn(
          buttonBase,
          "w-9 h-9",
          currentPage === 1
            ? "c-ink-faint cursor-not-allowed"
            : "c-ink hover:bg-cream hover:c-gold-deep"
        )}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>

      {/* Page numbers */}
      {pages.map((page, i) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${i}`}
              className="w-9 h-9 flex items-center justify-center c-ink-faint t-body"
            >
              …
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              buttonBase,
              "w-9 h-9 t-body t-num",
              isActive
                ? "bg-gold-deep c-paper font-medium"
                : "c-ink hover:bg-cream hover:c-gold-deep"
            )}
          >
            {page}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={cn(
          buttonBase,
          "w-9 h-9",
          currentPage === totalPages
            ? "c-ink-faint cursor-not-allowed"
            : "c-ink hover:bg-cream hover:c-gold-deep"
        )}
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </nav>
  );
}

export default Pagination;
