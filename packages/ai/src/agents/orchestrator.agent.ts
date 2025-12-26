/**
 * Orchestrator Agent
 *
 * Consolidates feedback from all review agents and produces
 * a final revised version of the blog post content.
 *
 * @module @workspace/ai/agents/orchestrator
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'
import type {
    AgentReview,
    OrchestratorResult,
    ReviewIssue,
} from './types.agent'

/**
 * Default model for orchestration (using a more capable model for complex revisions)
 */
const DEFAULT_MODEL_ID = 'gpt-5.2'

/**
 * Schema for orchestrator output
 */
const orchestratorOutputSchema = z.object({
    revisedContent: z
        .string()
        .describe('The fully revised blog post content in markdown format'),
    changesSummary: z
        .string()
        .max(1000)
        .describe('Summary of the key changes made in 2-4 sentences'),
    changes: z.array(
        z.object({
            type: z.enum(['fix', 'improvement', 'addition', 'removal']),
            description: z
                .string()
                .describe('Clear explanation of what was changed and why'),
            before: z
                .string()
                .optional()
                .describe(
                    'The original text that was changed. Omit this field entirely for additions or structural changes.'
                ),
            after: z
                .string()
                .optional()
                .describe(
                    'The new text that replaced the original. Omit this field entirely for removals.'
                ),
        })
    ),
    overallScore: z
        .number()
        .min(0)
        .max(100)
        .describe('Overall quality score after revisions (0-100)'),
})

/**
 * Options for running the orchestrator
 */
export type OrchestratorOptions = {
    /** Original content to revise */
    originalContent: string
    /** Title of the blog post */
    title: string
    /** Primary keyword */
    primaryKeyword?: string
    /** Reviews from all agents */
    reviews: AgentReview[]
    /** Model ID to use */
    modelId?: string
    /** Temperature for generation */
    temperature?: number
}

/**
 * System prompt for the orchestrator
 */
const ORCHESTRATOR_SYSTEM_PROMPT = `You are a senior content editor for a luxury plastic surgery clinic. Your role is to take blog post content that has been reviewed by multiple specialized AI agents and produce a final, polished version.

**Your Task:**
1. Review all feedback from the specialized agents
2. Prioritize fixes based on severity (critical > warning > suggestion)
3. Resolve any conflicts between agent recommendations
4. Apply fixes while maintaining the author's voice and intent
5. Ensure the final content flows naturally

**Revision Guidelines:**

**Critical Issues (MUST FIX):**
- Factual errors or misleading medical claims
- Links to blocked/competitor domains
- Classic AI phrases like "delve", "tapestry", "seamlessly"
- Missing required elements (TL;DR, proper structure)

**Warning Issues (SHOULD FIX):**
- Corporate jargon and buzzwords
- Poor anchor text on links
- Brand voice violations
- Missing internal/external links

**Suggestions (NICE TO HAVE):**
- Minor readability improvements
- Additional link opportunities
- Small stylistic tweaks

**Conflict Resolution:**
- When agents disagree, prioritize: Medical accuracy > Brand voice > SEO > Stylistic preferences
- When multiple fixes target the same text, combine them intelligently
- Don't over-edit - some personality quirks are okay

**Quality Standards:**
- Maintain the original word count within ±10%
- Keep all factually correct information
- Preserve the overall structure and heading hierarchy
- Ensure smooth transitions between sections
- Final content should read naturally, not like it was "corrected"

**Output Requirements:**
You MUST provide valid JSON matching the expected schema. Follow these rules:
1. All required fields MUST have values - never output undefined or null for required fields
2. "revisedContent" must contain the COMPLETE revised blog post in markdown format
3. "changesSummary" should be 2-4 sentences summarizing the key changes
4. For the "changes" array, only include changes where you can provide the required fields (type, description)
5. The "before" and "after" fields are OPTIONAL:
   - For "fix" or "improvement": include both "before" and "after" showing the change
   - For "addition": include only "after" (omit "before" entirely)
   - For "removal": include only "before" (omit "after" entirely)
6. If no changes were needed, the changes array can be empty []

Example changes array:
[
  {"type": "fix", "description": "Replaced AI phrase with natural language", "before": "delve into the intricacies", "after": "explore the details"},
  {"type": "improvement", "description": "Shortened long sentence for readability", "before": "The procedure, which involves...", "after": "This procedure involves..."},
  {"type": "addition", "description": "Added internal link to BBL procedure page", "after": "[BBL procedure](/procedures/bbl)"},
  {"type": "removal", "description": "Removed redundant disclaimer paragraph", "before": "It's important to note that..."}
]`

/**
 * Prioritize issues by severity and category
 */
function prioritizeIssues(reviews: AgentReview[]): ReviewIssue[] {
    const allIssues: Array<ReviewIssue & { agentName: string }> = []

    for (const review of reviews) {
        for (const issue of review.issues) {
            allIssues.push({ ...issue, agentName: review.agentName })
        }
    }

    // Sort by severity
    const severityOrder = { critical: 0, warning: 1, suggestion: 2 }
    return allIssues.sort(
        (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    )
}

/**
 * Calculate weighted average score from reviews
 */
function calculateWeightedScore(reviews: AgentReview[]): number {
    const weights: Record<string, number> = {
        'writing-quality-reviewer': 0.35,
        'ai-slop-detector': 0.3,
        'internal-links-reviewer': 0.2,
        'external-links-reviewer': 0.15,
    }

    let totalWeight = 0
    let weightedSum = 0

    for (const review of reviews) {
        const weight = weights[review.agentName] || 0.25
        weightedSum += review.score * weight
        totalWeight += weight
    }

    return Math.round(weightedSum / totalWeight)
}

/**
 * Run the orchestrator agent
 */
export async function runOrchestrator(
    options: OrchestratorOptions
): Promise<OrchestratorResult> {
    const startTime = Date.now()
    const {
        originalContent,
        title,
        primaryKeyword,
        reviews,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.4,
    } = options

    // Calculate initial weighted score
    const initialScore = calculateWeightedScore(reviews)

    // Prioritize issues
    const prioritizedIssues = prioritizeIssues(reviews)
    const criticalCount = prioritizedIssues.filter(
        (i) => i.severity === 'critical'
    ).length
    const warningCount = prioritizedIssues.filter(
        (i) => i.severity === 'warning'
    ).length
    const suggestionCount = prioritizedIssues.filter(
        (i) => i.severity === 'suggestion'
    ).length

    // Build review summaries
    const reviewSummaries = reviews
        .map((r) => `**${r.agentName}** (Score: ${r.score}/100)\n${r.summary}`)
        .join('\n\n')

    // Build issues list (top 30 most important)
    const issuesList = prioritizedIssues
        .slice(0, 30)
        .map((issue, i) => {
            const fixText = issue.suggestedFix
            const originalText = issue.originalText
                ? `\n   Original: "${issue.originalText}"`
                : ''
            return `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.description}${originalText}\n   Fix: ${fixText}`
        })
        .join('\n\n')

    // Build the prompt
    const prompt = `Revise this blog post based on feedback from multiple review agents:

**Title:** ${title}
**Primary Keyword:** ${primaryKeyword || 'Not specified'}
**Initial Score:** ${initialScore}/100

---

**ORIGINAL CONTENT:**
${originalContent}

---

**REVIEW SUMMARIES:**
${reviewSummaries}

---

**ISSUE COUNTS:**
- Critical: ${criticalCount}
- Warnings: ${warningCount}
- Suggestions: ${suggestionCount}

---

**PRIORITIZED ISSUES (Top ${Math.min(30, prioritizedIssues.length)}):**
${issuesList}

---

**INSTRUCTIONS:**
1. Fix ALL critical issues
2. Fix as many warning issues as possible without over-editing
3. Consider suggestions but don't force them
4. Maintain the original voice and intent
5. Keep the content natural and readable

Produce the final revised version with a complete list of changes made.`

    const result = await coreGenerateObject({
        modelId,
        schema: orchestratorOutputSchema,
        system: ORCHESTRATOR_SYSTEM_PROMPT,
        prompt,
        temperature,
    })

    const processingTimeMs = Date.now() - startTime

    return {
        revisedContent: result.object.revisedContent,
        changesSummary: result.object.changesSummary,
        changes: result.object.changes,
        overallScore: result.object.overallScore,
        agentReviews: reviews,
        processingTimeMs,
    }
}
