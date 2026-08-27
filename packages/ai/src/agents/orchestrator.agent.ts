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
import { generateText, isStepCount } from 'ai'

import { getModel } from '../models/model-resolver.util'
import { validateGeneratedMdx } from '../functions/validate-generated-mdx.function'
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
- Restructuring Is Allowed, Inventing Is Not: Reorganising facts that are already in the draft is editing, not new information. Building a comparison table out of prices and recovery times already stated in the prose is permitted and expected. Moving an answer to the front of its section is permitted. Rewriting a heading as a question is permitted. Adding a section on who is not a candidate, assembled from candidacy facts already stated, is permitted. What remains forbidden is a number, price, statistic, claim, source or link that does not already appear in the draft or in a reviewer's suggestedFix. If a structural fix would require a fact you do not have, do not invent it — make the smaller change the available facts support.
- Focused Editing: Your edits should only address clarity, SEO optimization, structure, and the specific issues identified by the reviewers.
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
- No New Facts: Do not add any statistic, price, timeframe, claim or example that is not in the original content or provided by a reviewer. Reformatting facts that ARE present — into a table, a reordered section, a question heading — is not adding information and is encouraged.
- No New Links: Do not add any links that are not contained in the original post or specified by the Fact Reviewer and Link Validation.
- Preserve Core Message: Do not alter the fundamental message of the content.
- Essential Content: Do not remove essential content unless it has been explicitly flagged as problematic.
- Word Count: Maintain the target word count range within ±10%, **excluding structural additions requested by the geo-retrievability reviewer**. A comparison table, a relocated answer sentence, or a "who is not a candidate" section may take the post above the range — that is expected and is not a reason to cut prose elsewhere. Never delete useful content to make room for structure.
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

6. Answer-First Structure (geo-retrievability-reviewer):
   - Apply these fixes using ONLY facts already present in the draft — this is the reviewer whose fixes are structural, and the restructuring allowance in core_principles exists for it
   - Move the answer to the front: where a section's first sentence stalls, replace it with the direct answer drawn from later in that same section
   - Rewrite headings into the question a reader would type, when the reviewer supplies the wording
   - Build the comparison table the reviewer specifies from figures already in the prose. If the draft lacks a figure the table needs, build the table with the columns you can fill honestly rather than inventing the missing cell, or leave the table out and say nothing false
   - Add the CTA marker where the reviewer indicates, using one of the ids it names. Exactly one marker in the whole post
   - Remove a table the reviewer flagged as decorative; a glossary table costs the reader attention and returns nothing
   - Do not pad citations here — this reviewer does not ask for more sources, and the fact-verifier owns that ground

7. Cannibalization (cannibalization-checker):
   - Every query cluster has exactly ONE owning page site-wide; the draft must not compete with an owned cluster
   - Re-angle any section flagged as competing with another page's cluster so it covers the topic from this post's unique angle
   - Where the draft needs to reference an owned topic (e.g. cost, a procedure overview), LINK to the owning URL named in the issue instead of covering it in depth
   - Remove or replace flagged keywords from headings; never add content that targets a query owned by another page

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
- Horizontal rules (a --- line on its own) between sections — this does NOT apply to the | --- | separator row inside a markdown table, which is required and must be preserved
- HTML comments other than the single <!-- CTA:id --> marker — MDX cannot compile them and the page will fail to render
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
- [ ] Every question heading is answered by its own first sentence
- [ ] Any table requested by the structure reviewer is built only from figures already in the draft
- [ ] Exactly one <!-- CTA:id --> marker is present, using a valid id
- [ ] No fact, number, price or source appears that was not in the draft or a reviewer's fix
- [ ] The word count is within the target range (±10%), excluding structural additions
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
        'cannibalization-checker': 1, // Structural SEO - one owner per cluster
        'geo-retrievability-reviewer': 2, // Answer-first structure
        'ai-slop-detector': 3, // Brand voice
        'writing-quality-reviewer': 4,
        'internal-links-reviewer': 5,
        'external-links-reviewer': 6,
    }

    return allIssues.sort((a, b) => {
        const severityDiff =
            severityOrder[a.severity] - severityOrder[b.severity]
        if (severityDiff !== 0) return severityDiff
        // Within same severity, prioritize by agent importance
        return (
            (agentPriority[a.agentName] ?? 6) -
            (agentPriority[b.agentName] ?? 6)
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
    const cannibalizationIssues = groupedIssues['cannibalization-checker'] ?? []
    const geoIssues = groupedIssues['geo-retrievability-reviewer'] ?? []

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
    const cannibalizationReview = getReviewData('cannibalization-checker')
    const geoReview = getReviewData('geo-retrievability-reviewer')

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

### Answer-First Structure (Score: ${geoReview.score}/100)
Summary: ${geoReview.summary}

These fixes are structural. Apply them by reorganising facts already in the draft — never by inventing one. Structural additions are exempt from the word count range.

Issues:
${formatIssuesForAgent(geoIssues)}

### Cannibalization Check (Score: ${cannibalizationReview.score}/100)
Summary: ${cannibalizationReview.summary}

Issues:
${formatIssuesForAgent(cannibalizationIssues)}

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
- Horizontal rules (a --- line on its own) between sections — this does NOT apply to the | --- | separator row inside a markdown table, which is required and must be preserved
- HTML comments other than the single <!-- CTA:id --> marker — MDX cannot compile them and the page will fail to render
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
        instructions: systemPrompt,
        prompt: userPrompt,
        maxOutputTokens: 16000,
        telemetry: telemetryConfig,
        tools: {
            think: createThinkTool(),
        },
        stopWhen: isStepCount(5),
        onStepEnd({ text, toolCalls, toolResults, finishReason, usage }) {
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

    // The orchestrator rewrites the whole body, so it can reintroduce a hazard
    // the generation phase already cleared. Validate its output too.
    const validation = validateGeneratedMdx(result.text)
    const processingTimeMs = Date.now() - startTime

    if (!validation.clean) {
        console.warn(
            `[Orchestrator] Sanitised ${validation.actions.length} MDX hazard(s) from the revision:`
        )
        for (const action of validation.actions) {
            console.warn(`[Orchestrator]   ${action.detail}`)
        }
    }

    console.log(
        `[Orchestrator] Revision complete in ${processingTimeMs}ms (${result.usage?.totalTokens ?? 0} tokens)`
    )

    return {
        revisedContent: validation.content,
        agentReviews: reviews,
        processingTimeMs,
        sanitizationActions: validation.actions,
    }
}
