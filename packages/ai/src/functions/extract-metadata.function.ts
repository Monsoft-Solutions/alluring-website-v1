/**
 * Extract Metadata Function
 *
 * Fast metadata extraction from generated blog content.
 * Model is configurable via options (admin Blog AI Settings).
 *
 * @module @workspace/ai/functions/extract-metadata
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'

/**
 * Extracted metadata schema
 */
export const contentMetadataSchema = z.object({
    /** SEO title tag (50-60 characters ideal) */
    metaTitle: z
        .string()
        .min(30)
        .max(70)
        .describe(
            'SEO title tag, 50-60 characters, primary keyword at or near the front'
        ),
    /** SEO meta description (150-160 characters) */
    metaDescription: z
        .string()
        .min(100)
        .max(170)
        .describe('SEO meta description optimized for search results'),
    /** Short excerpt for previews (2-3 sentences) */
    excerpt: z
        .string()
        .max(300)
        .describe('Short preview text for blog listings'),
    /** Suggested tags for categorization */
    suggestedTags: z
        .array(z.string())
        .min(3)
        .max(7)
        .describe('Relevant tags for the post'),
    /** Estimated reading time in minutes */
    readingTimeMinutes: z
        .number()
        .min(1)
        .max(30)
        .describe('Estimated reading time'),
    /** Primary category suggestion */
    suggestedCategory: z.string().describe('Primary category for the post'),
})

/**
 * Extracted metadata type
 */
export type ContentMetadata = z.infer<typeof contentMetadataSchema>

/**
 * Options for metadata extraction
 */
export type ExtractMetadataOptions = {
    /** Blog post content */
    content: string
    /** Primary keyword for SEO optimization */
    primaryKeyword: string
    /** Post title for context */
    title?: string
    /** Model ID to use (default: gpt-4.1-mini) */
    modelId?: string
}

/**
 * System prompt for metadata extraction
 */
const METADATA_EXTRACTOR_SYSTEM_PROMPT = `You are an SEO metadata expert for a luxury plastic surgery clinic in Miami.

Extract optimized metadata from blog post content:

**Meta Title Guidelines:**
- 50-60 characters (never exceed 70)
- Primary keyword at or near the front
- Benefit- or answer-oriented, never clickbait
- No brand suffix (the site appends branding) and no year unless the content is year-specific

**Meta Description Guidelines:**
- 150-160 characters (critical for SEO)
- Include the primary keyword naturally
- Compelling value proposition
- Action-oriented when possible
- No truncation in search results

**Excerpt Guidelines:**
- 2-3 sentences capturing the essence
- Engaging for blog listing pages
- Different from meta description
- Entices readers to click

**Tag Guidelines:**
- 3-7 relevant tags
- Include procedure names if discussed
- Include topic areas (recovery, cost, etc.)
- Use lowercase, no special characters

**Category Suggestions:**
- procedures, recovery, cost-financing, before-after, patient-stories, clinic-news`

/**
 * Extract metadata from blog content
 *
 * Fast extraction using gpt-4.1-mini for SEO metadata,
 * excerpt, tags, and categorization.
 *
 * @param options - Extraction options
 * @returns Extracted metadata
 *
 * @example
 * ```typescript
 * const metadata = await extractMetadata({
 *   content: blogPostMarkdown,
 *   primaryKeyword: 'bbl recovery',
 *   title: 'BBL Recovery Guide: Week by Week',
 * })
 *
 * console.log(metadata.metaDescription)
 * // "Learn what to expect during BBL recovery week by week. Our Miami surgeons share..."
 * ```
 */
export async function extractMetadata(
    options: ExtractMetadataOptions
): Promise<ContentMetadata> {
    const {
        content,
        primaryKeyword,
        title,
        modelId = 'claude-opus-5',
    } = options

    // Calculate word count for reading time hint
    const wordCount = content.split(/\s+/).length
    const estimatedReadingTime = Math.ceil(wordCount / 200) // ~200 words per minute

    const prompt = `Extract SEO-optimized metadata from this blog post:

${title ? `**Title:** ${title}\n` : ''}**Primary Keyword:** ${primaryKeyword}
**Word Count:** ~${wordCount} words
**Estimated Reading Time:** ${estimatedReadingTime} minutes

---

${content.slice(0, 3000)}${content.length > 3000 ? '\n\n[Content truncated for extraction...]' : ''}

---

Extract the metadata following the guidelines. Ensure the meta title is 50-60 characters with "${primaryKeyword}" near the front, and the meta description is 150-160 characters and includes "${primaryKeyword}" naturally.`

    const result = await coreGenerateObject({
        modelId,
        schema: contentMetadataSchema,
        system: METADATA_EXTRACTOR_SYSTEM_PROMPT,
        prompt,
        temperature: 0.3,
    })

    return result.object
}
