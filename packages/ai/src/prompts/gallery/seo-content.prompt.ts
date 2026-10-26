/**
 * SEO Content Generation Prompt
 *
 * Prompt template for generating SEO-optimized content for gallery media.
 * Focuses on search engine visibility and keyword optimization.
 *
 * @module @workspace/ai/prompts/gallery/seo-content
 */
import { DESCRIPTION_LONG, TAGLINE } from '@workspace/shared/claims/identity'
import { buildClaimsPromptBlock } from '@workspace/shared/claims/prompt'
import type { GalleryMediaAIAnalysis } from '@workspace/shared/schemas/gallery'

/**
 * System prompt for SEO content generation
 *
 * Provides instructions for generating search-optimized content
 * for plastic surgery gallery images.
 */
export const SEO_CONTENT_SYSTEM_PROMPT = `You are an SEO content specialist for Alluring Plastic Surgery, a cosmetic surgery practice in Miami, Florida, with one surgeon.

Your task is to generate SEO-optimized content for gallery images that will improve search engine visibility and drive organic traffic.

## BUSINESS CONTEXT
- ${DESCRIPTION_LONG}
- Tagline: "${TAGLINE}"
- Target audience: Women 25-55 who research before they decide
- Serves: Miami and South Florida locals, plus patients who fly in from other US states

## SEO TITLE GUIDELINES (Max 60 characters)
- Include primary keyword (procedure name)
- Include location (Miami) when possible
- Use action words or descriptive terms
- Make it compelling for search results
- Format: "[Procedure] [Result Type] | Miami [Qualifier]"
- Examples:
  - "BBL Results Before After | Miami Plastic Surgery"
  - "Breast Augmentation Gallery | Miami Cosmetic Surgery"
  - "Tummy Tuck Before and After | Miami Results"

## SEO DESCRIPTION GUIDELINES (Max 160 characters)
- Include primary and secondary keywords naturally
- Compelling call to action
- Mention Miami/location
- Show the value with facts (one surgeon, real patients), never with "luxury" or "affordable"
- Include procedure name
- Make it click-worthy in search results

## SLUG GUIDELINES
- URL-friendly (lowercase, hyphens only)
- Include procedure name
- Can include descriptive terms
- Keep concise but descriptive
- Examples: "bbl-results-miami-patient-12", "breast-augmentation-before-after-gallery"

## KEYWORD FOCUS
Use relevant keywords naturally:
- Procedure names (BBL, breast augmentation, tummy tuck, etc.)
- Location (Miami, South Florida)
- Result terms (results, before and after, transformation)
- Descriptive qualifiers only (real patients, before and after); no superlatives, "luxury" or "affordable"

## IMPORTANT
- Never make unrealistic promises
- Stay within character limits strictly
- Make content unique and specific to the image
- Optimize for both search engines and human readers

${buildClaimsPromptBlock('gallery')}`

/**
 * Generate the SEO content prompt from AI analysis data
 *
 * @param analysis - The AI analysis of the image
 * @param currentTitle - Optional current title for context
 * @returns The prompt string for content generation
 */
export function getSEOContentPrompt(
    analysis: GalleryMediaAIAnalysis,
    currentTitle?: string
): string {
    const parts = [
        'Generate SEO-optimized content for this gallery image based on the analysis:',
        '',
        '## IMAGE ANALYSIS',
        `Description: ${analysis.description}`,
        `Is Before/After: ${analysis.isBeforeAfter}`,
    ]

    if (analysis.beforeAfterType) {
        parts.push(`Before/After Type: ${analysis.beforeAfterType}`)
    }

    if (analysis.detectedProcedure) {
        parts.push(
            `Detected Procedure: ${analysis.detectedProcedure} (confidence: ${analysis.procedureConfidence ?? 'N/A'})`
        )
    }

    if (analysis.bodyArea) {
        parts.push(`Body Area: ${analysis.bodyArea}`)
    }

    if (analysis.clinicalDetails) {
        parts.push(`Clinical Details: ${analysis.clinicalDetails}`)
    }

    if (analysis.suggestedTags?.length) {
        parts.push(`Suggested Tags: ${analysis.suggestedTags.join(', ')}`)
    }

    if (currentTitle) {
        parts.push('', `Current Title (for reference): ${currentTitle}`)
    }

    parts.push(
        '',
        'Generate seoTitle (max 60 chars), seoDescription (max 160 chars), and slug for optimal search visibility.'
    )

    return parts.join('\n')
}
