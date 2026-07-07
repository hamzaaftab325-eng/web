import { z } from "zod";

/**
 * Review + Question Zod schemas.
 */

/**
 * POST /api/reviews/[productSlug] — submit a product review.
 */
export const createReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title is too long (max 120 characters)")
    .optional(),
  body: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review is too long (max 2000 characters)"),
  authorName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name is too long (max 60 characters)"),
  authorLocation: z
    .string()
    .max(120, "Location is too long (max 120 characters)")
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * POST /api/products/[slug]/questions — submit a product question.
 */
export const createQuestionSchema = z.object({
  authorName: z.string().min(1, "Name is required").max(100, "Name is too long"),
  authorEmail: z.string().email("Please enter a valid email").optional(),
  question: z
    .string()
    .min(3, "Question must be at least 3 characters")
    .max(500, "Question is too long (max 500 characters)"),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
