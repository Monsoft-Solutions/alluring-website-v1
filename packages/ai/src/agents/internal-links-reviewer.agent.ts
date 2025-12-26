/**
 * Internal Links Reviewer Agent
 *
 * Reviews blog post content for internal linking quality.
 * Checks that internal links exist, are relevant, and use natural anchor text.
 *
 * @module @workspace/ai/agents/internal-links-reviewer
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'
import {
    getInternalLinks,
    getAllInternalPages,
} from '../tools/internal-links.tool'
import type {
    AgentReview,
    ReviewAgentOptions,
    ReviewIssue,
} from './types.agent'

/**
 * Default model for internal links review
 */
const DEFAULT_MODEL_ID = 'gpt-4.1'

/**
 * Schema for internal links review
 */
const internalLinksReviewSchema = z.object({
    score: z
        .number()
        .min(0)
        .max(100)
        .describe('Score for internal linking quality (0-100)'),
    internalLinkCount: z
        .number()
        .describe('Number of internal links currently in the content'),
    issues: z.array(
        z.object({
            severity: z.enum(['critical', 'warning', 'suggestion']),
            location: z
                .string()
                .describe(
                    'Where in the content this issue appears (e.g., "Paragraph 2", "Introduction", "Link to /procedures/bbl")'
                ),
            description: z
                .string()
                .describe('Clear explanation of what the linking issue is'),
            suggestedFix: z
                .string()
                .describe(
                    'Specific, actionable suggestion on how to fix this issue'
                ),
            originalText: z
                .string()
                .optional()
                .describe(
                    'The problematic anchor text or link. Omit this field entirely if not applicable.'
                ),
        })
    ),
    suggestedLinks: z
        .array(
            z.object({
                url: z
                    .string()
                    .describe(
                        'The internal URL path to link to (must be from the available pages list, e.g., "/procedures/bbl")'
                    ),
                title: z
                    .string()
                    .describe('The title of the page being linked to'),
                suggestedAnchorText: z
                    .string()
                    .describe(
                        'Natural anchor text to use for this link (e.g., "Brazilian Butt Lift procedure")'
                    ),
                reason: z
                    .string()
                    .describe('Why this link would add value to the content'),
            })
        )
        .describe(
            'Additional internal links that could be added. Only suggest links from the provided available pages list.'
        ),
    summary: z
        .string()
        .describe(
            'Summary of the internal links review. Maximum 500 characters.'
        ),
})

/**
 * System prompt for internal links reviewer
 */
const INTERNAL_LINKS_REVIEW_SYSTEM_PROMPT = `You are an SEO expert specializing in internal linking strategies for a plastic surgery clinic blog.

Your role is to analyze blog post content and evaluate the quality of internal linking.

Internal Link Guidelines:
1. Blog posts should have 2-4 relevant internal links
2. Links should use natural, descriptive anchor text (not "click here")
3. Links should point to relevant content (procedures, related blog posts, key pages)
4. Links should be distributed throughout the content, not clustered
5. Anchor text should include relevant keywords when natural

Scoring Criteria:
- 90-100: Excellent - 3+ relevant internal links with natural anchor text
- 75-89: Good - 2-3 internal links, mostly good anchor text
- 60-74: Fair - 1-2 internal links or some poor anchor text
- 40-59: Poor - Missing internal links or irrelevant links
- 0-39: Very Poor - No internal links or broken links

Issue Severity:
- critical: No internal links, or links to non-existent pages
- warning: Too few links, poor anchor text, or irrelevant links
- suggestion: Could add more links or improve anchor text

You will be provided with:
1. The blog post content in markdown
2. A list of available internal pages to link to
3. The post's primary keyword

Analyze the content and provide:
1. A score (0-100)
2. List of issues found
3. Suggestions for additional links that could be added

**Output Requirements:**
You MUST provide valid JSON matching the expected schema. Follow these rules:
1. All required fields MUST have values - never output undefined or null for required fields
2. For "suggestedLinks", only include links where you can provide ALL required fields (url, title, suggestedAnchorText, reason)
3. The "url" field MUST be a valid path from the available pages list - do not invent URLs
4. For "issues", the "originalText" field is OPTIONAL - omit it entirely (do not include the key) if not applicable
5. If no issues are found, the issues array can be empty []
6. If no link suggestions are relevant, the suggestedLinks array can be empty []

Example suggestedLinks array:
[
  {"url": "/procedures/bbl", "title": "Brazilian Butt Lift", "suggestedAnchorText": "BBL procedure", "reason": "Directly relevant to the topic being discussed"},
  {"url": "/blog/recovery-tips", "title": "Recovery Tips", "suggestedAnchorText": "recovery guidelines", "reason": "Provides helpful follow-up information"}
]

Example issues array:
[
  {"severity": "warning", "location": "Paragraph 3", "description": "Anchor text 'click here' is not descriptive", "suggestedFix": "Use descriptive anchor text like 'tummy tuck procedure'", "originalText": "click here"},
  {"severity": "suggestion", "location": "Conclusion", "description": "No call-to-action link to consultation page", "suggestedFix": "Add a link to the consultation booking page"}
]`

/**
 * Extract internal links from markdown content
 */
function extractInternalLinks(
    content: string
): Array<{ url: string; anchorText: string }> {
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
    const links: Array<{ url: string; anchorText: string }> = []
    let match

    while ((match = linkPattern.exec(content)) !== null) {
        const url = match[2]
        if (!url) continue
        // Internal links start with / or contain the site domain
        if (url.startsWith('/') || url.includes('alluringplasticsurgery.com')) {
            links.push({
                anchorText: match[1] || '',
                url: url.startsWith('/') ? url : new URL(url).pathname,
            })
        }
    }

    return links
}

/**
 * Run the internal links reviewer agent
 */
export async function runInternalLinksReviewer(
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

    // Get available internal pages
    const availablePages = getAllInternalPages()
    const suggestedLinks = getInternalLinks(primaryKeyword || title, {
        maxResults: 10,
    })

    // Extract existing internal links
    const existingLinks = extractInternalLinks(content)

    // Build the prompt
    const prompt = `Analyze the internal linking in this blog post:

**Title:** ${title}
**Primary Keyword:** ${primaryKeyword || 'Not specified'}

**Content:**
${content}

---

**Existing Internal Links Found (${existingLinks.length}):**
${existingLinks.length > 0 ? existingLinks.map((l) => `- [${l.anchorText}](${l.url})`).join('\n') : 'None found'}

---

**Available Internal Pages to Link To:**
${availablePages.map((p) => `- ${p.title}: ${p.url}`).join('\n')}

---

**Suggested Relevant Pages Based on Topic:**
${suggestedLinks.suggestions
    .slice(0, 5)
    .map((p) => `- ${p.title}: ${p.url}`)
    .join('\n')}

---

Analyze the internal linking quality and provide your review.`

    const result = await coreGenerateObject({
        modelId,
        schema: internalLinksReviewSchema,
        system: INTERNAL_LINKS_REVIEW_SYSTEM_PROMPT,
        prompt,
        temperature,
    })

    const processingTimeMs = Date.now() - startTime

    return {
        agentName: 'internal-links-reviewer',
        score: result.object.score,
        issues: result.object.issues as ReviewIssue[],
        summary: result.object.summary,
        processingTimeMs,
        modelId,
    }
}
