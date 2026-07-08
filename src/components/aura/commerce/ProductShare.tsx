"use client";

import { useEffect, useRef, useState } from "react";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Share2, Link2, Mail, ChevronDown, Check } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductShareProps {
  url?: string;
  title?: string;
  className?: string;
}

/** Pinterest brand glyph (lucide doesn't ship one). */
function PinterestIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.017 2.014c-5.523 0-9.997 4.474-9.997 9.997 0 4.235 2.637 7.855 6.354 9.324-.088-.791-.167-2.008.035-2.872.182-.78 1.171-4.967 1.171-4.967s-.299-.599-.299-1.484c0-1.391.806-2.43 1.809-2.43.853 0 1.265.641 1.265 1.41 0 .858-.547 2.142-.829 3.331-.236.997.5 1.81 1.483 1.81 1.781 0 3.148-1.879 3.148-4.587 0-2.398-1.723-4.075-4.183-4.075-2.849 0-4.521 2.135-4.521 4.345 0 .861.331 1.784.745 2.286a.299.299 0 0 1 .069.286c-.075.315-.244.997-.277 1.135-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.166 2.473 6.166 5.776 0 3.447-2.173 6.22-5.189 6.22-1.013 0-1.964-.527-2.291-1.148l-.623 2.374c-.225.869-.835 1.958-1.244 2.623.937.289 1.93.444 2.96.444 5.523 0 9.997-4.474 9.997-9.997 0-5.523-4.474-9.997-9.997-9.997z" />
    </svg>
  );
}

/** X (formerly Twitter) glyph. */
function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

/** Facebook glyph. */
function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function ProductShare({ url, title, className }: ProductShareProps) {
  const prefersReducedMotion = useReducedMotion();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resolve href lazily so client-side routing works.
  const shareUrl =
    url ||
    (typeof window !== "undefined" ? window.location.href : "https://aura-living.example");
  const shareTitle = title || "Aura Living";
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Legacy fallback — use the deprecated execCommand path.
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.setAttribute("readonly", "");
        ta.className = "sr-only";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast({
        title: "Link copied",
        description: "The product link is in your clipboard.",
      });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({
        title: "Couldn't copy",
        description: "Copy this URL manually from the address bar.",
      });
    }
  };

  const onPinterest = () => {
    window.open(
      `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      "_blank",
      "noopener,noreferrer"
    );
    setOpen(false);
  };
  const onX = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      "_blank",
      "noopener,noreferrer"
    );
    setOpen(false);
  };
  const onFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
    setOpen(false);
  };
  const onEmail = () => {
    window.location.href = `mailto:?subject=${encodedTitle}&body=I%20thought%20you%20might%20like%20this%3A%20${encodedUrl}`;
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Share product"
        className="inline-flex items-center gap-2 h-10 px-4 bg-paper border border-hairline rounded-sm t-label-caps c-ink hover:c-gold-deep hover:border-gold transition-colors"
      >
        <Share2 size={14} strokeWidth={1.5} />
        <span className="hidden sm:inline">Share</span>
        <ChevronDown
          size={12}
          strokeWidth={1.5}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-20 mt-2 min-w-[200px] bg-paper border border-hairline rounded-sm shadow-elevated py-1"
          >
            <li role="none">
              <button
                role="menuitem"
                onClick={onCopyLink}
                className="w-full flex items-center gap-3 px-4 py-2.5 t-body-sm c-ink hover:bg-cream hover:c-gold-deep transition-colors text-left"
              >
                {copied ? (
                  <Check size={14} strokeWidth={1.75} className="c-success" />
                ) : (
                  <Link2 size={14} strokeWidth={1.5} />
                )}
                {copied ? "Copied" : "Copy link"}
              </button>
            </li>
            <li role="none">
              <button
                role="menuitem"
                onClick={onPinterest}
                className="w-full flex items-center gap-3 px-4 py-2.5 t-body-sm c-ink hover:bg-cream hover:c-gold-deep transition-colors text-left"
              >
                <PinterestIcon size={14} />
                Pinterest
              </button>
            </li>
            <li role="none">
              <button
                role="menuitem"
                onClick={onX}
                className="w-full flex items-center gap-3 px-4 py-2.5 t-body-sm c-ink hover:bg-cream hover:c-gold-deep transition-colors text-left"
              >
                <XIcon size={14} />
                Post on X
              </button>
            </li>
            <li role="none">
              <button
                role="menuitem"
                onClick={onFacebook}
                className="w-full flex items-center gap-3 px-4 py-2.5 t-body-sm c-ink hover:bg-cream hover:c-gold-deep transition-colors text-left"
              >
                <FacebookIcon size={14} />
                Facebook
              </button>
            </li>
            <li role="none">
              <button
                role="menuitem"
                onClick={onEmail}
                className="w-full flex items-center gap-3 px-4 py-2.5 t-body-sm c-ink hover:bg-cream hover:c-gold-deep transition-colors text-left"
              >
                <Mail size={14} strokeWidth={1.5} />
                Email
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductShare;
