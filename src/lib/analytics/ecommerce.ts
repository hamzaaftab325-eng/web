/**
 * Typed ecommerce event helpers.
 *
 * Each function accepts typed params and calls the central track()
 * function with the correct event name. Callers don't need to know
 * the exact GA4 event strings — just use these typed wrappers.
 */

import { track } from "./track";

/** A single item in an ecommerce event (product + quantity). */
export interface EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity: number;
  item_variant?: string;
}

interface ItemListParams {
  item_list_id: string;
  item_list_name: string;
  items: EcommerceItem[];
}

interface ValueParams {
  currency: string;
  value: number;
  items: EcommerceItem[];
}

interface CheckoutParams extends ValueParams {
  coupon?: string;
}

interface PurchaseParams extends ValueParams {
  transaction_id: string;
  shipping?: number;
  tax?: number;
}

/** User views a list of products (e.g., shop grid, collection). */
export function viewItemList(params: ItemListParams): void {
  track("view_item_list", params);
}

/** User views a single product detail page. */
export function viewItem(params: ValueParams): void {
  track("view_item", params);
}

/** User selects a product from a list. */
export function selectItem(params: ItemListParams): void {
  track("select_item", params);
}

/** User adds a product to the cart. */
export function addToCart(params: ValueParams): void {
  track("add_to_cart", params);
}

/** User removes a product from the cart. */
export function removeFromCart(params: ValueParams): void {
  track("remove_from_cart", params);
}

/** User views their cart. */
export function viewCart(params: ValueParams): void {
  track("view_cart", params);
}

/** User begins the checkout flow. */
export function beginCheckout(params: CheckoutParams): void {
  track("begin_checkout", params);
}

/** User completes a purchase. */
export function purchase(params: PurchaseParams): void {
  track("purchase", params);
}

/** User performs a search. */
export function search(params: { search_term: string }): void {
  track("search", params);
}

/** User signs up for an account. */
export function signUp(params: { method: string }): void {
  track("sign_up", params);
}

/** User logs in. */
export function login(params: { method: string }): void {
  track("login", params);
}
