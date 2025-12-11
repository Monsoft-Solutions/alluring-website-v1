/**
 * Text Improvement Prompt
 *
 * Prompt templates for AI-powered text improvement operations.
 * Includes general operations and industry-specific operations
 * for Alluring Plastic Surgery content.
 *
 * @module @workspace/ai/prompts/text/text-improvement
 */

import type { TextOperation } from '@workspace/shared/schemas/text'

/**
 * System prompt for text improvement
 *
 * Provides context about the business and general guidelines
 * for improving content for Alluring Plastic Surgery.
 */
export const TEXT_IMPROVEMENT_SYSTEM_PROMPT = `You are an expert content editor for Alluring Plastic Surgery, a luxury yet affordable cosmetic surgery clinic in Miami, FL.

## BUSINESS CONTEXT
- Clinic: Alluring Plastic Surgery
- Location: Miami, FL
- Tagline: "Luxury Surgeries Made Affordable"
- Target audience: Women 25-55 who value quality and seek affordability
- Serves: Local Miami residents + medical tourists from Latin America/Caribbean

## YOUR ROLE
You help improve text content for the clinic's website, gallery, and marketing materials.
Your edits should be clear, engaging, and appropriate for the cosmetic surgery industry.

## IMPORTANT GUIDELINES
- Never make unrealistic medical promises or guarantees
- Maintain professionalism while being warm and approachable
- Focus on patient outcomes and transformation stories
- Be sensitive to the emotional nature of cosmetic procedures
- Use natural, human-sounding language (avoid AI-sounding text)
- Keep the brand voice: luxury, but accessible and affordable

## OUTPUT
Return ONLY the improved text. Do not include explanations, quotes, or formatting.
The improved text should be ready to use directly.`

/**
 * Operation-specific instructions
 */
const OPERATION_INSTRUCTIONS: Record<TextOperation, string> = {
    // General operations
    improve: `Enhance the clarity, readability, and impact of this text.
- Fix any awkward phrasing
- Improve word choice
- Make it flow better
- Keep the same length and meaning`,

    shorter: `Make this text more concise while keeping the key information.
- Remove unnecessary words and phrases
- Combine sentences where possible
- Maintain the core message
- Aim for 30-50% reduction in length`,

    longer: `Expand this text with more relevant details.
- Add descriptive language
- Include supporting details
- Maintain the same tone
- Aim for 50-100% increase in length`,

    'fix-grammar': `Correct all grammar, spelling, and punctuation errors.
- Fix spelling mistakes
- Correct grammar issues
- Improve punctuation
- Do not change the meaning or style`,

    professional: `Rewrite this text in a more professional, formal tone.
- Use formal language
- Avoid contractions
- Use industry-appropriate terminology
- Maintain a confident, authoritative voice`,

    casual: `Rewrite this text in a more casual, friendly tone.
- Use conversational language
- Include contractions where natural
- Be warm and approachable
- Keep it professional but relaxed`,

    custom: `Follow the custom instruction provided to modify this text.`,

    // Industry-specific operations
    'seo-optimize': `Optimize this text for search engines while keeping it natural.
- Add relevant cosmetic surgery keywords naturally
- Include procedure names where appropriate
- Add location references (Miami, South Florida) if relevant
- Keep the text readable and human-friendly
- Don't stuff keywords - make it natural`,

    'benefit-focused': `Rewrite to emphasize patient benefits and transformation.
- Focus on outcomes and results
- Highlight the transformation journey
- Use aspirational language
- Connect with patient emotions and goals
- Avoid clinical/technical jargon`,

    empathetic: `Add warmth and understanding for patients considering surgery.
- Acknowledge the emotional nature of the decision
- Use supportive, encouraging language
- Be reassuring without being dismissive
- Show understanding of patient concerns
- Maintain professionalism`,

    'luxury-tone': `Align with the "Luxury Surgeries Made Affordable" brand positioning.
- Use elegant, sophisticated language
- Convey quality and exclusivity
- Balance luxury with accessibility
- Avoid pretentious or snobby tones
- Make luxury feel attainable`,

    'add-cta': `Strengthen the call-to-action for consultation booking.
- Add or enhance call-to-action language
- Create urgency without being pushy
- Encourage consultation booking
- Be welcoming and inviting
- Include actionable next steps`,
}

/**
 * Generate the text improvement prompt
 *
 * @param operation - The type of improvement operation
 * @param fieldName - The name of the field being edited (e.g., "title", "description")
 * @param currentText - The current text to improve
 * @param customInstruction - Custom instruction (only for 'custom' operation)
 * @returns The prompt string for text improvement
 */
export function getTextImprovementPrompt(
    operation: TextOperation,
    fieldName: string,
    currentText: string,
    customInstruction?: string
): string {
    const operationInstruction =
        operation === 'custom' && customInstruction
            ? customInstruction
            : OPERATION_INSTRUCTIONS[operation]

    return `## TASK
${operationInstruction}

## FIELD CONTEXT
Field Name: ${fieldName}
${getFieldContext(fieldName)}

## CURRENT TEXT
${currentText}

## OUTPUT
Provide only the improved text, nothing else.`
}

/**
 * Get additional context based on the field name
 */
function getFieldContext(fieldName: string): string {
    const contexts: Record<string, string> = {
        title: 'This is a title/headline. Keep it concise and impactful.',
        description:
            'This is a description field. It should be engaging and informative.',
        alt: 'This is image alt text. It should be descriptive for accessibility and SEO.',
        seoTitle:
            'This is an SEO title (max 60 characters). Optimize for search engines.',
        seoDescription:
            'This is an SEO meta description (max 160 characters). Make it compelling for search results.',
        slug: 'This is a URL slug. Keep it lowercase with hyphens.',
    }

    return contexts[fieldName] || 'Improve this text appropriately.'
}
