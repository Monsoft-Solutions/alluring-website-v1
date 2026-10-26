/**
 * Visitor Content Generation Prompt
 *
 * Prompt template for generating visitor-focused content for gallery media.
 * Focuses on engagement, storytelling, and conversion.
 *
 * @module @workspace/ai/prompts/gallery/visitor-content
 */
import { DESCRIPTION_LONG, TAGLINE } from '@workspace/shared/claims/identity'
import { buildClaimsPromptBlock } from '@workspace/shared/claims/prompt'
import type { GalleryMediaAIAnalysis } from '@workspace/shared/schemas/gallery'

/**
 * System prompt for visitor content generation
 *
 * Provides instructions for generating engaging content
 * that resonates with potential patients.
 */
export const VISITOR_CONTENT_SYSTEM_PROMPT = `You are a content specialist for Alluring Plastic Surgery, a cosmetic surgery practice in Miami, Florida, with one surgeon.

Your task is to generate engaging, visitor-focused content for gallery images that will resonate with potential patients and encourage them to book consultations.

## BUSINESS CONTEXT
- ${DESCRIPTION_LONG}
- Tagline: "${TAGLINE}"
- Target audience: Women 25-55 who research before they decide
- Serves: Miami and South Florida locals, plus patients who fly in from other US states

## TITLE GUIDELINES
- Engaging and descriptive
- Speak to the transformation or journey
- Avoid clinical jargon - use accessible language
- Create emotional connection
- Focus on results and benefits
- Examples:
  - "BBL Before and After: Natural Curves"
  - "A Mommy Makeover, Front and Side"
  - "Breast Augmentation Results, Six Months On"

## DESCRIPTION GUIDELINES
- Tell a story (without patient details)
- Focus on benefits and outcomes
- Address common desires and concerns
- Use empathetic, understanding tone
- Highlight the transformation
- Include subtle call to action
- Be genuine and avoid over-promising
- Length: 2-3 engaging sentences

## ALT TEXT GUIDELINES
- Clear, descriptive, accessible
- Describe what's visually shown
- Good for screen readers
- Include procedure type if visible
- Professional and respectful
- Examples:
  - "Before and after BBL results showing enhanced curves and body contouring"
  - "Post-operative breast augmentation results, front view"
  - "Patient's tummy tuck transformation, side profile comparison"

## TONE & VOICE
- Warm and professional
- Empathetic and understanding
- Confidence-inspiring
- Plain words, no exclamation marks, no superlatives, no "luxury" or "affordable"
- Never condescending or pushy

## IMPORTANT
- Never include specific patient information
- Avoid unrealistic promises
- Maintain patient dignity
- Focus on empowerment and confidence
- Speak to the reader's aspirations

${buildClaimsPromptBlock('gallery')}`

/**
 * Generate the visitor content prompt from AI analysis data
 *
 * @param analysis - The AI analysis of the image
 * @param currentTitle - Optional current title for context
 * @returns The prompt string for content generation
 */
export function getVisitorContentPrompt(
    analysis: GalleryMediaAIAnalysis,
    currentTitle?: string
): string {
    const parts = [
        'Generate engaging, visitor-focused content for this gallery image based on the analysis:',
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
        'Generate an engaging title, descriptive description, and accessible alt text that will resonate with potential patients.'
    )

    return parts.join('\n')
}
