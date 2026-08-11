/**
 * Ideation gate — new / refresh / reject verdicts for topic candidates
 *
 * Pure function over the keyword ownership registry (plus an optional
 * live-data overlay). Every candidate topic must pass through here before
 * it is shown to the admin or written by autopilot:
 *
 * - reject: its cluster belongs to a money page (blog must never target
 *   commercial intent), matches a retired slug, or is a near-duplicate of
 *   an existing page
 * - refresh: its cluster is owned by an existing blog post — route to the
 *   refresh flow instead of creating a competing URL
 * - new: the cluster is unclaimed
 *
 * @module @workspace/shared/seo/topic-gate.util
 */
import type { OwnedPage } from './keyword-ownership.type'
import {
    findSimilarOwnedQueries,
    normalizeQuery,
    resolveCanonicalOwner,
    resolveQueryOwner,
} from './keyword-ownership.util'

/** A topic candidate entering the gate */
export type TopicCandidate = {
    title: string
    primaryKeyword?: string | null
    secondaryKeywords?: string[] | null
}

export type TopicVerdictKind = 'new' | 'refresh' | 'reject'

/** Gate verdict for one candidate */
export type TopicVerdict = {
    verdict: TopicVerdictKind
    /** Human-readable explanation, shown on idea cards and in errors */
    reason: string
    /** The page that owns the conflicting cluster (reject/refresh) */
    owningUrl?: string
    /** Owning blog post's slug when the owner is a post */
    owningSlug?: string
    /** The owned query that matched (exact) or was most similar */
    matchedQuery?: string
    /** Similarity score when the match was fuzzy rather than exact */
    similarityScore?: number
    /** Queries this topic will own if written (verdict 'new') */
    claimedQueries: string[]
    /** Non-blocking issues, e.g. a secondary keyword owned elsewhere */
    warnings: string[]
}

export type EvaluateTopicOptions = {
    /** Live overlay entries (posts published after the registry seed) */
    extraEntries?: OwnedPage[]
    /** Fuzzy score at/above which a blog-owned match becomes 'refresh' (default 0.85) */
    refreshThreshold?: number
    /** Fuzzy score at/above which any match becomes 'reject' (default 0.7) */
    rejectThreshold?: number
}

/**
 * Evaluate a topic candidate against the ownership registry.
 *
 * @example
 * evaluateTopicCandidate({ title: 'BBL Cost in Miami', primaryKeyword: 'bbl cost miami' })
 * // → { verdict: 'reject', owningUrl: '/bbl-cost-miami', ... }
 */
export function evaluateTopicCandidate(
    candidate: TopicCandidate,
    options: EvaluateTopicOptions = {}
): TopicVerdict {
    const {
        extraEntries,
        refreshThreshold = 0.85,
        rejectThreshold = 0.7,
    } = options

    const primaryQuery = normalizeQuery(
        candidate.primaryKeyword?.trim() || candidate.title
    )
    const warnings: string[] = []

    // 1. Exact ownership of the primary query
    const exact = resolveQueryOwner(primaryQuery, extraEntries)
    if (exact) {
        const owner = exact.canonicalOwner
        if (owner.status === 'retired') {
            return {
                verdict: 'reject',
                reason: `Topic was retired — its old URL 301s to ${owner.redirectsTo ?? 'another page'}`,
                owningUrl: owner.redirectsTo ?? owner.url,
                matchedQuery: exact.matchedQuery,
                claimedQueries: [],
                warnings,
            }
        }
        if (owner.kind !== 'blog') {
            return {
                verdict: 'reject',
                reason: `"${exact.matchedQuery}" is owned by ${owner.url} (${owner.kind} page) — blog posts never target commercial intent`,
                owningUrl: owner.url,
                matchedQuery: exact.matchedQuery,
                claimedQueries: [],
                warnings,
            }
        }
        return {
            verdict: 'refresh',
            reason: `Cluster already owned by ${owner.url} — refresh that post instead of creating a competing URL`,
            owningUrl: owner.url,
            owningSlug: owner.slug,
            matchedQuery: exact.matchedQuery,
            claimedQueries: [],
            warnings,
        }
    }

    // 2. Near-duplicate detection over primary query and title
    const similar = [
        ...findSimilarOwnedQueries(primaryQuery, {
            threshold: rejectThreshold,
            limit: 3,
            extraEntries,
        }),
        ...(normalizeQuery(candidate.title) !== primaryQuery
            ? findSimilarOwnedQueries(candidate.title, {
                  threshold: rejectThreshold,
                  limit: 3,
                  extraEntries,
              })
            : []),
    ].sort((a, b) => b.score - a.score)

    const best = similar[0]
    if (best) {
        const owner = resolveCanonicalOwner(best.owner, extraEntries)
        if (owner.kind === 'blog' && best.score >= refreshThreshold) {
            return {
                verdict: 'refresh',
                reason: `Near-identical to "${best.query}" owned by ${owner.url} — refresh that post instead`,
                owningUrl: owner.url,
                owningSlug: owner.slug,
                matchedQuery: best.query,
                similarityScore: best.score,
                claimedQueries: [],
                warnings,
            }
        }
        return {
            verdict: 'reject',
            reason: `Too similar to "${best.query}" owned by ${owner.url} (${Math.round(best.score * 100)}% overlap) — a new post would cannibalize it`,
            owningUrl: owner.url,
            owningSlug: owner.kind === 'blog' ? owner.slug : undefined,
            matchedQuery: best.query,
            similarityScore: best.score,
            claimedQueries: [],
            warnings,
        }
    }

    // 3. Unclaimed cluster — check secondaries, drop any owned elsewhere
    const claimedQueries = [primaryQuery]
    for (const secondary of candidate.secondaryKeywords ?? []) {
        const query = normalizeQuery(secondary)
        if (!query || query === primaryQuery) continue
        const owned = resolveQueryOwner(query, extraEntries)
        if (owned) {
            warnings.push(
                `Secondary keyword "${query}" is owned by ${owned.canonicalOwner.url} — drop it from this post`
            )
            continue
        }
        claimedQueries.push(query)
    }

    return {
        verdict: 'new',
        reason: 'Cluster is unclaimed — safe to write',
        claimedQueries,
        warnings,
    }
}
