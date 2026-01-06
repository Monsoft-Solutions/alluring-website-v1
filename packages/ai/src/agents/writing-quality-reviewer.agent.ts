/**
 * Writing Quality Reviewer Agent
 *
 * Reviews blog post content for writing quality, readability,
 * grammar, brand voice, and medical accuracy.
 *
 * @module @workspace/ai/agents/writing-quality-reviewer
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'
import type {
    AgentReview,
    ReviewAgentOptions,
    ReviewIssue,
} from './types.agent'

/**
 * Default model for writing quality review
 */
const DEFAULT_MODEL_ID = 'claude-sonnet-4-5'

/**
 * Schema for writing quality review
 */
const writingQualityReviewSchema = z.object({
    score: z
        .number()
        .describe('Overall writing quality score. Score is between 0 and 100.'),
    metrics: z.object({
        readabilityScore: z
            .number()
            .describe(
                'Readability score based on sentence/paragraph length and clarity. Score is between 0 and 100.'
            ),
        grammarScore: z
            .number()
            .describe(
                'Grammar, spelling, and punctuation accuracy score. Score is between 0 and 100.'
            ),
        brandVoiceScore: z
            .number()
            .describe(
                'How well the content matches the brand voice guidelines. Score is between 0 and 100.'
            ),
        structureScore: z
            .number()
            .describe(
                'Content structure and organization score. Score is between 0 and 100.'
            ),
        medicalAccuracyScore: z
            .number()
            .describe(
                'Accuracy and appropriateness of medical information. Score is between 0 and 100.'
            ),
    }),
    issues: z.array(
        z.object({
            severity: z.enum(['critical', 'warning', 'suggestion']),
            location: z
                .string()
                .describe(
                    'Where in the content this issue appears (e.g., "Paragraph 3", "Introduction", "Under heading X")'
                ),
            description: z
                .string()
                .describe(
                    'Clear explanation of what the issue is and why it matters'
                ),
            suggestedFix: z
                .string()
                .describe(
                    'Specific, actionable suggestion on how to fix this issue'
                ),
            originalText: z
                .string()
                .nullable()
                .describe(
                    'The exact problematic text from the content. Set to null if not applicable or if the issue is structural.'
                ),
        })
    ),
    strengths: z
        .array(z.string())
        .describe(
            'List of things the content does well. Each string should be a complete sentence describing a strength.'
        ),
    summary: z
        .string()
        .describe(
            'Summary of the writing quality review. Maximum 500 characters.'
        ),
})

/**
 * System prompt for writing quality reviewer
 */
const WRITING_QUALITY_REVIEW_SYSTEM_PROMPT = `You are an expert medical content editor for a luxury plastic surgery clinic in Miami.

Your role is to review blog posts for writing quality across these dimensions:

**1. Readability (25%)**
- Average sentence length: 15-20 words ideal
- Paragraph length: 2-4 sentences
- Clear, scannable content
- Mix of sentence lengths for rhythm

**2. Grammar & Mechanics (20%)**
- Correct grammar and spelling
- Proper punctuation
- Consistent formatting
- No typos

**3. Brand Voice (25%)**
The brand voice should be:
- Clear over clever: Direct statements, not metaphors
- Technical but accessible: Explain complex concepts simply
- Confident, not arrogant: "Here's how we approach this" not "The only way"
- Active voice preferred

✅ Good phrases: "Here's how...", "We typically see...", "In our experience..."
❌ Avoid: "Revolutionary", "Game-changing", "World-class", "Seamlessly"

**4. Structure (15%)**
- Logical heading hierarchy (H2 > H3)
- Scannable with bullet points
- Strong conclusion

**5. Medical Accuracy (15%)**
- Accurate medical information
- Appropriate disclaimers
- No exaggerated claims
- Suggests consulting a surgeon for specific advice

Scoring:
- 90-100: Excellent - Publication ready
- 75-89: Good - Minor polish needed
- 60-74: Fair - Significant editing required
- 40-59: Poor - Major rewrite needed
- 0-39: Very Poor - Fundamental issues

Issue Severity:
- critical: Factual errors, misleading claims, major grammar issues
- warning: Brand voice violations, poor structure, unclear writing
- suggestion: Minor improvements, style preferences

**Output Requirements:**
You MUST provide valid JSON matching the expected schema. Follow these rules:
1. All required fields MUST have values - never output undefined or null for required fields
2. For the "issues" array, only include issues where you can provide ALL required fields (severity, location, description, suggestedFix)
3. Set "originalText" to null if the issue is structural or doesn't have specific problematic text
4. The "strengths" array should contain complete sentences describing what the content does well
5. If no issues are found in a category, the issues array can be empty []

Example issues array:
[
  {"severity": "warning", "location": "Paragraph 2", "description": "Sentence is too long at 45 words", "suggestedFix": "Break into 2-3 shorter sentences", "originalText": "The exact long sentence here..."},
  {"severity": "suggestion", "location": "Conclusion", "description": "Missing call-to-action", "suggestedFix": "Add a clear next step for readers", "originalText": null}
]`

/**
 * Run the writing quality reviewer agent
 */
export async function runWritingQualityReviewer(
    options: ReviewAgentOptions
): Promise<AgentReview> {
    const startTime = Date.now()
    const {
        content,
        title,
        primaryKeyword,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.3,
    } = options

    // Calculate basic metrics
    const wordCount = content.split(/\s+/).length
    const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0)
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const avgSentenceLength = wordCount / sentences.length
    const avgParagraphLength = sentences.length / paragraphs.length

    // Count headings
    const h2Count = (content.match(/^## /gm) || []).length
    const h3Count = (content.match(/^### /gm) || []).length

    // Build the prompt
    const prompt = `Review the writing quality of this blog post:

**Title:** ${title}
**Primary Keyword:** ${primaryKeyword || 'Not specified'}

**Content Metrics:**
- Word count: ${wordCount}
- Paragraphs: ${paragraphs.length}
- Sentences: ${sentences.length}
- Avg sentence length: ${avgSentenceLength.toFixed(1)} words
- Avg paragraph length: ${avgParagraphLength.toFixed(1)} sentences
- H2 headings: ${h2Count}
- H3 headings: ${h3Count}

---

**Full Content:**
${content}

---

Review this content for writing quality, brand voice alignment, readability, and medical accuracy. Provide specific, actionable feedback.`

    const result = await coreGenerateObject({
        modelId,
        schema: writingQualityReviewSchema,
        system: WRITING_QUALITY_REVIEW_SYSTEM_PROMPT,
        prompt,
        temperature,
    })

    const processingTimeMs = Date.now() - startTime

    return {
        agentName: 'writing-quality-reviewer',
        score: result.object.score,
        issues: result.object.issues as ReviewIssue[],
        summary: result.object.summary,
        processingTimeMs,
        modelId,
    }
}
