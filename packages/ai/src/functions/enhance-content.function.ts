/**
 * Enhance Content Function
 *
 * Quality enhancement pass for generated blog content.
 * Improves natural language flow, fixes issues, and ensures
 * human-like writing quality.
 *
 * @module @workspace/ai/functions/enhance-content
 */
import { coreGenerateText } from '../core'
import {
    scoreContentQuality,
    type QualityScoreResult,
} from './score-content-quality.function'

/**
 * Enhancement result type
 */
export type EnhanceContentResult = {
    /** Enhanced content */
    content: string
    /** Quality score after enhancement */
    qualityScore: QualityScoreResult
    /** Number of enhancement passes performed */
    passesPerformed: number
    /** Word count of final content */
    wordCount: number
}

/**
 * Options for content enhancement
 */
export type EnhanceContentOptions = {
    /** Raw content to enhance */
    content: string
    /** Primary keyword for SEO checks */
    primaryKeyword: string
    /** Target audience for relevance */
    targetAudience?: string
    /** Minimum quality score threshold */
    minQualityScore?: number
    /** Maximum enhancement passes */
    maxPasses?: number
    /** Specific feedback to address */
    feedback?: string[]
    /** Model ID to use (default: gpt-5.2) */
    modelId?: string
}

/**
 * System prompt for content enhancement
 */
const ENHANCE_CONTENT_SYSTEM_PROMPT = `You are an expert editor for a luxury plastic surgery clinic blog.

Your role is to enhance blog content while preserving its structure and meaning.

**Enhancement Goals:**

1. **Natural Language Flow**
   - Vary sentence structure and length
   - Remove robotic or AI-sounding phrases
   - Add conversational transitions
   - Use contractions naturally (we're, you'll, it's)

2. **Brand Voice Alignment**
   - Clear, direct language
   - Confident but not arrogant
   - Technical but accessible
   - Remove corporate jargon

3. **Engagement Improvement**
   - Strengthen the opening hook
   - Add rhetorical questions where natural
   - Include relatable examples
   - Ensure clear value throughout

4. **Readability Enhancement**
   - Break up long paragraphs
   - Improve bullet point clarity
   - Enhance heading scannability
   - Fix awkward phrasing

**Rules:**
- Preserve all internal/external links exactly
- Keep FAQ sections intact
- Maintain heading structure (H2, H3)
- Don't add new sections or remove existing ones
- Keep the same overall length (±10%)
- Preserve all factual information and citations

Return ONLY the enhanced markdown content, nothing else.`

/**
 * Enhance content with specific feedback
 */
async function enhanceWithFeedback(
    content: string,
    feedback: string[],
    modelId: string
): Promise<string> {
    const feedbackList = feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')

    const result = await coreGenerateText({
        modelId,
        system: ENHANCE_CONTENT_SYSTEM_PROMPT,
        prompt: `Enhance the following blog post, specifically addressing these improvement areas:

**Improvements Needed:**
${feedbackList}

---

**Content to Enhance:**

${content}

---

Apply the improvements while following all enhancement guidelines. Return only the enhanced markdown.`,
        temperature: 0.6,
    })

    return result.text
}

/**
 * General enhancement pass
 */
async function generalEnhance(
    content: string,
    modelId: string
): Promise<string> {
    const result = await coreGenerateText({
        modelId,
        system: ENHANCE_CONTENT_SYSTEM_PROMPT,
        prompt: `Enhance the following blog post for natural language flow and brand voice:

${content}

---

Apply all enhancement guidelines. Return only the enhanced markdown.`,
        temperature: 0.6,
    })

    return result.text
}

/**
 * Enhance content quality
 *
 * Performs one or more enhancement passes on generated content
 * to improve natural language flow, brand voice alignment,
 * and overall quality.
 *
 * @param options - Enhancement options
 * @returns Enhanced content with quality score
 *
 * @example
 * ```typescript
 * const result = await enhanceContent({
 *   content: rawBlogContent,
 *   primaryKeyword: 'bbl recovery',
 *   minQualityScore: 8,
 *   maxPasses: 2,
 * })
 *
 * console.log('Quality:', result.qualityScore.overall)
 * console.log('Passes:', result.passesPerformed)
 * console.log(result.content)
 * ```
 */
export async function enhanceContent(
    options: EnhanceContentOptions
): Promise<EnhanceContentResult> {
    const {
        content: initialContent,
        primaryKeyword,
        targetAudience = 'Women 25-55 considering cosmetic procedures',
        minQualityScore = 7,
        maxPasses = 2,
        feedback,
        modelId = 'gpt-5.2',
    } = options

    let currentContent = initialContent
    let passesPerformed = 0

    // Initial quality score
    let qualityScore = await scoreContentQuality({
        content: currentContent,
        primaryKeyword,
        targetAudience,
        threshold: minQualityScore,
    })

    // If already passes threshold and no specific feedback, return as-is
    if (qualityScore.passesThreshold && !feedback?.length) {
        return {
            content: currentContent,
            qualityScore,
            passesPerformed: 0,
            wordCount: currentContent.split(/\s+/).length,
        }
    }

    // Enhancement loop
    while (passesPerformed < maxPasses) {
        passesPerformed++

        // Determine what feedback to use
        const feedbackToUse =
            feedback && passesPerformed === 1
                ? feedback
                : qualityScore.improvements

        // Perform enhancement
        if (feedbackToUse.length > 0) {
            currentContent = await enhanceWithFeedback(
                currentContent,
                feedbackToUse,
                modelId
            )
        } else {
            currentContent = await generalEnhance(currentContent, modelId)
        }

        // Re-score
        qualityScore = await scoreContentQuality({
            content: currentContent,
            primaryKeyword,
            targetAudience,
            threshold: minQualityScore,
        })

        // Check if we've reached the threshold
        if (qualityScore.passesThreshold) {
            break
        }
    }

    return {
        content: currentContent,
        qualityScore,
        passesPerformed,
        wordCount: currentContent.split(/\s+/).length,
    }
}
