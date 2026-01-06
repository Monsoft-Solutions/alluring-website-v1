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
import { generateText } from 'ai'

import { getModel } from '../models/model-resolver.util'
import { telemetryConfig } from '../telemetry'
import type {
    AgentReview,
    OrchestratorResult,
    ReviewIssue,
} from './types.agent'
import { createThinkTool } from '../tools'

/**
 * Default model for orchestration (using a more capable model for complex revisions)
 */
const DEFAULT_MODEL_ID = 'claude-opus-4-5'

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

## Think Tool Workflow

**IMPORTANT: Use the \`think\` tool ONCE at the start to plan ALL changes before writing.**

### Step 1: Strategic Planning (Think Tool - REQUIRED)
Use the \`think\` tool at the very beginning to work through this comprehensive checklist:

**A. Issue Analysis**
   - List ALL critical issues by category (medical accuracy, AI slop, links, structure)
   - List ALL warning issues that should be addressed
   - Note which suggestions are worth incorporating
   - Count current external links vs. 6-link limit

**B. Conflict Detection & Resolution**
   | Conflict | Resolution |
   |----------|------------|
   | Fact-verifier wants citation + link limit reached | Consolidate or remove lowest-tier source |
   | AI-slop detector vs writing quality disagree | Prioritize removing AI phrases over stylistic preferences |
   | Multiple fixes target same text | Combine into single coherent edit |

**C. Change Execution Plan**
   Create a numbered list of ALL changes you will make, in this order:
   1. External link consolidation (if over 6 links)
   2. Critical fixes: medical accuracy, factual errors
   3. Critical fixes: AI slop phrases removal
   4. Warning fixes: citations, anchor text improvements
   5. Warning fixes: internal/external link additions
   6. Suggestions: minor improvements (only if natural)

**D. Pre-flight Check**
   - Verify total external links will be ≤6 after changes
   - Confirm all critical issues have a planned fix
   - Estimate if word count stays within ±10%

**E. SEO & Engagement Check**
   - Is the primary keyword in the first paragraph?
   - Does at least one H2 contain the primary keyword naturally?
   - Is there a compelling hook in the opening sentences?
   - Does the content fully answer the search intent?
   - Are there opportunities for featured snippets (lists, tables, Q&A format)?
   - Is there a clear, compelling CTA at the end?
   - Does the content show real expertise (specific examples, concrete details)?

### Step 2: Execute Changes (No Additional Thinking)
After planning, apply ALL changes systematically without additional think steps.
Write the complete revised content in one pass, following your execution plan.

### Step 3: Produce Output
Write the complete revised blog post in markdown format. Output ONLY the publication-ready content - no JSON, no explanations, no wrapper.

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

**SEO Optimization (CRITICAL for Rankings):**
- Primary keyword MUST appear in first paragraph and at least one H2 heading
- Natural keyword density (1-2% of content, never forced or awkward)
- Heading hierarchy: H2 for main sections, H3 for subsections - no skipping levels
- Format content for featured snippet potential: use lists, tables, and clear Q&A
- Clear, specific headings that match what people actually search for
- Strong meta-friendly intro paragraph that summarizes the page's value
- Include semantic variations of the primary keyword naturally throughout

**E-E-A-T for Medical Content (Google Quality Signals):**
- Experience: Include real-world examples ("In our practice, we typically see...", "Patients often tell us...")
- Expertise: Reference surgeon credentials and specialized training naturally where relevant
- Authoritativeness: Cite Tier 1 medical sources (ASPS, FDA, NIH) - covered by fact-verifier
- Trustworthiness: Include appropriate disclaimers, avoid overpromising results
- Be specific: Replace vague claims ("many patients") with concrete details ("most patients see results within 2-4 weeks")
- Show depth: Demonstrate comprehensive understanding of the topic beyond surface-level information

**Content Value & Reader Engagement:**
- Hook readers in first 2 sentences with a compelling reason to keep reading
- Answer the searcher's primary question early (within first 2-3 paragraphs)
- Provide actionable takeaways the reader can use immediately
- Anticipate and answer follow-up questions readers will have
- End with a clear, compelling call-to-action (schedule consultation, learn more)
- Ensure content is comprehensive enough to be the ONLY article readers need on this topic
- Address reader concerns and aspirations emotionally, not just informationally

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
- When agents disagree, prioritize in this order:
  1. Medical accuracy (fact-verifier) - Patient safety is paramount
  2. SEO optimization (keyword placement, heading structure) - Must rank to reach patients
  3. Content value (comprehensive answers, reader engagement) - Must deliver real value
  4. Brand voice (ai-slop removal) - Must sound human and trustworthy
  5. Link quality (anchor text, internal links) - Supports SEO and user experience
  6. Stylistic preferences - Nice to have but not critical
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

**World-Class Content Standards (Aim for #1 on Google):**
- Content must be the BEST answer for the target search query - better than any competitor
- Every section should add unique value (no filler paragraphs, no fluff)
- Include specific numbers, timelines, and actionable details readers can use
- Format for scannability: short paragraphs (3-4 sentences max), bullets, clear headings
- Mobile-friendly: no walls of text, break up long sections
- Engage emotionally: address reader concerns, fears, and aspirations directly
- Demonstrate expertise: use specific examples, reference real procedures and outcomes
- Be comprehensive: cover all aspects a reader would need to make an informed decision

**Output Requirements:**
Your output should be ONLY the complete revised blog post in markdown format.
- Start directly with the content (no preamble, no explanation)
- Include all headings, paragraphs, links, and formatting
- The output should be publication-ready
- Do not include any JSON, metadata, or change summaries
- Do not wrap the content in code blocks
- Don't use --- lines to separate sections`

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

Follow this exact workflow:

1. **THINK (once):** Use the \`think\` tool to work through the complete planning checklist:
   - Analyze ALL issues (critical, warning, suggestion)
   - Identify conflicts between agent recommendations
   - Count external links and plan consolidation if needed
   - Create a numbered execution plan for all changes

2. **EXECUTE:** After planning, write the complete revised content in ONE pass:
   - Apply all planned changes systematically
   - Fix ALL critical issues
   - Address warnings without over-editing
   - Maintain original voice and ±10% word count
   - Keep external links ≤6
   - Ensure descriptive anchor text on all links

3. **OUTPUT:** Write the complete revised blog post in markdown format. No JSON, no explanations - just the publication-ready content.

Begin by using the think tool to plan your revision strategy.`

    console.log('[Orchestrator] Starting revision with structured thinking')

    const result = await generateText({
        model: getModel(modelId),
        system: ORCHESTRATOR_SYSTEM_PROMPT,
        prompt,
        temperature,
        experimental_telemetry: telemetryConfig,
        tools: {
            think: createThinkTool(),
        },
    })

    const processingTimeMs = Date.now() - startTime

    console.log(
        `[Orchestrator] Revision complete in ${processingTimeMs}ms (${result.usage?.totalTokens ?? 0} tokens)`
    )

    return {
        revisedContent: result.text,
        agentReviews: reviews,
        processingTimeMs,
    }
}
