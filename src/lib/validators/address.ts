import { z } from "zod";

/**
 * Address-related Zod schemas.
 *
 * Used by:
 *   - POST /api/user/addresses (create new saved address)
 *   - PUT /api/user/addresses/[id] (update saved address)
 *   - POST /api/orders (shippingAddress field — embedded in order schema)
 *
 * Phase 6 will use this to validate the Order.shippingAddress JSON column
 * at the service boundary (currently stored as untyped Json).
 */

/**
 * Full address — required for shipping.
 */
export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(60),
  lastName: z.string().min(1, "Last name is required").max(60),
  street: z.string().min(1, "Street address is required").max(200),
  apartment: z.string().max(100).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State/province is required").max(100),
  zip: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
  phone: z.string().min(1, "Phone is required").max(30),
});

export type AddressInput = z.infer<typeof addressSchema>;

/**
 * Partial address — used for updates (PATCH-style).
 */
export const addressUpdateSchema = addressSchema.partial();

export type AddressUpdateInput = z.infer<typeof addressUpdateSchema>;

/**
 * Validate an unknown value as an Address (for parsing Order.shippingAddress Json column).
 * Returns null if invalid — caller decides whether to fail or use defaults.
 */
export function parseAddress(value: unknown): AddressInput | null {
  const result = addressSchema.safeParse(value);
  return result.success ? result.data : null;
}
