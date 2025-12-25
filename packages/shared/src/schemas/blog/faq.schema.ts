/**
 * FAQ Schema
 *
 * Single source of truth for FAQ item type definitions.
 * Used across apps/admin, apps/web, packages/ai, and packages/db.
 *
 * @module @workspace/shared/schemas/blog/faq
 */
import { z } from 'zod'

/**
 * Schema for a single FAQ item.
 *
 * Represents a question and answer pair used in:
 * - Blog post structured data
 * - FAQ sections on pages
 * - AI-generated FAQs
 */
export const faqItemSchema = z.object({
    /** The question text */
    question: z.string().describe('The question text'),
    /** The answer text */
    answer: z.string().describe('The answer text'),
})

/**
 * FAQ item type
 *
 * Represents a question and answer pair for FAQ sections.
 */
export type FaqItem = z.infer<typeof faqItemSchema>

/**
 * Schema for an array of FAQ items
 */
export const faqListSchema = z.array(faqItemSchema)

/**
 * Type for an array of FAQ items
 */
export type FaqList = z.infer<typeof faqListSchema>
