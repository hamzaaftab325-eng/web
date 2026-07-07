import { z } from "zod";

/**
 * Journal article body block schema.
 *
 * JournalArticle.body is a Prisma Json column. Phase 6 will parse it via this
 * schema at the service boundary to drop the `as unknown as JournalBodyBlock[]`
 * cast in src/lib/services/content.service.ts.
 *
 * For Phase 3, this is a placeholder — full implementation deferred to Phase 6
 * (TypeScript Hardening) when we tackle all the `as unknown as` casts.
 */

export const journalTextBlockSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

export const journalImageBlockSchema = z.object({
  type: z.literal("image"),
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

export const journalQuoteBlockSchema = z.object({
  type: z.literal("quote"),
  quote: z.string(),
  attribution: z.string().optional(),
});

export const journalHeadingBlockSchema = z.object({
  type: z.literal("heading"),
  text: z.string(),
  level: z.number().int().min(2).max(4).optional(),
});

export const journalBodyBlockSchema = z.discriminatedUnion("type", [
  journalTextBlockSchema,
  journalImageBlockSchema,
  journalQuoteBlockSchema,
  journalHeadingBlockSchema,
]);

export type JournalBodyBlock = z.infer<typeof journalBodyBlockSchema>;

/**
 * Validate an unknown value as an array of journal body blocks.
 * Returns [] if input is null/undefined/invalid — never throws.
 */
export function parseJournalBody(value: unknown): JournalBodyBlock[] {
  if (!Array.isArray(value)) return [];
  const result = z.array(journalBodyBlockSchema).safeParse(value);
  return result.success ? result.data : [];
}
