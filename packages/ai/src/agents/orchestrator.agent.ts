/**
 * Orchestrator Agent
 *
 * Consolidates feedback from all review agents and produces
 * a final revised version of the blog post content.
 *
 * Uses structured prompts based on proven editing workflows for
 * systematic content refinement while preserving original intent.
 *
 * @module @workspace/ai/agents/orchestrator
 */
import { generateText, stepCountIs } from 'ai'

import { getModel, temperatureParam } from '../models/model-resolver.util'
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
const DEFAULT_MODEL_ID = 'claude-opus-5'

/**
 * Default blog domain for internal link detection
 */
const DEFAULT_BLOG_DOMAIN = 'alluringplasticsurgery.com'

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
    /** Secondary keywords */
    secondaryKeywords?: string[]
    /** Reviews from all agents */
    reviews: AgentReview[]
    /** Model ID to use */
    modelId?: string
    /** Temperature for generation */
    temperature?: number
    /** Target audience description */
    targetAudience?: string
    /** Content type (tutorial, guide, comparison, faq, case-study) */
    contentType?: string
    /** Estimated/target word count */
    estimatedWordCount?: number
    /** Blog domain for internal link detection */
    blogDomain?: string
}

/**
 * Build the structured system prompt for content editing
 */
function buildSystemPrompt(): string {
    return `<role>
You are an expert Content Editor Specialist with a specialization in SEO optimization and content refinement for a luxury plastic surgery clinic.
Your primary function is to meticulously edit existing content based on a comprehensive analysis from multiple specialized agents.
Your objective is to enhance the content's quality and search engine performance while strictly preserving the original author's message and claims.
</role>

<core_principles>
- Preserve Original Intent: You must never introduce new claims, facts, or substantive content that was not present in the original piece. If the fact-checker provides corrective feedback, you are to implement the suggested changes.
- Focused Editing: Your edits should only address clarity, SEO optimization, and the specific issues identified by the reviewers.
- Maintain Authorial Voice: The original author's tone and style must be maintained throughout the edited content.
- Balance SEO and Readability: While prioritizing SEO performance, ensure the content remains natural and easy for the target audience to read. A Flesch reading score of 60 or higher is desired, with sentences averaging under 20 words and paragraphs between 2-4 sentences.
- Address Feedback: All feedback from the Fact Checker Reviewer must be addressed.
- Optimize for Featured Snippets: Evaluate and, where appropriate, restructure headers to be question-based to increase the potential for featured snippets.
- Link Management: Do not use the same link multiple times throughout the post. A maximum of two uses with different anchor texts is permissible. Inline link anchors should be descriptive, containing 2-4 words.
</core_principles>

<editing_framework>
Issue Priority System:
- High Priority: Address all issues related to AI Pattern Detection, SEO (including keyword placement and structure), Facts & Claims, and Link Validation.
- Medium Priority: Focus on improving content flow, readability, and engagement elements.
- Low Priority: Implement minor optimizations and stylistic improvements.

Editing Constraints:
- No New Information: Do not add any new information, statistics, or examples that are not in the original content or provided by the Fact Reviewer.
- No New Links: Do not add any new links that are not contained in the original post or specified by the Fact Reviewer and Link Validation.
- Preserve Core Message: Do not alter the fundamental message of the content.
- Essential Content: Do not remove essential content unless it has been explicitly flagged as problematic.
- Word Count: Maintain the target word count range within ±10%.
</editing_framework>

<review_processing_protocol>
When analyzing reviews from specialized agents, you will follow this protocol:

1. AI Pattern Detection (ai-slop-detector):
   - Address and rectify any language patterns identified as robotic or unnatural
   - Remove classic AI phrases like "delve", "tapestry", "seamlessly", "myriad"
   - Fix corporate jargon and marketing clichés
   - Make content sound authentically human

2. Writing Quality (writing-quality-reviewer):
   - Correct issues related to structure, readability, and engagement
   - Improve transitions between sections
   - Ensure headers are descriptive and SEO-friendly
   - Maintain proper heading hierarchy (H2, H3)

3. Fact Checker (fact-source-verifier):
   - Implement ALL necessary corrections based on issues detected
   - Add citations using the exact suggestedFix provided (includes the URL)
   - For uncited statistics, either add the source OR soften the claim
   - Prefer Tier 1 sources: ASPS, FDA, NIH, CDC, PubMed
   - Tier 2 acceptable: Mayo Clinic, Cleveland Clinic, Johns Hopkins

4. Internal Links (internal-links-reviewer):
   - Add internal links ONLY where explicitly recommended
   - Use natural phrases that describe the destination page
   - Ensure anchor text is descriptive (2-4 words)

5. External Links (external-links-reviewer):
   - Update or remove only links that have been identified as broken or problematic
   - Maximum 6 external source links per post
   - Prioritize Tier 1 sources over Tier 2/3
   - Each external link MUST have descriptive anchor text (not "click here", "source", or bare URLs)

Your prioritization of these fixes should be based on their impact on the SEO score, user experience, compliance with facts and claims, and the resolution of AI-related issues.
</review_processing_protocol>

<editing_process>
1. Comprehensive Analysis: Begin by analyzing all reviewer feedback to identify any overlapping issues and to prioritize your edits.

2. Strategic Planning: Create a clear plan that maps specific edits to the identified issues using the think tool.

3. Execution of Edits (in this order):
   a. Correct any problematic Facts & Claims
   b. Fix any broken links
   c. Address all AI slop issues
   d. Enhance the readability and flow of the content
   e. Resolve any structural problems
   f. Refine language patterns to sound more natural

4. Compliance Verification: Ensure that all edits maintain the integrity of the original content.
</editing_process>

<seo_optimization_guidelines>
- Primary Keyword Density: Maintain a keyword density of 1-1.5%. The primary keyword should appear in the first 100 words, in at least two H2 headers, and in the final paragraph.
- Secondary Keywords: Integrate secondary keywords naturally, aiming for a density of 0.3-0.5% for each.
- Header Hierarchy: Utilize H2 and H3 headers with keywords where it feels natural to do so.
- Internal Linking: Only add internal links when explicitly requested by reviewers.
- Content Structure: Ensure the content is divided into clear, scannable sections. Do not include a section with additional links, such as "Related Reading."
- Featured Snippets: Format content for featured snippet potential using lists, tables, and clear Q&A format.
</seo_optimization_guidelines>

<medical_content_guidelines>
E-E-A-T for Medical Content (Google Quality Signals):
- Experience: Include real-world examples ("In our practice, we typically see...", "Patients often tell us...")
- Expertise: Reference surgeon credentials and specialized training naturally where relevant
- Authoritativeness: Cite Tier 1 medical sources (ASPS, FDA, NIH) - covered by fact-verifier
- Trustworthiness: Include appropriate disclaimers, avoid overpromising results
- Be specific: Replace vague claims ("many patients") with concrete details ("most patients see results within 2-4 weeks")
- Show depth: Demonstrate comprehensive understanding of the topic beyond surface-level information
</medical_content_guidelines>

<output_format>
Return the edited post content in Markdown format. Do not include any additional text or comments.

DO NOT include:
- Preambles ("Here is the revised content...", "I've made the following changes...")
- JSON wrappers, metadata blocks, or change summaries
- Thinking process explanations or reasoning
- Code block wrappers (triple backticks) around the entire content
- Annotations about what was changed
- Sign-offs or closing remarks ("I hope this helps...", "Let me know if...")
- Section dividers (---) between content sections
- A # header or the title within the body
- Any text that is not part of the actual blog post

DO include:
- The complete blog post
- All headings, paragraphs, lists, and properly formatted links
- Publication-ready markdown throughout
</output_format>

<validation_checklist>
Before producing output, verify:
- [ ] All high-priority issues from the reviews have been addressed
- [ ] All problematic Facts and Claims have been corrected
- [ ] AI-generated patterns have been fixed
- [ ] All broken links have been resolved
- [ ] The word count is within the target range (±10%)
- [ ] The content meets readability standards (Flesch ≥60, sentences <20 words, paragraphs 2-4 sentences)
- [ ] The primary keyword is distributed correctly (first 100 words, at least 2 H2s, final paragraph)
- [ ] The content flows in a natural and logical manner
- [ ] No new substantive content has been added
- [ ] No new claims, links, or statistics have been added unless provided by a reviewer
- [ ] The post does not contain a # header or the title within the body
- [ ] The post is properly formatted in Markdown
- [ ] External links are ≤6 total
</validation_checklist>`
}

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
function countExternalLinks(content: string, blogDomain: string): number {
    const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
    let count = 0
    let match
    while ((match = linkPattern.exec(content)) !== null) {
        // Exclude internal links
        if (!match[2]?.includes(blogDomain)) {
            count++
        }
    }
    return count
}

/**
 * Count words in content
 */
function countWords(text: string): number {
    return text.split(/\s+/).filter((w) => w.length > 0).length
}

/**
 * Format issues as JSON-like structure for the prompt
 */
function formatIssuesForAgent(
    issues: IssueWithAgent[],
    maxIssues: number = 15
): string {
    const formatted = issues.slice(0, maxIssues).map((issue) => ({
        severity: issue.severity,
        location: issue.location,
        description: issue.description,
        suggestedFix: issue.suggestedFix,
        originalText: issue.originalText,
    }))

    return JSON.stringify(formatted, null, 2)
}

/**
 * Build the user prompt with content information and reviews
 */
function buildUserPrompt(options: {
    title: string
    primaryKeyword?: string
    secondaryKeywords?: string[]
    targetAudience?: string
    contentType?: string
    estimatedWordCount?: number
    blogDomain: string
    originalContent: string
    currentWordCount: number
    currentExternalLinks: number
    reviews: AgentReview[]
    groupedIssues: Record<string, IssueWithAgent[]>
}): string {
    const {
        title,
        primaryKeyword,
        secondaryKeywords,
        targetAudience,
        contentType,
        estimatedWordCount,
        blogDomain,
        originalContent,
        currentWordCount,
        currentExternalLinks,
        reviews,
        groupedIssues,
    } = options

    // Calculate word count range
    const targetMin = estimatedWordCount
        ? Math.round(estimatedWordCount * 0.9)
        : Math.round(currentWordCount * 0.9)
    const targetMax = estimatedWordCount
        ? Math.round(estimatedWordCount * 1.1)
        : Math.round(currentWordCount * 1.1)
    const targetWordCountRange = `${targetMin}-${targetMax} words`

    // Build review sections
    const aiSlopIssues = groupedIssues['ai-slop-detector'] ?? []
    const writingQualityIssues = groupedIssues['writing-quality-reviewer'] ?? []
    const factIssues = groupedIssues['fact-source-verifier'] ?? []
    const internalLinkIssues = groupedIssues['internal-links-reviewer'] ?? []
    const externalLinkIssues = groupedIssues['external-links-reviewer'] ?? []

    // Get summaries and scores from reviews
    const getReviewData = (agentName: string) => {
        const review = reviews.find((r) => r.agentName === agentName)
        return review
            ? { score: review.score, summary: review.summary }
            : { score: 'N/A', summary: 'No review available' }
    }

    const aiSlopReview = getReviewData('ai-slop-detector')
    const writingReview = getReviewData('writing-quality-reviewer')
    const factReview = getReviewData('fact-source-verifier')
    const internalLinksReview = getReviewData('internal-links-reviewer')
    const externalLinksReview = getReviewData('external-links-reviewer')

    return `## Content Analysis Request

### Core Content Information
- Blog Domain: ${blogDomain}
- Content Type: ${contentType || 'guide'}
- Search Intent: informational
- Primary Keyword: ${primaryKeyword || 'Not specified'}
- Secondary Keywords: ${secondaryKeywords?.join(', ') || 'None specified'}
- Target Audience: ${targetAudience || 'Women 25-55 considering cosmetic procedures'}
- Target Word Count: ${targetWordCountRange}
- Current Word Count: ${currentWordCount}
- Current External Links: ${currentExternalLinks}/6 max
- Meta Title: ${title}

## Previous Reviews from Specialized Agents we need to address

### AI Pattern Detection (Score: ${aiSlopReview.score}/100)
Summary: ${aiSlopReview.summary}

Issues:
${formatIssuesForAgent(aiSlopIssues)}

### Writing Quality / SEO Analysis (Score: ${writingReview.score}/100)
Summary: ${writingReview.summary}

Issues:
${formatIssuesForAgent(writingQualityIssues)}

### Fact Checker (Score: ${factReview.score}/100)
Summary: ${factReview.summary}

Issues:
${formatIssuesForAgent(factIssues)}

### Link Validation

#### Internal Links (Score: ${internalLinksReview.score}/100)
Summary: ${internalLinksReview.summary}

Issues:
${formatIssuesForAgent(internalLinkIssues)}

#### External Links (Score: ${externalLinksReview.score}/100)
Summary: ${externalLinksReview.summary}

Issues:
${formatIssuesForAgent(externalLinkIssues)}

### Content to Edit
<content>
${originalContent}
</content>

Now, edit the content to address the issues identified by the specialized agents.

### Output Format
Return the edited post content in Markdown format. Do not include any additional text or comments.

DO NOT include:
- Preambles ("Here is the revised content...", "I've made the following changes...")
- JSON wrappers, metadata blocks, or change summaries
- Thinking process explanations or reasoning
- Code block wrappers (triple backticks) around the entire content
- Annotations about what was changed
- Sign-offs or closing remarks ("I hope this helps...", "Let me know if...")
- Section dividers (---) between content sections
- A # header or the title within the body
- Any text that is not part of the actual blog post
`
}

/**
 * Run the orchestrator agent with structured prompts for systematic content editing
 */
export async function runOrchestrator(
    options: OrchestratorOptions
): Promise<OrchestratorResult> {
    const startTime = Date.now()
    const {
        originalContent,
        title,
        primaryKeyword,
        secondaryKeywords,
        reviews,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.4,
        targetAudience,
        contentType,
        estimatedWordCount,
        blogDomain = DEFAULT_BLOG_DOMAIN,
    } = options

    // Calculate content metrics
    const currentWordCount = countWords(originalContent)
    const currentExternalLinks = countExternalLinks(originalContent, blogDomain)

    // Prioritize and group issues
    const prioritizedIssues = prioritizeIssues(reviews)
    const groupedIssues = groupIssuesByAgent(prioritizedIssues)

    // Count issues by severity for logging
    const criticalCount = prioritizedIssues.filter(
        (i) => i.severity === 'critical'
    ).length
    const warningCount = prioritizedIssues.filter(
        (i) => i.severity === 'warning'
    ).length
    const suggestionCount = prioritizedIssues.filter(
        (i) => i.severity === 'suggestion'
    ).length

    console.log('[Orchestrator] Starting content revision')
    console.log(`[Orchestrator] Content: ${currentWordCount} words`)
    console.log(`[Orchestrator] External links: ${currentExternalLinks}/6`)
    console.log(
        `[Orchestrator] Issues: ${criticalCount} critical, ${warningCount} warnings, ${suggestionCount} suggestions`
    )

    // Build prompts
    const systemPrompt = buildSystemPrompt()
    const userPrompt = buildUserPrompt({
        title,
        primaryKeyword,
        secondaryKeywords,
        targetAudience,
        contentType,
        estimatedWordCount,
        blogDomain,
        originalContent,
        currentWordCount,
        currentExternalLinks,
        reviews,
        groupedIssues,
    })

    const result = await generateText({
        model: getModel(modelId),
        system: systemPrompt,
        prompt: userPrompt,
        ...temperatureParam(modelId, temperature),
        maxOutputTokens: 16000,
        experimental_telemetry: telemetryConfig,
        tools: {
            think: createThinkTool(),
        },
        stopWhen: stepCountIs(5),
        onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
            console.log(`[Orchestrator] Step ${text}`)
            console.log(
                `[Orchestrator] Tool calls: ${toolCalls.map((c) => c.toolName).join(', ')}`
            )
            console.log(
                `[Orchestrator] Tool results: ${toolResults.map((r) => r.output).join(', ')}`
            )
            console.log(`[Orchestrator] Finish reason: ${finishReason}`)
            console.log(`[Orchestrator] Usage: ${usage.totalTokens} tokens`)
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
