"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ReadAloud — "Read aloud" button that uses the Web Speech API to
 * speak the provided text. Falls back gracefully if the API is not
 * available (older browsers).
 *
 * Usage:
 *   <ReadAloud text={product.longDescription} />
 */

export interface ReadAloudProps {
  text: string;
  className?: string;
}

export function ReadAloud({ text, className }: ReadAloudProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Stop if already playing
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const isSupported =
    typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";

  if (!isSupported) return null;

  return (
    <button
      onClick={speak}
      aria-label={isPlaying ? "Stop reading" : "Read description aloud"}
      className={cn(
        "inline-flex items-center gap-1.5 t-label-caps c-ink-faint hover:c-gold-deep transition-colors link-underline",
        className
      )}
    >
      {isPlaying ? (
        <Square size={12} strokeWidth={2} />
      ) : (
        <Volume2 size={12} strokeWidth={1.5} />
      )}
      {isPlaying ? "Stop" : "Read aloud"}
    </button>
  );
}

export default ReadAloud;

