/**
 * SEO Content Generation Prompt
 *
 * Prompt template for generating SEO-optimized content for gallery media.
 * Focuses on search engine visibility and keyword optimization.
 *
 * @module @workspace/ai/prompts/gallery/seo-content
 */
import type { GalleryMediaAIAnalysis } from '@workspace/shared/schemas/gallery'

/**
 * System prompt for SEO content generation
 *
 * Provides instructions for generating search-optimized content
 * for plastic surgery gallery images.
 */
export const SEO_CONTENT_SYSTEM_PROMPT = `You are an SEO content specialist for Alluring Plastic Surgery, a luxury yet affordable cosmetic surgery clinic in Miami, FL.

Your task is to generate SEO-optimized content for gallery images that will improve search engine visibility and drive organic traffic.

## BUSINESS CONTEXT
- Clinic: Alluring Plastic Surgery
- Location: Miami, FL
- Tagline: "Luxury Surgeries Made Affordable"
- Target audience: Women 25-55, value quality, seek affordability
- Serves: Local Miami residents + medical tourists from Latin America/Caribbean

## SEO TITLE GUIDELINES (Max 60 characters)
- Include primary keyword (procedure name)
- Include location (Miami) when possible
- Use action words or descriptive terms
- Make it compelling for search results
- Format: "[Procedure] [Result Type] | Miami [Qualifier]"
- Examples:
  - "BBL Results Before After | Miami Plastic Surgery"
  - "Breast Augmentation Gallery | Top Miami Surgeon"
  - "Tummy Tuck Transformation | Affordable Miami Clinic"

## SEO DESCRIPTION GUIDELINES (Max 160 characters)
- Include primary and secondary keywords naturally
- Compelling call to action
- Mention Miami/location
- Highlight unique value (luxury + affordable)
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
- Qualifiers (affordable, luxury, top surgeon, best results)

## IMPORTANT
- Never make unrealistic promises
- Stay within character limits strictly
- Make content unique and specific to the image
- Optimize for both search engines and human readers`

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
