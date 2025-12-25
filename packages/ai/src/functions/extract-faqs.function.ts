/**
 * Extract FAQs Function
 *
 * Extracts FAQ items from blog content for FAQ Schema generation.
 * Uses gpt-4.1-mini for fast, structured extraction.
 *
 * @module @workspace/ai/functions/extract-faqs
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'

/**
 * Single FAQ item schema
 */
export const faqItemSchema = z.object({
    /** Question text */
    question: z.string().describe('The FAQ question'),
    /** Answer text */
    answer: z.string().describe('The FAQ answer'),
})

/**
 * FAQ extraction response schema
 */
export const extractFaqsResponseSchema = z.object({
    /** Extracted FAQ items */
    faqs: z
        .array(faqItemSchema)
        .min(0)
        .max(10)
        .describe('FAQ items extracted from content'),
    /** Whether FAQs were found in content */
    hasFaqSection: z
        .boolean()
        .describe('True if content has explicit FAQ section'),
})

/**
 * Single FAQ item type
 */
export type FaqItem = z.infer<typeof faqItemSchema>

/**
 * FAQ extraction result type
 */
export type ExtractFaqsResult = z.infer<typeof extractFaqsResponseSchema>

/**
 * Options for FAQ extraction
 */
export type ExtractFaqsOptions = {
    /** Blog post content */
    content: string
    /** Primary keyword for context */
    primaryKeyword?: string
    /** Maximum FAQs to extract */
    maxFaqs?: number
    /** Model ID to use (default: gpt-4.1-mini) */
    modelId?: string
}

/**
 * System prompt for FAQ extraction
 */
const FAQ_EXTRACTOR_SYSTEM_PROMPT = `You are an expert at extracting FAQ content from blog posts.

Your task is to identify and extract FAQ (Frequently Asked Questions) items from the content.

**What to look for:**
1. Explicit FAQ sections (marked with "FAQ", "Frequently Asked Questions", etc.)
2. Q&A format content (questions followed by answers)
3. "Common questions" or similar sections

**Extraction Guidelines:**
- Extract questions exactly as written (or slightly clean up formatting)
- Answers should be complete but concise (1-4 sentences)
- Only extract genuine Q&A pairs, not regular headings
- If the content uses "**Q:**" or similar formatting, extract those
- Maximum 10 FAQs per extraction

**Output Format:**
- Clean question text without "Q:" prefix
- Clean answer text without "A:" prefix
- Set hasFaqSection to true if explicit FAQ section exists

If no FAQs are found, return an empty array with hasFaqSection: false.`

/**
 * Extract FAQs from blog content
 *
 * Identifies and extracts FAQ items from blog post content
 * for FAQ Schema generation (structured data for search).
 *
 * @param options - Extraction options
 * @returns Extracted FAQs with metadata
 *
 * @example
 * ```typescript
 * const result = await extractFaqs({
 *   content: blogPostMarkdown,
 *   primaryKeyword: 'bbl recovery',
 * })
 *
 * if (result.hasFaqSection) {
 *   // Use for FAQ Schema
 *   const faqSchema = {
 *     "@type": "FAQPage",
 *     mainEntity: result.faqs.map(faq => ({
 *       "@type": "Question",
 *       name: faq.question,
 *       acceptedAnswer: {
 *         "@type": "Answer",
 *         text: faq.answer,
 *       }
 *     }))
 *   }
 * }
 * ```
 */
export async function extractFaqs(
    options: ExtractFaqsOptions
): Promise<ExtractFaqsResult> {
    const {
        content,
        primaryKeyword,
        maxFaqs = 10,
        modelId = 'gpt-4.1-mini',
    } = options

    // Quick regex check for FAQ patterns (optimization)
    const hasFaqPattern =
        /(?:FAQ|Frequently Asked|Common Questions|Q:|Q\.|Q\))/i.test(content)

    if (!hasFaqPattern) {
        // No FAQ patterns found, return empty
        return {
            faqs: [],
            hasFaqSection: false,
        }
    }

    const prompt = `Extract FAQ items from this blog post:

${primaryKeyword ? `**Topic:** ${primaryKeyword}\n` : ''}**Maximum FAQs:** ${maxFaqs}

---

${content}

---

Find and extract all Q&A pairs. If no genuine FAQs exist, return empty array.`

    const result = await coreGenerateObject({
        modelId,
        schema: extractFaqsResponseSchema,
        system: FAQ_EXTRACTOR_SYSTEM_PROMPT,
        prompt,
        temperature: 0.2, // Very low for accurate extraction
    })

    // Limit to maxFaqs
    return {
        ...result.object,
        faqs: result.object.faqs.slice(0, maxFaqs),
    }
}

/**
 * Generate FAQ Schema JSON-LD
 *
 * Converts extracted FAQs to JSON-LD format for structured data.
 *
 * @param faqs - Array of FAQ items
 * @returns JSON-LD object for FAQ Schema
 */
export function generateFaqSchema(faqs: FaqItem[]): object | null {
    if (faqs.length === 0) return null

    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }
}
