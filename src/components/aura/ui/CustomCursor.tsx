"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * CustomCursor — subtle gold dot follower on desktop (hidden on touch).
 *
 * A 6px gold dot that follows the cursor with a slight spring delay.
 * Only appears on devices with a fine pointer (mouse/trackpad) —
 * hidden on touch devices. Disabled when prefers-reduced-motion.
 *
 * Renders a fixed-position div that follows mousemove events.
 */

export function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on devices with a fine pointer (mouse/trackpad)
    if (prefersReducedMotion) return;
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(pointer: fine)");
    if (!mql.matches) return;

    const onMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const onLeave = () => setVisible(false);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || !visible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-tooltip pointer-events-none"
      animate={{ x: position.x - 3, y: position.y - 3 }}
      transition={{ type: "spring", stiffness: 800, damping: 35, mass: 0.2 }}
      aria-hidden
    >
      <div className="w-1.5 h-1.5 rounded-full bg-gold opacity-60" />
    </motion.div>
  );
}

export default CustomCursor;
