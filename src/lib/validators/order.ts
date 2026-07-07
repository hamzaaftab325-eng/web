import { z } from "zod";

/**
 * Order-related Zod schemas.
 */

/**
 * Single line item in a checkout — comes from the client cart.
 * Note: price is IGNORED server-side (re-validated from DB to prevent tampering).
 */
export const checkoutItemSchema = z.object({
  productSlug: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  // variantLabel is optional — only set if product has variants
  variantLabel: z.string().max(100).optional(),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;

/**
 * POST /api/orders — checkout.
 * COD-only (no online payment), so no payment-method field.
 */
export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Cart is empty"),
  shippingAddress: z.object({
    firstName: z.string().min(1).max(60),
    lastName: z.string().min(1).max(60),
    street: z.string().min(1).max(200),
    apartment: z.string().max(100).optional().nullable(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    zip: z.string().min(1).max(20),
    country: z.string().min(1).max(100),
    phone: z.string().min(1).max(30),
  }),
  email: z.string().email("Please enter a valid email address"),
  orderNotes: z.string().max(1000).optional().nullable(),
  promoCode: z.string().max(50).optional().nullable(),
  subscribeToNewsletter: z.boolean().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
