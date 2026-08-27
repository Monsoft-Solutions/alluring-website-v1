/**
 * Cannibalization Checker Agent
 *
 * Sixth reviewer on the board: verifies that a draft does not compete
 * with an existing page for the same query cluster. Belt-and-braces
 * behind the ideation gate — the gate blocks bad topics at creation,
 * this agent catches drift introduced during writing (H2 sections or
 * keyword targeting that wander into owned territory).
 *
 * Analysis is two-stage: a deterministic pass over the keyword ownership
 * registry (@workspace/shared/seo) finds candidate conflicts, then the
 * model judges whether each is true topical competition or acceptable
 * adjacent coverage. Live Search Console data (which URLs actually rank
 * for the head terms) is injected by the caller when available.
 *
 * @module @workspace/ai/agents/cannibalization-checker
 */
import { z } from 'zod'

import {
    findSimilarOwnedQueries,
    normalizeQuery,
    resolveQueryOwner,
    type SimilarOwnedQuery,
} from '@workspace/shared/seo'

import { coreGenerateObject } from '../core'
import type {
    AgentReview,
    ReviewAgentOptions,
    ReviewIssue,
} from './types.agent'

/**
 * Default model for cannibalization review
 */
const DEFAULT_MODEL_ID = 'x-ai/grok-4.6'

/** A page ranking for a query, from live Search Console data */
export type RankingPage = {
    page: string
    clicks: number
    impressions: number
    position: number
}

/**
 * Options for the cannibalization checker.
 * pagesForQuery is injected by the caller (apps/admin) so this package
 * stays free of environment-specific dependencies; without it the agent
 * runs registry-only.
 */
export type CannibalizationCheckerOptions = ReviewAgentOptions & {
    /** Slug of the post under review, to skip self-matches on refresh */
    currentPostSlug?: string
    /** Live lookup: which URLs rank for a query (Search Console) */
    pagesForQuery?: (query: string) => Promise<RankingPage[]>
}

/**
 * Schema for cannibalization review
 */
const cannibalizationReviewSchema = z.object({
    score: z
        .number()
        .describe(
            'Cannibalization safety score, 0-100. 100 = no overlap with any owned cluster; below 60 = the draft competes with an existing page.'
        ),
    issues: z.array(
        z.object({
            severity: z.enum(['critical', 'warning', 'suggestion']),
            location: z
                .string()
                .describe(
                    'Where the overlap occurs (e.g. "Primary keyword", "H2: How Much Does It Cost", "Secondary keywords")'
                ),
            description: z
                .string()
                .describe(
                    'What overlaps and with which page — ALWAYS name the owning URL'
                ),
            suggestedFix: z
                .string()
                .describe(
                    'How to resolve: re-angle the section, drop the keyword, link to the owning page instead of competing with it'
                ),
            originalText: z
                .string()
                .nullable()
                .describe(
                    'The competing keyword, heading or phrase. Null if not applicable.'
                ),
        })
    ),
    overlappingUrls: z
        .array(z.string())
        .describe(
            'URLs of existing pages this draft competes with (empty when clean)'
        ),
    summary: z
        .string()
        .describe(
            'Summary of the cannibalization review. Maximum 500 characters.'
        ),
})

/**
 * System prompt for the cannibalization checker
 */
const CANNIBALIZATION_REVIEW_SYSTEM_PROMPT = `You are an SEO strategist enforcing a strict one-owner-per-query-cluster policy for a plastic surgery clinic's website.

Site policy (non-negotiable):
- Every query cluster has exactly ONE owning page site-wide.
- Procedure pages own procedure intent; cost pages own price intent; the financing page owns payment intent; blog posts own informational long-tail ONLY.
- A blog post must never target a query owned by a money page (procedure/cost/financing/landing), and must never compete with another blog post's cluster.
- Adjacent coverage is fine: MENTIONING a topic and LINKING to its owning page is correct behavior. Competition means a dedicated section or keyword targeting that tries to RANK for the owned query.

You will receive:
1. The draft's title, keywords and H2 outline, plus the full content
2. Registry findings: deterministic matches between the draft's queries/headings and owned clusters (exact and fuzzy)
3. Optionally, live Search Console data showing which URLs already rank for the head terms

Judge each registry finding:
- TRUE COMPETITION → issue. critical: the draft's primary targeting (title/primary keyword) hits a cluster owned by another page. warning: a section (H2) or secondary keyword substantially targets an owned query. Always name the owning URL in the description.
- ACCEPTABLE ADJACENCY → no issue (brief mention, context paragraph, or a link to the owning page).

Scoring:
- 90-100: No competition; adjacent topics link to their owners
- 75-89: Minor drift — a secondary keyword or one section needs re-angling
- 60-74: A section competes with an owned cluster
- 0-59: The draft's primary targeting competes with an existing page

Output valid JSON matching the schema. If the draft is clean, return score >= 90, empty issues, empty overlappingUrls — do not invent problems.`

/** Extract H2 headings from markdown content */
function extractH2Headings(content: string): string[] {
    const headings: string[] = []
    const pattern = /^##\s+(.+)$/gm
    let match
    while ((match = pattern.exec(content)) !== null) {
        headings.push(match[1]!.trim())
    }
    return headings
}

/** One deterministic registry finding for the prompt */
type RegistryFinding = {
    source: string
    query: string
    ownerUrl: string
    ownerKind: string
    match: 'exact' | 'similar'
    score?: number
}

/** Deterministic pass: match draft queries/headings against the registry */
function collectRegistryFindings(
    candidates: Array<{ source: string; query: string }>,
    currentPostSlug?: string
): RegistryFinding[] {
    const findings: RegistryFinding[] = []
    const seen = new Set<string>()

    // A match is a self-match only when the post under review IS the owner
    const isSelf = (ownerSlug: string | undefined) =>
        currentPostSlug !== undefined && ownerSlug === currentPostSlug

    for (const { source, query } of candidates) {
        const normalized = normalizeQuery(query)
        if (!normalized || seen.has(`${source}:${normalized}`)) continue
        seen.add(`${source}:${normalized}`)

        const exact = resolveQueryOwner(normalized)
        if (exact && !isSelf(exact.canonicalOwner.slug)) {
            findings.push({
                source,
                query: normalized,
                ownerUrl: exact.canonicalOwner.url,
                ownerKind: exact.canonicalOwner.kind,
                match: 'exact',
            })
            continue
        }

        const similar: SimilarOwnedQuery[] = findSimilarOwnedQueries(
            normalized,
            { threshold: 0.7, limit: 1 }
        )
        const best = similar[0]
        if (best && !isSelf(best.owner.slug)) {
            findings.push({
                source,
                query: normalized,
                ownerUrl: best.owner.url,
                ownerKind: best.owner.kind,
                match: 'similar',
                score: best.score,
            })
        }
    }

    return findings
}

/**
 * Run the cannibalization checker agent
 */
export async function runCannibalizationChecker(
    options: CannibalizationCheckerOptions
): Promise<AgentReview> {
    const startTime = Date.now()
    const {
        content,
        title,
        primaryKeyword,
        secondaryKeywords,
        currentPostSlug,
        pagesForQuery,
        modelId = DEFAULT_MODEL_ID,
    } = options

    const h2Headings = extractH2Headings(content)

    // Deterministic registry pass over everything the draft targets
    const candidates = [
        { source: 'Title', query: title },
        ...(primaryKeyword
            ? [{ source: 'Primary keyword', query: primaryKeyword }]
            : []),
        ...(secondaryKeywords ?? []).map((kw) => ({
            source: 'Secondary keyword',
            query: kw,
        })),
        ...h2Headings.map((h) => ({ source: `H2: ${h}`, query: h })),
    ]
    const findings = collectRegistryFindings(candidates, currentPostSlug)

    // Live ranking data for the head terms (when the caller injected it)
    let liveRankings = ''
    if (pagesForQuery && primaryKeyword) {
        const headQueries = [
            primaryKeyword,
            ...findings
                .filter((f) => f.match === 'exact')
                .map((f) => f.query)
                .slice(0, 2),
        ]
        const sections: string[] = []
        for (const query of [...new Set(headQueries)]) {
            try {
                const pages = await pagesForQuery(query)
                if (pages.length > 0) {
                    sections.push(
                        `"${query}":\n${pages
                            .slice(0, 5)
                            .map(
                                (p) =>
                                    `  - ${p.page} (position ${p.position.toFixed(1)}, ${p.clicks} clicks, ${p.impressions} impressions)`
                            )
                            .join('\n')}`
                    )
                }
            } catch {
                // Live data is best-effort; registry findings stand alone
            }
        }
        if (sections.length > 0) {
            liveRankings = `
---

**Live Search Console — URLs currently ranking for the head terms:**
${sections.join('\n')}
`
        }
    }

    const prompt = `Review this draft for keyword cannibalization:

**Title:** ${title}
**Primary Keyword:** ${primaryKeyword || 'Not specified'}
**Secondary Keywords:** ${secondaryKeywords?.length ? secondaryKeywords.join(', ') : 'None'}

**H2 Outline:**
${h2Headings.length > 0 ? h2Headings.map((h) => `- ${h}`).join('\n') : 'No H2 headings found'}

---

**Registry findings (deterministic matches against owned query clusters):**
${
    findings.length > 0
        ? findings
              .map(
                  (f) =>
                      `- [${f.source}] "${f.query}" ${f.match === 'exact' ? 'is owned by' : `overlaps (${Math.round((f.score ?? 0) * 100)}%) a query owned by`} ${f.ownerUrl} (${f.ownerKind} page)`
              )
              .join('\n')
        : 'None — no draft query or heading matches an owned cluster.'
}
${liveRankings}
---

**Content:**
${content}

---

Judge each registry finding against the actual content: true competition or acceptable adjacency? Provide your review.`

    const result = await coreGenerateObject({
        modelId,
        schema: cannibalizationReviewSchema,
        system: CANNIBALIZATION_REVIEW_SYSTEM_PROMPT,
        prompt,
    })

    const processingTimeMs = Date.now() - startTime

    return {
        agentName: 'cannibalization-checker',
        score: result.object.score,
        issues: result.object.issues as ReviewIssue[],
        summary: result.object.summary,
        processingTimeMs,
        modelId,
    }
}
