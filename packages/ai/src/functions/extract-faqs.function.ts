/**
 * Extract FAQs Function
 *
 * Extracts FAQ items from blog content for FAQ Schema generation.
 * Uses gpt-4.1-mini for fast, structured extraction.
 *
 * @module @workspace/ai/functions/extract-faqs
 */
import { z } from 'zod'

import { faqItemSchema, type FaqItem } from '@workspace/shared/schemas/blog'

import { coreGenerateObject } from '../core'

/**
 * FAQ extraction response schema
 */
export const extractFaqsResponseSchema = z.object({
    /** Extracted FAQ items */
    faqs: z
        .array(faqItemSchema)
        .min(0)
        .max(10)
        .describe('FAQ items extracted or generated from content'),
})

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
    /** Model ID to use (default: gpt-4.1) */
    modelId?: string
    /** Generate FAQs from content analysis if no FAQ section exists (default: true) */
    generateIfMissing?: boolean
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

If no FAQs are found, return an empty array.`

/**
 * System prompt for FAQ generation (when no FAQ section exists)
 */
const FAQ_GENERATOR_SYSTEM_PROMPT = `You are an expert at creating relevant FAQ content for blog posts about plastic surgery and cosmetic procedures.

Your task is to analyze blog content and generate FAQ items that readers commonly search for.

**Business Context:**
- Business: Alluring Plastic Surgery - luxury cosmetic surgery clinic in Miami, FL
- Audience: Women 25-55, value quality, seek affordability
- Goal: Create SEO-friendly FAQs that help with featured snippets and People Also Ask

**Generation Guidelines:**
- Read the content and identify the main topics and subtopics
- Generate 5-8 questions that readers would commonly ask about these topics
- Questions should be natural, conversational, and search-friendly
- Answers should be concise (2-4 sentences) and based on content information
- Focus on practical, actionable questions (costs, timing, process, results, risks, recovery)
- Use "How", "What", "When", "Why", "Can I", "Is it" question formats
- Ensure answers are informative but encourage consultation for specifics

**Question Types to Include:**
- Process questions ("What happens during...?", "How does... work?")
- Eligibility questions ("Am I a good candidate for...?", "Who should consider...?")
- Recovery questions ("What is the recovery time for...?", "When can I return to...?")
- Cost/financing questions ("How much does... cost?", "Do you offer financing?")
- Results questions ("How long do results last?", "When will I see results?")
- Safety questions ("Is... safe?", "What are the risks of...?")

**Output Format:**
- Clean, natural question text (no "Q:" prefix)
- Concise, helpful answer text (no "A:" prefix)`

/**
 * Generate FAQs from content analysis when no FAQ section exists
 *
 * Analyzes blog content and generates relevant FAQs that readers commonly search for.
 *
 * @param options - Generation options
 * @returns Generated FAQs with metadata
 */
async function generateFaqsFromContent(
    options: ExtractFaqsOptions
): Promise<ExtractFaqsResult> {
    const {
        content,
        primaryKeyword,
        maxFaqs = 8,
        modelId = 'gpt-4.1',
    } = options

    const prompt = `Generate FAQ items for this blog post:

${primaryKeyword ? `**Primary Topic:** ${primaryKeyword}\n` : ''}**Target FAQs:** ${Math.min(maxFaqs, 8)}

---

${content}

---

Analyze the content above and generate ${Math.min(maxFaqs, 8)} relevant FAQ items that readers would commonly search for. Base answers on the information provided in the content.`

    const result = await coreGenerateObject({
        modelId,
        schema: extractFaqsResponseSchema,
        system: FAQ_GENERATOR_SYSTEM_PROMPT,
        prompt,
        temperature: 0.7, // Higher for creative generation
    })

    // Limit to maxFaqs
    return {
        faqs: result.object.faqs.slice(0, maxFaqs),
    }
}

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
 * if (result.faqs.length > 0) {
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
        modelId = 'gpt-4.1',
        generateIfMissing = true,
    } = options

    // Quick regex check for FAQ patterns (optimization)
    const hasFaqPattern =
        /(?:FAQ|Frequently Asked|Common Questions|Q:|Q\.|Q\))/i.test(content)

    if (!hasFaqPattern) {
        // No FAQ patterns found
        if (!generateIfMissing) {
            // Return empty if generation is disabled
            return {
                faqs: [],
            }
        }

        // Generate FAQs from content analysis
        return await generateFaqsFromContent(options)
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
