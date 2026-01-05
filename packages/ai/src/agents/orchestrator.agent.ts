/**
 * Orchestrator Agent
 *
 * Consolidates feedback from all review agents and produces
 * a final revised version of the blog post content.
 *
 * Uses structured thinking prompts for systematic reasoning through complex revisions.
 *
 * @module @workspace/ai/agents/orchestrator
 */
import { generateObject } from 'ai'
import { z } from 'zod'

import { getModel } from '../models/model-resolver.util'
import { telemetryConfig } from '../telemetry'
import type {
    AgentReview,
    OrchestratorResult,
    ReviewIssue,
} from './types.agent'

/**
 * Default model for orchestration (using a more capable model for complex revisions)
 */
const DEFAULT_MODEL_ID = 'claude-opus-4-5'

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

## Structured Thinking Process

Before making any changes, work through this checklist:

**1. Issue Prioritization**
   - List all critical issues (medical accuracy, uncited stats, AI slop phrases)
   - Identify conflicts between agents' recommendations
   - Note external link count vs. 6-link limit

**2. Conflict Resolution Matrix**
   | Conflict | Resolution |
   |----------|------------|
   | Fact-verifier wants citation + link limit reached | Consolidate or remove lowest-tier source |
   | AI-slop detector vs writing quality disagree | Prioritize removing AI phrases over stylistic preferences |
   | Multiple fixes target same text | Combine into single coherent edit |

**3. Change Planning**
   - Group related fixes to avoid redundant edits
   - Order: structure fixes → content fixes → citations → polish
   - Keep word count within ±10% of original

**4. Quality Check**
   - Will revised content sound natural?
   - Are all critical issues addressed?
   - Are links under the 6-limit?
   - Does content maintain the original voice and intent?

**Revision Guidelines:**

**Critical Issues (MUST FIX):**
- Factual errors or misleading medical claims
- Uncited statistics or medical facts (add citations from fact-source-verifier)
- Links to blocked/competitor domains
- Classic AI phrases like "delve", "tapestry", "seamlessly"
- More than 6 external links (consolidate to max 6)

**Warning Issues (SHOULD FIX):**
- Corporate jargon and buzzwords
- Poor anchor text on links (must be descriptive)
- Brand voice violations
- Missing internal/external links
- Vague source attributions without links

**Suggestions (NICE TO HAVE):**
- Minor readability improvements
- Additional link opportunities
- Small stylistic tweaks

**External Link Rules (STRICT):**
- Maximum 6 external source links per post
- If content has more than 6 external links, consolidate or remove the least authoritative ones
- Prioritize Tier 1 sources (ASPS, FDA, NIH, CDC, PubMed) over Tier 2/3
- Each external link MUST have descriptive anchor text (not "click here", "source", or bare URLs)
- When multiple claims reference the same source, use a single link with varied anchor text

**Anchor Text Requirements:**
- Internal links: Use natural phrases that describe the destination page
- External links: Include source name or describe what the reader will learn
  - Good: "according to the American Society of Plastic Surgeons", "Mayo Clinic's recovery guidelines", "FDA safety recommendations"
  - Bad: "source", "here", "this study", "link", "click here"

**Fact Verification Issues (from fact-source-verifier):**
- Add citations using the exact suggestedFix provided (includes the URL)
- For uncited statistics, either add the source OR soften the claim ("typically" instead of exact numbers)
- Prefer Tier 1 sources: ASPS, FDA, NIH, CDC, PubMed
- Tier 2 sources acceptable: Mayo Clinic, Cleveland Clinic, Johns Hopkins

**Content Structure Guidelines:**
- Maintain the content type structure (tutorial, guide, comparison, faq, case-study)
- Keep FAQ sections intact - only fix issues within them
- Preserve "Quick Summary" or "Key Takeaways" sections at the top
- Don't add generic headings like "Introduction" or "Conclusion"
- Use topic-specific, descriptive headings

**Conflict Resolution:**
- When agents disagree, prioritize: Medical accuracy (fact-verifier) > Brand voice (ai-slop) > Link quality > SEO > Stylistic preferences
- Fact verification issues take precedence over style suggestions
- When adding citations causes the 6-link limit to be exceeded, consolidate existing links
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
  {"type": "fix", "description": "Added citation from ASPS for procedure statistic", "before": "Over 300,000 procedures are performed annually", "after": "Over 300,000 procedures are performed annually, [according to ASPS](https://www.plasticsurgery.org/...)"},
  {"type": "improvement", "description": "Improved anchor text to be descriptive", "before": "[source](https://...)", "after": "[Mayo Clinic's recovery guidelines](https://...)"},
  {"type": "addition", "description": "Added internal link to BBL procedure page", "after": "[BBL procedure](/procedures/bbl)"},
  {"type": "removal", "description": "Removed redundant external link to stay under 6-link limit", "before": "[WebMD article](https://...)"}
]`

/**
 * Issue with agent context
 */
type IssueWithAgent = ReviewIssue & { agentName: string }

/**
 * Prioritize issues by severity and category
 */
function prioritizeIssues(reviews: AgentReview[]): IssueWithAgent[] {
    const allIssues: IssueWithAgent[] = []

    for (const review of reviews) {
        for (const issue of review.issues) {
            allIssues.push({ ...issue, agentName: review.agentName })
        }
    }

    // Sort by severity, then by agent priority
    const severityOrder = { critical: 0, warning: 1, suggestion: 2 }
    const agentPriority: Record<string, number> = {
        'fact-source-verifier': 0, // Highest priority - medical accuracy
        'ai-slop-detector': 1, // Brand voice
        'writing-quality-reviewer': 2,
        'internal-links-reviewer': 3,
        'external-links-reviewer': 4,
    }

    return allIssues.sort((a, b) => {
        const severityDiff =
            severityOrder[a.severity] - severityOrder[b.severity]
        if (severityDiff !== 0) return severityDiff
        // Within same severity, prioritize by agent importance
        return (
            (agentPriority[a.agentName] ?? 5) -
            (agentPriority[b.agentName] ?? 5)
        )
    })
}

/**
 * Group issues by agent for better context in the prompt
 */
function groupIssuesByAgent(
    issues: IssueWithAgent[]
): Record<string, IssueWithAgent[]> {
    const grouped: Record<string, IssueWithAgent[]> = {}

    for (const issue of issues) {
        const agentName = issue.agentName
        const agentIssues = grouped[agentName] ?? []
        agentIssues.push(issue)
        grouped[agentName] = agentIssues
    }

    return grouped
}

/**
 * Count external links in content
 */
function countExternalLinks(content: string): number {
    const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
    let count = 0
    let match
    while ((match = linkPattern.exec(content)) !== null) {
        // Exclude internal links
        if (!match[2]?.includes('alluringplasticsurgery.com')) {
            count++
        }
    }
    return count
}

/**
 * Calculate weighted average score from reviews
 */
function calculateWeightedScore(reviews: AgentReview[]): number {
    const weights: Record<string, number> = {
        'writing-quality-reviewer': 0.25,
        'ai-slop-detector': 0.25,
        'fact-source-verifier': 0.25, // High priority for medical content E-E-A-T
        'internal-links-reviewer': 0.15,
        'external-links-reviewer': 0.1,
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
 * Run the orchestrator agent with think tool for structured reasoning
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

    // Group issues by agent for better context
    const groupedIssues = groupIssuesByAgent(prioritizedIssues)

    // Build issues list grouped by agent
    const agentDisplayNames: Record<string, string> = {
        'fact-source-verifier': 'Fact & Source Verification',
        'ai-slop-detector': 'AI Language Detection',
        'writing-quality-reviewer': 'Writing Quality',
        'internal-links-reviewer': 'Internal Links',
        'external-links-reviewer': 'External Links',
    }

    const agentOrder = [
        'fact-source-verifier',
        'ai-slop-detector',
        'writing-quality-reviewer',
        'internal-links-reviewer',
        'external-links-reviewer',
    ]

    let issueNumber = 0
    const issuesByAgentList = agentOrder
        .filter((agentName) => (groupedIssues[agentName]?.length ?? 0) > 0)
        .map((agentName) => {
            const issues = groupedIssues[agentName] ?? []
            const displayName = agentDisplayNames[agentName] ?? agentName
            const issuesText = issues
                .slice(0, 10) // Max 10 issues per agent
                .map((issue) => {
                    issueNumber++
                    const originalText = issue.originalText
                        ? `\n   Original: "${issue.originalText}"`
                        : ''
                    return `${issueNumber}. [${issue.severity.toUpperCase()}] ${issue.description}${originalText}\n   Fix: ${issue.suggestedFix}`
                })
                .join('\n\n')

            return `### ${displayName} Issues (${issues.length} total)\n\n${issuesText}`
        })
        .join('\n\n---\n\n')

    // Count current external links
    const currentExternalLinks = countExternalLinks(originalContent)
    const externalLinkWarning =
        currentExternalLinks > 6
            ? `\n⚠️ ALERT: Content has ${currentExternalLinks} external links. MUST consolidate to max 6.`
            : currentExternalLinks > 4
              ? `\nNote: Content has ${currentExternalLinks} external links. Be mindful when adding citations to stay under 6.`
              : ''

    // Build the prompt
    const prompt = `Revise this blog post based on feedback from multiple review agents:

**Title:** ${title}
**Primary Keyword:** ${primaryKeyword || 'Not specified'}
**Initial Score:** ${initialScore}/100
**Current External Links:** ${currentExternalLinks}/6 max${externalLinkWarning}

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

**ISSUES BY CATEGORY:**

${issuesByAgentList}

---

**INSTRUCTIONS:**
1. Work through the Structured Thinking Process checklist before making changes
2. Fix ALL critical issues
3. Fix as many warning issues as possible without over-editing
4. Consider suggestions but don't force them
5. Maintain the original voice and intent
6. Keep the content natural and readable
7. IMPORTANT: Keep external links to 6 or fewer - consolidate if needed
8. Ensure all link anchor text is descriptive (not "click here", "source", etc.)

Produce the final revised version with a complete list of changes made.`

    console.log('[Orchestrator] Starting revision with structured thinking')

    const result = await generateObject({
        model: getModel(modelId),
        schema: orchestratorOutputSchema,
        system: ORCHESTRATOR_SYSTEM_PROMPT,
        prompt,
        temperature,
        experimental_telemetry: telemetryConfig,
    })

    const processingTimeMs = Date.now() - startTime

    console.log(
        `[Orchestrator] Revision complete in ${processingTimeMs}ms (${result.usage?.totalTokens ?? 0} tokens)`
    )

    return {
        revisedContent: result.object.revisedContent,
        changesSummary: result.object.changesSummary,
        changes: result.object.changes,
        overallScore: result.object.overallScore,
        agentReviews: reviews,
        processingTimeMs,
    }
}
