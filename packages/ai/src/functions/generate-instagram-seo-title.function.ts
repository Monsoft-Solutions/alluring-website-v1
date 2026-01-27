/**
 * Generate Instagram SEO Metadata Function
 *
 * AI-powered SEO title and description generation for Instagram posts.
 * Creates unique, descriptive metadata for individual post pages
 * to avoid duplicate title/description issues in Google Search Console.
 *
 * @module @workspace/ai/functions/generate-instagram-seo-title
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'

/**
 * Model for SEO metadata generation (cost-efficient)
 */
const MODEL_FOR_SEO_GENERATION = 'gpt-4.1-mini'

/**
 * Zod schema for SEO metadata output
 */
const seoMetadataSchema = z.object({
    title: z
        .string()
        .describe(
            'SEO-optimized page title, max 50 characters. No quotes, no brand name, no pipe symbol.'
        ),
    description: z
        .string()
        .describe(
            'SEO meta description, max 155 characters. Compelling with call to action.'
        ),
})

/**
 * System prompt for Instagram SEO metadata generation
 */
const SEO_METADATA_SYSTEM_PROMPT = `You are an expert in writing SEO-optimized page titles and meta descriptions for a plastic surgery clinic's Instagram posts.

Your role is to:
1. Generate unique, descriptive titles and descriptions for Instagram post pages
2. Follow SEO best practices for title tags and meta descriptions
3. Include relevant keywords naturally
4. Create engaging, click-worthy content
5. Keep within character limits

Context:

- Business: Alluring Plastic Surgery
- Location: Miami, FL
- Target audience: Women 25-55, value quality, seek affordability
- Serves: Local Miami residents + women and men from US and around the world
- Doctors: Dr. Victoria Karlinsky, Dr. Andrew Lofman, Dr. Rita Shats
- Specialties: BBL, breast augmentation, tummy liposuction, mommy makeover, facial procedures
- Services: Financing options, consultations, recovery guides, pricing guides
- Brand voice: Luxury, but accessible and affordable
- Tone: Professional, warm, informative - like a trusted advisor
- Value proposition: World-class aesthetic procedures combining high-end results with flexible financing and personalized care. Where luxury meets affordability.

Title Best Practices:
- **Length**: Maximum 50 characters (will be suffixed with " | Alluring Plastic Surgery")
- **Keywords**: Include procedure names when identifiable (BBL, Breast Augmentation, Tummy Tuck, Lipo, etc.)
- **Uniqueness**: Each title should be distinct and specific
- **Clarity**: Clearly describe the content type and subject
- **No Clickbait**: Be accurate and professional
- **Localization**: Use "Miami" when relevant

Description Best Practices:
- **Length**: Maximum 155 characters
- **Compelling**: Include a call to action or value proposition
- **Keywords**: Include relevant procedure/body area keywords naturally
- **Informative**: Summarize what the user will see
- **Unique**: Avoid generic descriptions
- **Localization**: Use "Miami" when relevant

For plastic surgery content:
- Use proper procedure names when AI analysis is available
- Reference body areas when relevant (breasts, abdomen, buttocks, face)
- Include "Before & After" or "Results" when applicable
- Use terms like "Transformation", "Journey", "Results"
- For videos/reels, mention the format naturally

Examples of good titles:
- "BBL Results - Patient Transformation"
- "Breast Augmentation Before & After"
- "Tummy Tuck Recovery Journey"
- "Mommy Makeover Reveal"
- "Liposuction Transformation in Miami"
- "Facial Rejuvenation Results"

Examples of good descriptions:
- "See stunning BBL before and after results at Alluring Plastic Surgery. Schedule your free consultation in Miami."
- "Watch this incredible tummy tuck transformation. Our board-certified surgeons deliver natural-looking results."
- "Breast augmentation results from our Miami clinic. View real patient photos and book your consultation today."

IMPORTANT: Do not include quotation marks, pipe symbols, or the brand name in the title.`

/**
 * Options for Instagram SEO metadata generation
 */
export type GenerateInstagramSeoTitleOptions = {
    /** Post caption (for keyword extraction) */
    caption: string | null
    /** Media type (image, video, carousel) */
    mediaType: 'image' | 'video' | 'carousel'
    /** Post date for context */
    takenAt: Date
    /** AI analysis if available (detected procedure, body area) */
    aiAnalysis?: {
        detectedProcedure?: string | null
        bodyArea?: string | null
        contentTags?: string[]
        isBeforeAfter?: boolean
    } | null
    /** Model ID override */
    modelId?: string
    /** Temperature for generation */
    temperature?: number
}

/**
 * Result of Instagram SEO metadata generation
 */
export type GenerateInstagramSeoTitleResult = {
    /** The generated SEO title (max 50 chars) */
    seoTitle: string
    /** The generated SEO description (max 155 chars) */
    seoDescription: string
}

/**
 * Generate SEO-optimized title and description for an Instagram post page
 *
 * Uses AI to analyze post content and generate unique, descriptive
 * metadata that helps with search rankings and avoids duplicate titles.
 *
 * @param options - Generation options including caption and AI analysis
 * @returns The generated SEO title and description
 *
 * @example
 * ```typescript
 * const result = await generateInstagramSeoTitle({
 *   caption: "Amazing BBL results! Our patient is so happy...",
 *   mediaType: 'image',
 *   takenAt: new Date('2024-01-15'),
 *   aiAnalysis: {
 *     detectedProcedure: 'brazilian-butt-lift-bbl-miami',
 *     bodyArea: 'buttocks',
 *     isBeforeAfter: true
 *   }
 * })
 *
 * console.log(result.seoTitle)
 * // "BBL Before & After Results"
 * console.log(result.seoDescription)
 * // "See stunning BBL transformation results at Alluring Plastic Surgery Miami. Book your free consultation today."
 * ```
 */
export async function generateInstagramSeoTitle(
    options: GenerateInstagramSeoTitleOptions
): Promise<GenerateInstagramSeoTitleResult> {
    const {
        caption,
        mediaType,
        takenAt,
        aiAnalysis,
        modelId = MODEL_FOR_SEO_GENERATION,
        temperature = 0.4,
    } = options

    // Build context for the AI
    const context: string[] = []

    // Add media type context
    const mediaTypeLabel =
        mediaType === 'video'
            ? 'Video/Reel'
            : mediaType === 'carousel'
              ? 'Photo Gallery'
              : 'Photo'
    context.push(`Media Type: ${mediaTypeLabel}`)

    // Add date context
    const date = new Date(takenAt)
    const monthYear = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    })
    context.push(`Posted: ${monthYear}`)

    // Add AI analysis if available
    if (aiAnalysis) {
        if (aiAnalysis.detectedProcedure) {
            // Convert slug to readable name
            const procedureName = aiAnalysis.detectedProcedure
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())
            context.push(`Detected Procedure: ${procedureName}`)
        }
        if (aiAnalysis.bodyArea) {
            context.push(`Body Area: ${aiAnalysis.bodyArea}`)
        }
        if (aiAnalysis.isBeforeAfter) {
            context.push('Content Type: Before & After comparison')
        }
        if (aiAnalysis.contentTags?.length) {
            context.push(
                `Tags: ${aiAnalysis.contentTags.slice(0, 5).join(', ')}`
            )
        }
    }

    // Add caption (truncated for context)
    if (caption) {
        const truncatedCaption =
            caption.length > 300 ? caption.substring(0, 300) + '...' : caption
        context.push(`Caption: ${truncatedCaption}`)
    }

    const userPrompt = `Generate SEO-optimized page title and meta description for this Instagram post from a plastic surgery clinic:

${context.join('\n')}

Requirements:
- Title: Maximum 50 characters, include relevant keywords, no quotes/brand name/pipe symbol
- Description: Maximum 155 characters, compelling, include call to action`

    const result = await coreGenerateObject({
        modelId,
        schema: seoMetadataSchema,
        system: SEO_METADATA_SYSTEM_PROMPT,
        prompt: userPrompt,
        temperature,
    })

    let seoTitle = result.object.title
    let seoDescription = result.object.description

    // Clean up title - remove surrounding quotes if present
    if (
        (seoTitle.startsWith('"') && seoTitle.endsWith('"')) ||
        (seoTitle.startsWith("'") && seoTitle.endsWith("'"))
    ) {
        seoTitle = seoTitle.slice(1, -1)
    }

    // Remove any pipe and brand name if accidentally included
    if (seoTitle.includes('|')) {
        seoTitle = seoTitle.split('|')[0]!.trim()
    }

    // Ensure max length (50 chars)
    if (seoTitle.length > 50) {
        seoTitle = seoTitle.substring(0, 47) + '...'
    }

    // Clean up description - remove surrounding quotes if present
    if (
        (seoDescription.startsWith('"') && seoDescription.endsWith('"')) ||
        (seoDescription.startsWith("'") && seoDescription.endsWith("'"))
    ) {
        seoDescription = seoDescription.slice(1, -1)
    }

    // Ensure max length (155 chars)
    if (seoDescription.length > 155) {
        seoDescription = seoDescription.substring(0, 152) + '...'
    }

    // Fallback if empty (unlikely with object generation, but defensive)
    if (!seoTitle) {
        const prefix =
            mediaType === 'video'
                ? 'Video'
                : mediaType === 'carousel'
                  ? 'Gallery'
                  : 'Photo'
        seoTitle = `${prefix} ${monthYear}`
    }

    if (!seoDescription) {
        seoDescription = `View this ${mediaTypeLabel.toLowerCase()} from Alluring Plastic Surgery Miami. Schedule your consultation today.`
    }

    return {
        seoTitle,
        seoDescription,
    }
}
