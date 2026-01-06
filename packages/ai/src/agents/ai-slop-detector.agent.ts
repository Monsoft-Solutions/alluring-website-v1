/**
 * AI Slop Detector Agent
 *
 * Detects AI-generated content patterns and flags phrases that
 * indicate low-quality or unnatural AI writing.
 *
 * @module @workspace/ai/agents/ai-slop-detector
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'
import {
    findBannedPhrases,
    calculateAISlopScore,
    ALL_BANNED_PHRASES,
} from '../config/banned-phrases.config'
import type {
    AgentReview,
    ReviewAgentOptions,
    ReviewIssue,
} from './types.agent'

/**
 * Default model for AI slop detection
 */
const DEFAULT_MODEL_ID = 'claude-opus-4-5'

/**
 * Schema for AI slop detection review
 */
const aiSlopDetectionSchema = z.object({
    score: z
        .number()
        .describe('Score (0-100, higher is better - less AI slop)'),
    aiPatternScore: z
        .number()
        .describe(
            'How much the content reads like AI-generated text (0=very AI, 100=very human)'
        ),
    issues: z.array(
        z.object({
            severity: z.enum(['critical', 'warning', 'suggestion']),
            location: z
                .string()
                .describe(
                    'Where in the content this issue appears (e.g., "Paragraph 2", "Introduction", "Line 15")'
                ),
            description: z
                .string()
                .describe('Clear description of what the issue is'),
            suggestedFix: z
                .string()
                .describe('Specific actionable suggestion to fix the issue'),
            originalText: z
                .string()
                .optional()
                .describe(
                    'The exact problematic text from the content. Omit if not applicable.'
                ),
        })
    ),
    patterns: z
        .array(
            z.object({
                pattern: z
                    .string()
                    .describe(
                        'The exact text, phrase, or sentence structure that was detected as an AI pattern (e.g., "In today\'s world", "It\'s worth noting that")'
                    ),
                occurrences: z
                    .number()
                    .describe(
                        'How many times this exact pattern appears in the content'
                    ),
                category: z
                    .string()
                    .describe(
                        'Classification type: "repetitive-structure", "generic-transition", "corporate-jargon", "filler-phrase", or "unnatural-formality"'
                    ),
            })
        )
        .describe(
            'AI patterns detected beyond the banned phrases list. Only include patterns where you can identify the exact text.'
        ),
    summary: z
        .string()
        .describe('Summary of the AI slop detection. Maximum 500 characters.'),
})

/**
 * System prompt for AI slop detector
 */
const AI_SLOP_DETECTION_SYSTEM_PROMPT = `You are an expert at detecting AI-generated content. Your role is to identify text that sounds robotic, generic, or like typical AI output.

**Your Task:**
Analyze the content and identify:
1. Banned phrases that are telltale signs of AI content
2. Patterns of unnatural writing
3. Corporate jargon and buzzwords
4. Overly formal or robotic sentence structures
5. Lack of authentic voice or personality

**Common AI Content Patterns:**
- Starting paragraphs with "In today's world" or "In this article"
- Overuse of words like "delve", "tapestry", "myriad", "plethora"
- Phrases like "It's worth noting", "It's important to note"
- Corporate buzzwords: "leverage", "synergy", "paradigm"
- Marketing clichés: "unlock the power", "transform your", "revolutionary"
- Overly dramatic transitions: "embark on a journey", "dive deep into"
- Unnaturally perfect paragraph transitions
- Repetitive sentence structures
- Lack of specific examples or personal touches
- Generic conclusions that don't add value

**Scoring:**
- 90-100: Excellent - Reads naturally, no AI patterns
- 75-89: Good - Minor AI patterns, mostly natural
- 60-74: Fair - Several AI patterns need fixing
- 40-59: Poor - Heavy AI influence, needs rewriting
- 0-39: Very Poor - Obviously AI-generated

**Issue Severity:**
- critical: Classic AI phrases ("delve", "tapestry"), false medical claims
- warning: Corporate jargon, marketing clichés, unnatural transitions
- suggestion: Minor formality issues, could be more conversational

**Output Requirements:**
You MUST provide valid JSON matching the expected schema. Follow these rules:
1. All required fields MUST have values - never output undefined or null for required fields
2. For the "patterns" array, only include patterns where you can identify the EXACT text/phrase from the content
3. If you cannot find the exact text for a pattern, do NOT include that pattern in the array
4. The "pattern" field must contain the actual text found (e.g., "In today's world"), NOT a description
5. The "category" field is a classification label, NOT the pattern itself

Example patterns array:
[
  {"pattern": "In today's world", "occurrences": 2, "category": "generic-transition"},
  {"pattern": "It's worth noting", "occurrences": 1, "category": "filler-phrase"},
  {"pattern": "A good surgeon will..., You should...", "occurrences": 4, "category": "repetitive-structure"}
]

Focus on making the content sound authentically human and aligned with the brand voice.`

/**
 * Run the AI slop detector agent
 */
export async function runAISlopDetector(
    options: ReviewAgentOptions
): Promise<AgentReview> {
    const startTime = Date.now()
    const {
        content,
        title,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.3,
    } = options

    // Pre-analyze using the banned phrases list
    const bannedPhrasesFound = findBannedPhrases(content)
    const preSlopScore = calculateAISlopScore(content)

    // Build pre-analysis summary
    const preAnalysis = bannedPhrasesFound
        .slice(0, 20) // Top 20 issues
        .map((found) => {
            return `- "${found.phrase.phrase}" (${found.phrase.severity}) - Found ${found.count} times - ${found.phrase.description}`
        })
        .join('\n')

    // Build the prompt
    const prompt = `Analyze this blog post for AI-generated content patterns:

**Title:** ${title}

**Pre-Analysis (Banned Phrases Found: ${bannedPhrasesFound.length}):**
${preAnalysis || 'No banned phrases from the list were found.'}

**Preliminary AI Slop Score:** ${preSlopScore}/100 (lower is better - this is just from banned phrases)

---

**Full Content:**
${content}

---

**Known Banned Phrases List (${ALL_BANNED_PHRASES.length} total):**
Categories: corporate jargon, ai-pattern, medical-claim, filler

Go beyond the pre-analysis and look for:
1. Repetitive sentence structures
2. Unnaturally perfect transitions
3. Generic examples or advice
4. Lack of specific, concrete details
5. Overly formal tone that doesn't match the brand voice
6. Any other AI patterns not in the banned list

Provide a comprehensive review with specific fixes.`

    const result = await coreGenerateObject({
        modelId,
        schema: aiSlopDetectionSchema,
        system: AI_SLOP_DETECTION_SYSTEM_PROMPT,
        prompt,
        temperature,
    })

    const processingTimeMs = Date.now() - startTime

    // Map PhraseSeverity to IssueSeverity (minor becomes suggestion)
    const mapSeverity = (
        severity: 'critical' | 'warning' | 'minor'
    ): 'critical' | 'warning' | 'suggestion' => {
        if (severity === 'minor') return 'suggestion'
        return severity
    }

    // Convert pre-analyzed banned phrases to issues and merge with AI-detected issues
    const bannedPhraseIssues: ReviewIssue[] = bannedPhrasesFound
        .slice(0, 10)
        .map((found) => ({
            severity: mapSeverity(found.phrase.severity),
            location: `Position ${found.positions[0]}`,
            description: `Found "${found.phrase.phrase}" - ${found.phrase.description}`,
            suggestedFix: found.phrase.replacement
                ? `Replace with "${found.phrase.replacement}"`
                : 'Rewrite to avoid this phrase',
            originalText: found.phrase.phrase,
        }))

    // Combine issues, prioritizing AI-detected ones
    const allIssues = [
        ...(result.object.issues as ReviewIssue[]),
        ...bannedPhraseIssues,
    ]

    // Deduplicate by similar descriptions
    const uniqueIssues = allIssues.reduce((acc, issue) => {
        const isDuplicate = acc.some(
            (existing) =>
                existing.originalText === issue.originalText ||
                existing.description.includes(issue.originalText || '')
        )
        if (!isDuplicate) {
            acc.push(issue)
        }
        return acc
    }, [] as ReviewIssue[])

    return {
        agentName: 'ai-slop-detector',
        score: result.object.score,
        issues: uniqueIssues,
        summary: result.object.summary,
        processingTimeMs,
        modelId,
    }
}
