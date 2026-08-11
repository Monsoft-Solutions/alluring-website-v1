/**
 * Keyword Ownership Registry — lookup helpers
 *
 * Deterministic, dependency-free lookups over the registry constants.
 * Consumers: ideation gate (apps/admin), cannibalization-checker review
 * agent (packages/ai), batch skill.
 *
 * @module @workspace/shared/seo/keyword-ownership.util
 */
import { BLOG_POST_ENTRIES } from './keyword-ownership-blog.constant'
import { MARKETING_PAGE_ENTRIES } from './keyword-ownership.constant'
import type {
    OwnedPage,
    QueryOwnership,
    SimilarOwnedQuery,
} from './keyword-ownership.type'

/** Every registry entry (marketing pages first, then blog) */
export function getKeywordRegistry(): OwnedPage[] {
    return [...MARKETING_PAGE_ENTRIES, ...BLOG_POST_ENTRIES]
}

/**
 * Normalize a query for ownership comparison: lowercase, strip
 * punctuation, collapse whitespace.
 */
export function normalizeQuery(query: string): string {
    return query
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúñü\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

/** Tokens for similarity scoring (drops 1–2 char noise words) */
function queryTokens(query: string): Set<string> {
    return new Set(
        normalizeQuery(query)
            .split(' ')
            .filter((t) => t.length > 2)
    )
}

/** All queries an entry claims (primaryKeyword + ownsQueries), normalized */
function ownedQueries(entry: OwnedPage): string[] {
    return [entry.primaryKeyword, ...entry.ownsQueries].map(normalizeQuery)
}

let urlIndex: Map<string, OwnedPage> | null = null
let queryIndex: Map<string, { entry: OwnedPage; query: string }> | null = null

function getUrlIndex(): Map<string, OwnedPage> {
    if (!urlIndex) {
        urlIndex = new Map(getKeywordRegistry().map((e) => [e.url, e]))
    }
    return urlIndex
}

/**
 * query -> owning entry. Retired entries never own queries. When two
 * entries claim the same query, the canonical owner (the duplicateOf
 * target, or the non-blog page under the intent split) wins.
 */
function getQueryIndex(): Map<string, { entry: OwnedPage; query: string }> {
    if (queryIndex) return queryIndex

    queryIndex = new Map()
    for (const entry of getKeywordRegistry()) {
        if (entry.status === 'retired') continue
        for (const query of ownedQueries(entry)) {
            if (!query) continue
            const existing = queryIndex.get(query)
            if (!existing) {
                queryIndex.set(query, { entry, query })
                continue
            }
            // Collision: prefer the canonical owner
            const winner = pickOwner(existing.entry, entry)
            queryIndex.set(query, { entry: winner, query })
        }
    }
    return queryIndex
}

/** Pick the canonical owner between two entries claiming the same query */
function pickOwner(a: OwnedPage, b: OwnedPage): OwnedPage {
    if (a.duplicateOf === b.url) return b
    if (b.duplicateOf === a.url) return a
    // Intent split: money pages beat blog posts
    if (a.kind !== 'blog' && b.kind === 'blog') return a
    if (b.kind !== 'blog' && a.kind === 'blog') return b
    return a
}

/** Follow duplicateOf to the cluster's canonical owner */
export function resolveCanonicalOwner(entry: OwnedPage): OwnedPage {
    if (!entry.duplicateOf) return entry
    const canonical = getUrlIndex().get(entry.duplicateOf)
    return canonical ?? entry
}

/**
 * Resolve the owner of a query cluster, or null when the cluster is
 * unclaimed. Exact match on normalized query strings — use
 * findSimilarOwnedQueries for near-duplicate detection.
 *
 * @example resolveQueryOwner('bbl cost miami')?.owner.url === '/bbl-cost-miami'
 */
export function resolveQueryOwner(query: string): QueryOwnership | null {
    const hit = getQueryIndex().get(normalizeQuery(query))
    if (!hit) return null
    return {
        owner: hit.entry,
        canonicalOwner: resolveCanonicalOwner(hit.entry),
        matchedQuery: hit.query,
    }
}

/** Look up the registry entry for a URL (or a blog post slug via its URL) */
export function getOwnerForUrl(url: string): OwnedPage | null {
    return getUrlIndex().get(url) ?? null
}

/**
 * Score a query against every owned query and return matches above the
 * threshold, best first. Token-set Jaccard similarity — cheap,
 * deterministic, good enough to catch "-quiz"/"-checklist"/"-for-moms"
 * persona-variants of an identical query.
 */
export function findSimilarOwnedQueries(
    query: string,
    options: { threshold?: number; limit?: number } = {}
): SimilarOwnedQuery[] {
    const { threshold = 0.6, limit = 10 } = options
    const target = queryTokens(query)
    if (target.size === 0) return []

    const results: SimilarOwnedQuery[] = []
    for (const entry of getKeywordRegistry()) {
        if (entry.status === 'retired') continue
        let best: { query: string; score: number } | null = null
        for (const owned of ownedQueries(entry)) {
            const tokens = queryTokens(owned)
            if (tokens.size === 0) continue
            let intersection = 0
            for (const t of target) if (tokens.has(t)) intersection++
            const union = target.size + tokens.size - intersection
            const score = union === 0 ? 0 : intersection / union
            if (score >= threshold && (!best || score > best.score)) {
                best = { query: owned, score }
            }
        }
        if (best) results.push({ owner: entry, ...best })
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

/**
 * Registry invariant violations, empty when healthy. Checked in unit
 * tests so a bad edit fails CI rather than silently corrupting verdicts.
 */
export function getRegistryIntegrityIssues(): string[] {
    const issues: string[] = []
    const registry = getKeywordRegistry()

    const urls = new Map<string, number>()
    const slugs = new Map<string, number>()
    for (const entry of registry) {
        urls.set(entry.url, (urls.get(entry.url) ?? 0) + 1)
        if (entry.slug) slugs.set(entry.slug, (slugs.get(entry.slug) ?? 0) + 1)
    }
    for (const [url, count] of urls) {
        if (count > 1) issues.push(`URL appears ${count} times: ${url}`)
    }
    for (const [slug, count] of slugs) {
        if (count > 1) issues.push(`Slug appears ${count} times: ${slug}`)
    }

    const urlSet = new Set(urls.keys())
    const claims = new Map<string, OwnedPage>()
    for (const entry of registry) {
        if (entry.duplicateOf && !urlSet.has(entry.duplicateOf)) {
            issues.push(
                `${entry.url}: duplicateOf target not in registry: ${entry.duplicateOf}`
            )
        }
        if (entry.status === 'retired' && !entry.redirectsTo) {
            issues.push(`${entry.url}: retired without redirectsTo`)
        }
        for (const mnt of entry.mustNotTarget ?? []) {
            if (!urlSet.has(mnt.ownedBy)) {
                issues.push(
                    `${entry.url}: mustNotTarget.ownedBy not in registry: ${mnt.ownedBy}`
                )
            }
        }
        if (entry.status === 'retired') continue
        for (const query of ownedQueries(entry)) {
            if (!query) continue
            const existing = claims.get(query)
            if (!existing || existing === entry) {
                claims.set(query, entry)
                continue
            }
            const resolvable =
                existing.duplicateOf === entry.url ||
                entry.duplicateOf === existing.url ||
                (existing.kind === 'blog') !== (entry.kind === 'blog')
            if (!resolvable) {
                issues.push(
                    `Query "${query}" owned by both ${existing.url} and ${entry.url}`
                )
            }
        }
    }

    return issues
}
