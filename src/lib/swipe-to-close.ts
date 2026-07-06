"use client";

import { type PanInfo } from "framer-motion";

/**
 * Swipe-to-close helpers for drawer panels.
 *
 * Usage on a motion.aside element:
 *
 *   <motion.aside
 *     drag={canDrag ? "x" : false}
 *     dragConstraints={dragConstraints}
 *     dragElastic={0.2}
 *     onDragEnd={(e, info) => onDragEnd(info, close, "right")}
 *   >
 *
 * For right-side drawers (Cart, Wishlist): drag right to close.
 * For left-side drawers (MobileNav, Filter): drag left to close.
 */

/** Threshold: 25% of a 360px drawer = 90px, or velocity > 500px/s */
const OFFSET_THRESHOLD = 90;
const VELOCITY_THRESHOLD = 500;

/**
 * Drag constraints for right-side drawers (slide in from right).
 * Allows dragging right (positive x), prevents dragging left.
 */
export const RIGHT_DRAWER_CONSTRAINTS = { left: 0, right: 360 };

/**
 * Drag constraints for left-side drawers (slide in from left).
 * Allows dragging left (negative x), prevents dragging right.
 */
export const LEFT_DRAWER_CONSTRAINTS = { left: -360, right: 0 };

/**
 * onDragEnd handler for right-side drawers.
 * Closes if dragged right past threshold or flicked right with velocity.
 */
export function rightDrawerDragEnd(
  info: PanInfo,
  close: () => void
): void {
  if (info.offset.x > OFFSET_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD) {
    close();
  }
}

/**
 * onDragEnd handler for left-side drawers.
 * Closes if dragged left past threshold or flicked left with velocity.
 */
export function leftDrawerDragEnd(
  info: PanInfo,
  close: () => void
): void {
  if (info.offset.x < -OFFSET_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) {
    close();
  }
}
