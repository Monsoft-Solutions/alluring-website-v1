/**
 * Generate Instagram SEO Title Function
 *
 * AI-powered SEO title generation for Instagram posts.
 * Creates unique, descriptive titles for individual post pages
 * to avoid duplicate title issues in Google Search Console.
 *
 * @module @workspace/ai/functions/generate-instagram-seo-title
 */
import { coreGenerateText } from '../core'

/**
 * Model for SEO title generation (cost-efficient)
 */
const MODEL_FOR_SEO_TITLE_GENERATION = 'gpt-4.1-mini'

/**
 * System prompt for Instagram SEO title generation
 */
const SEO_TITLE_SYSTEM_PROMPT = `You are an expert in writing SEO-optimized page titles for a plastic surgery clinic's Instagram posts.

Your role is to:
1. Generate unique, descriptive titles for Instagram post pages
2. Follow SEO best practices for title tags
3. Include relevant keywords naturally
4. Create engaging, click-worthy titles
5. Keep titles concise and within character limits

Title Best Practices:
- **Length**: Maximum 50 characters (will be suffixed with " | Alluring Plastic Surgery")
- **Keywords**: Include procedure names when identifiable (BBL, Breast Augmentation, Tummy Tuck, Lipo, etc.)
- **Uniqueness**: Each title should be distinct and specific
- **Clarity**: Clearly describe the content type and subject
- **No Clickbait**: Be accurate and professional

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
- "Liposuction Transformation"
- "Facial Rejuvenation Results"

Output Requirements:
- Maximum 50 characters
- No quotation marks around the text
- No pipe symbol or brand name (will be added automatically)
- Professional medical terminology
- Title case capitalization`

/**
 * Options for Instagram SEO title generation
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
 * Result of Instagram SEO title generation
 */
export type GenerateInstagramSeoTitleResult = {
    /** The generated SEO title (max 50 chars) */
    seoTitle: string
}

/**
 * Generate an SEO-optimized title for an Instagram post page
 *
 * Uses AI to analyze post content and generate a unique, descriptive
 * title that helps with search rankings and avoids duplicate titles.
 *
 * @param options - Generation options including caption and AI analysis
 * @returns The generated SEO title
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
        modelId = MODEL_FOR_SEO_TITLE_GENERATION,
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

    const userPrompt = `Generate an SEO-optimized page title for this Instagram post from a plastic surgery clinic:

${context.join('\n')}

Requirements:
- Maximum 50 characters
- Include relevant procedure/body area keywords if identifiable
- Make it unique and descriptive
- Professional medical tone
- No quotation marks
- No brand name or pipe symbol

Generate the title now:`

    const result = await coreGenerateText({
        modelId,
        system: SEO_TITLE_SYSTEM_PROMPT,
        prompt: userPrompt,
        temperature,
        maxTokens: 30,
    })

    // Clean up the result
    let seoTitle = result.text.trim()

    // Remove surrounding quotes if present
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

    // Ensure max length (50 chars, will have " | Alluring Plastic Surgery" appended)
    if (seoTitle.length > 50) {
        seoTitle = seoTitle.substring(0, 47) + '...'
    }

    return {
        seoTitle,
    }
}
