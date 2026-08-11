/**
 * Keyword Ownership Registry — lookup helpers
 *
 * Deterministic, dependency-free lookups over the registry constants.
 * Consumers: ideation gate (apps/admin), cannibalization-checker review
 * agent (packages/ai), batch skill.
 *
 * The module-level functions operate on the checked-in registry. Callers
 * that need to overlay live data (e.g. posts published after the registry
 * was seeded) pass extra entries via the `entries` parameter variants.
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

/** Pick the canonical owner between two entries claiming the same query */
function pickOwner(a: OwnedPage, b: OwnedPage): OwnedPage {
    // Live/planned pages beat retired slugs
    if (a.status !== 'retired' && b.status === 'retired') return a
    if (b.status !== 'retired' && a.status === 'retired') return b
    if (a.duplicateOf === b.url) return b
    if (b.duplicateOf === a.url) return a
    // Intent split: money pages beat blog posts
    if (a.kind !== 'blog' && b.kind === 'blog') return a
    if (b.kind !== 'blog' && a.kind === 'blog') return b
    return a
}

type OwnershipIndexes = {
    byUrl: Map<string, OwnedPage>
    byQuery: Map<string, { entry: OwnedPage; query: string }>
}

function buildIndexes(entries: OwnedPage[]): OwnershipIndexes {
    const byUrl = new Map<string, OwnedPage>(entries.map((e) => [e.url, e]))

    // Retired entries participate (so ideation can reject re-proposals of
    // retired topics) but lose to any live/planned owner via pickOwner
    const byQuery = new Map<string, { entry: OwnedPage; query: string }>()
    for (const entry of entries) {
        for (const query of ownedQueries(entry)) {
            if (!query) continue
            const existing = byQuery.get(query)
            byQuery.set(query, {
                entry: existing ? pickOwner(existing.entry, entry) : entry,
                query,
            })
        }
    }
    return { byUrl, byQuery }
}

let defaultIndexes: OwnershipIndexes | null = null

function getIndexes(entries?: OwnedPage[]): OwnershipIndexes {
    if (entries) return buildIndexes([...getKeywordRegistry(), ...entries])
    if (!defaultIndexes) defaultIndexes = buildIndexes(getKeywordRegistry())
    return defaultIndexes
}

/** Follow duplicateOf to the cluster's canonical owner */
export function resolveCanonicalOwner(
    entry: OwnedPage,
    extraEntries?: OwnedPage[]
): OwnedPage {
    if (!entry.duplicateOf) return entry
    const canonical = getIndexes(extraEntries).byUrl.get(entry.duplicateOf)
    return canonical ?? entry
}

/**
 * Resolve the owner of a query cluster, or null when the cluster is
 * unclaimed. Exact match on normalized query strings — use
 * findSimilarOwnedQueries for near-duplicate detection.
 *
 * @param extraEntries - Live overlay entries (e.g. posts published after
 *   the registry seed) considered alongside the checked-in registry
 *
 * @example resolveQueryOwner('bbl cost miami')?.owner.url === '/bbl-cost-miami'
 */
export function resolveQueryOwner(
    query: string,
    extraEntries?: OwnedPage[]
): QueryOwnership | null {
    const hit = getIndexes(extraEntries).byQuery.get(normalizeQuery(query))
    if (!hit) return null
    return {
        owner: hit.entry,
        canonicalOwner: resolveCanonicalOwner(hit.entry, extraEntries),
        matchedQuery: hit.query,
    }
}

/** Look up the registry entry for a URL (or a blog post slug via its URL) */
export function getOwnerForUrl(
    url: string,
    extraEntries?: OwnedPage[]
): OwnedPage | null {
    return getIndexes(extraEntries).byUrl.get(url) ?? null
}

/**
 * Score a query against every owned query and return matches above the
 * threshold, best first. Token-set Jaccard similarity — cheap,
 * deterministic, good enough to catch "-quiz"/"-checklist"/"-for-moms"
 * persona-variants of an identical query.
 */
export function findSimilarOwnedQueries(
    query: string,
    options: {
        threshold?: number
        limit?: number
        extraEntries?: OwnedPage[]
    } = {}
): SimilarOwnedQuery[] {
    const { threshold = 0.6, limit = 10, extraEntries } = options
    const target = queryTokens(query)
    if (target.size === 0) return []

    const entries = extraEntries
        ? [...getKeywordRegistry(), ...extraEntries]
        : getKeywordRegistry()

    const results: SimilarOwnedQuery[] = []
    for (const entry of entries) {
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
