"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]", "button:not([disabled])", "textarea:not([disabled])",
  "input:not([disabled])", "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].map((s) => `${s}:not([hidden])`).join(", ");

export function useFocusTrap<T extends HTMLElement>(ref: RefObject<T | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => el.offsetParent !== null || el === document.activeElement);
    const initialFocusables = focusables();
    if (initialFocusables.length > 0) { initialFocusables[0].focus(); } else { container.setAttribute("tabindex", "-1"); container.focus(); }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) { e.preventDefault(); return; }
      const first = els[0]; const last = els[els.length - 1]; const activeEl = document.activeElement;
      if (e.shiftKey) { if (activeEl === first || !container.contains(activeEl)) { e.preventDefault(); last.focus(); } }
      else { if (activeEl === last || !container.contains(activeEl)) { e.preventDefault(); first.focus(); } }
    };
    container.addEventListener("keydown", onKey);
    return () => { container.removeEventListener("keydown", onKey); container.removeAttribute("tabindex"); if (previouslyFocused && typeof previouslyFocused.focus === "function") { previouslyFocused.focus(); } };
  }, [ref, active]);
}
