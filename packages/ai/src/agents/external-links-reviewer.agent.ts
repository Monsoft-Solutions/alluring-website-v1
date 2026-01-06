/**
 * External Links Reviewer Agent
 *
 * Reviews blog post content for external linking quality.
 * Ensures external links are from trusted sources and not competitors.
 *
 * @module @workspace/ai/agents/external-links-reviewer
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'
import {
    isUrlFromTrustedSource,
    isUrlBlocked,
    getUrlCredibility,
    ALL_TRUSTED_SOURCES,
} from '../config/trusted-sources.config'
import type {
    AgentReview,
    ReviewAgentOptions,
    ReviewIssue,
} from './types.agent'

/**
 * Default model for external links review
 */
const DEFAULT_MODEL_ID = 'gpt-4.1'

/**
 * Schema for external links review
 */
const externalLinksReviewSchema = z.object({
    score: z
        .number()
        .describe(
            'Score for external linking quality. Score is between 0 and 100.'
        ),
    externalLinkCount: z
        .number()
        .describe('Number of external links currently in the content'),
    trustedLinkCount: z
        .number()
        .describe('Number of those links that come from trusted sources'),
    issues: z.array(
        z.object({
            severity: z.enum(['critical', 'warning', 'suggestion']),
            location: z
                .string()
                .describe(
                    'Where in the content this issue appears (e.g., "Paragraph 2", "Link to example.com")'
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
                    'The problematic URL or anchor text. Omit this field entirely if not applicable.'
                ),
        })
    ),
    suggestedSources: z
        .array(
            z.object({
                sourceName: z
                    .string()
                    .describe(
                        'Name of the trusted source organization (e.g., "American Society of Plastic Surgeons")'
                    ),
                domain: z
                    .string()
                    .describe(
                        'The domain of the source (e.g., "plasticsurgery.org")'
                    ),
                reason: z
                    .string()
                    .describe(
                        'Why this source would add credibility to the content'
                    ),
                suggestedSearchTerm: z
                    .string()
                    .describe(
                        'What to search for on this source to find relevant content (e.g., "breast augmentation recovery")'
                    ),
            })
        )
        .describe(
            'Trusted sources that could be cited. Only suggest sources from the provided trusted sources list.'
        ),
    summary: z
        .string()
        .describe(
            'Summary of the external links review. Maximum 500 characters.'
        ),
})

/**
 * System prompt for external links reviewer
 */
const EXTERNAL_LINKS_REVIEW_SYSTEM_PROMPT = `You are an SEO and credibility expert for a plastic surgery clinic blog.

Your role is to analyze external links in blog posts and ensure they:
1. Come from trusted, authoritative medical sources
2. Do NOT link to competitor plastic surgery clinics
3. Add value and credibility to the content
4. Have natural, descriptive anchor text

External Link Guidelines:
1. Blog posts should have 1-3 external links to authoritative sources
2. Preferred sources: Medical organizations (ASPS), hospitals (Mayo Clinic), research (PubMed)
3. Consumer health sites (Healthline, WebMD) are acceptable for general information
4. NEVER link to competitor clinics or review sites with competitor ads

Scoring Criteria:
- 90-100: Excellent - 2+ links from Tier 1-2 trusted sources
- 75-89: Good - 1-2 links from trusted sources
- 60-74: Fair - Links from Tier 3 sources or missing external links
- 40-59: Poor - Links from unknown sources
- 0-39: Very Poor - Links to competitors or blocked sites

Issue Severity:
- critical: Links to competitors, blocked domains, or suspicious sites
- warning: Links from unknown/unverified sources
- suggestion: Could add more authoritative citations

Source Tiers:
- Tier 1 (Highest): ASPS, FDA, NIH, PubMed
- Tier 2 (High): Mayo Clinic, Cleveland Clinic, Johns Hopkins
- Tier 3 (Good): Healthline, WebMD, Verywell Health

**Output Requirements:**
You MUST provide valid JSON matching the expected schema. Follow these rules:
1. All required fields MUST have values - never output undefined or null for required fields
2. For "suggestedSources", only include sources where you can provide ALL required fields (sourceName, domain, reason, suggestedSearchTerm)
3. Only suggest sources from the provided trusted sources list - do not invent source names or domains
4. For "issues", the "originalText" field is OPTIONAL - omit it entirely (do not include the key) if not applicable
5. If no issues are found, the issues array can be empty []
6. If no source suggestions are relevant, the suggestedSources array can be empty []

Example suggestedSources array:
[
  {"sourceName": "American Society of Plastic Surgeons", "domain": "plasticsurgery.org", "reason": "Authoritative source for procedure safety statistics", "suggestedSearchTerm": "tummy tuck safety"},
  {"sourceName": "Mayo Clinic", "domain": "mayoclinic.org", "reason": "Trusted medical information for recovery expectations", "suggestedSearchTerm": "liposuction recovery"}
]

Example issues array:
[
  {"severity": "critical", "location": "Paragraph 4", "description": "Link points to a competitor clinic", "suggestedFix": "Remove or replace with a link to a trusted medical source", "originalText": "https://competitor-clinic.com"},
  {"severity": "suggestion", "location": "Throughout content", "description": "No external citations to support medical claims", "suggestedFix": "Add 1-2 links to authoritative medical sources"}
]`

/**
 * Extract external links from markdown content
 */
function extractExternalLinks(
    content: string
): Array<{ url: string; anchorText: string; domain: string }> {
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
    const links: Array<{ url: string; anchorText: string; domain: string }> = []
    let match

    while ((match = linkPattern.exec(content)) !== null) {
        const url = match[2]
        if (!url) continue
        // External links start with http and don't contain the site domain
        if (
            url.startsWith('http') &&
            !url.includes('alluringplasticsurgery.com')
        ) {
            try {
                const domain = new URL(url).hostname.replace('www.', '')
                links.push({
                    anchorText: match[1] || '',
                    url,
                    domain,
                })
            } catch {
                // Invalid URL, skip
            }
        }
    }

    return links
}

/**
 * Analyze an external link
 */
function analyzeExternalLink(link: {
    url: string
    anchorText: string
    domain: string
}): {
    isTrusted: boolean
    isBlocked: boolean
    credibility: string | null
} {
    return {
        isTrusted: isUrlFromTrustedSource(link.url),
        isBlocked: isUrlBlocked(link.url),
        credibility: getUrlCredibility(link.url),
    }
}

/**
 * Run the external links reviewer agent
 */
export async function runExternalLinksReviewer(
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

    // Extract existing external links
    const existingLinks = extractExternalLinks(content)

    // Analyze each link
    const analyzedLinks = existingLinks.map((link) => ({
        ...link,
        analysis: analyzeExternalLink(link),
    }))

    // Count trusted and blocked links
    const trustedCount = analyzedLinks.filter(
        (l) => l.analysis.isTrusted
    ).length
    const blockedCount = analyzedLinks.filter(
        (l) => l.analysis.isBlocked
    ).length

    // Build pre-analysis for the AI
    const linkAnalysis = analyzedLinks
        .map((l) => {
            const status = l.analysis.isBlocked
                ? '❌ BLOCKED'
                : l.analysis.isTrusted
                  ? `✅ Trusted (${l.analysis.credibility})`
                  : '⚠️ Unknown'
            return `- [${l.anchorText}](${l.url}) - ${l.domain} - ${status}`
        })
        .join('\n')

    // Build the prompt
    const prompt = `Analyze the external linking in this blog post:

**Title:** ${title}
**Primary Keyword:** ${primaryKeyword || 'Not specified'}

**Content:**
${content}

---

**External Links Found (${existingLinks.length}):**
${existingLinks.length > 0 ? linkAnalysis : 'None found'}

**Analysis Summary:**
- Total external links: ${existingLinks.length}
- From trusted sources: ${trustedCount}
- From blocked domains: ${blockedCount}
- From unknown sources: ${existingLinks.length - trustedCount - blockedCount}

---

**Trusted Source Options (for suggestions):**
${ALL_TRUSTED_SOURCES.slice(0, 10)
    .map((s) => `- ${s.name} (${s.domain}) - ${s.type}`)
    .join('\n')}

---

Analyze the external linking quality and provide your review.`

    const result = await coreGenerateObject({
        modelId,
        schema: externalLinksReviewSchema,
        system: EXTERNAL_LINKS_REVIEW_SYSTEM_PROMPT,
        prompt,
        temperature,
    })

    const processingTimeMs = Date.now() - startTime

    return {
        agentName: 'external-links-reviewer',
        score: result.object.score,
        issues: result.object.issues as ReviewIssue[],
        summary: result.object.summary,
        processingTimeMs,
        modelId,
    }
}
