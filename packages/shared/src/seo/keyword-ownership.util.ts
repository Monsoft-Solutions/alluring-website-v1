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

/**
 * Words that say nothing about a topic, so they are never evidence of a
 * duplicate: "after", "how" and "long" must not make two unrelated questions
 * look alike. "much" stays out of this list on purpose: "how much" is price
 * intent.
 */
const STOP_TOKENS = new Set(
    (
        'about after all also and any are before best between but can compare compared ' +
        'could did difference does doing done for from get getting had happen has ' +
        'have how into its just long more most not one our over should than that the ' +
        'their them then there these they this those too versus very was way were ' +
        'what whats when where which while who why will with without would you your ' +
        'complete explained guide know need really things tips truth wait'
    ).split(' ')
)

/**
 * Words that name a procedure rather than a topic inside it. Every post in a
 * cluster shares them, so they are never evidence of a duplicate either.
 */
const GENERIC_PROCEDURE_TOKENS = new Set(
    (
        'tummy tuck abdominoplasty surgery surgical procedure operation plastic ' +
        'cosmetic breast lift augmentation reduction implant mommy makeover ' +
        'brazilian butt nose job fat transfer bbl lipo liposuction ' +
        'rhinoplasty facelift'
    ).split(' ')
)

/** Places. A candidate that is only a procedure and a place is a head term. */
const LOCATION_TOKENS = new Set(['miami', 'florida', 'near'])

/** Words of price intent, which a comparison does not get out of. */
const PRICE_TOKENS = new Set(['cost', 'price', 'much', 'financing'])

/** Folds a trailing-s plural to singular ("bbls" ⇒ "bbl") */
function foldPlural(token: string): string {
    return token.length >= 4 && token.endsWith('s') && !token.endsWith('ss')
        ? token.slice(0, -1)
        : token
}

/** A query prepared for similarity scoring */
type ScoredQuery = {
    /** Every word: what the Jaccard and overlap scores count */
    tokens: Set<string>
    /** The words that say what the query is about, beyond the procedure */
    topic: Set<string>
    /** "A vs B", "A or B", "the difference between A and B" */
    isComparison: boolean
}

/**
 * Tokens for similarity scoring (drops 1–2 char noise words).
 * Trailing-s plurals fold to singular so pluralized candidates still match
 * owned vocabulary; both sides tokenize through here, so the folding is always
 * symmetric. In the topic, "before and after" and "C-section" are single ideas,
 * so they become one word each.
 */
function scoredQuery(query: string): ScoredQuery {
    const normalized = normalizeQuery(query)
    const words = normalized.split(' ').filter((t) => t.length > 2)
    return {
        tokens: new Set(words.map(foldPlural)),
        topic: new Set(
            normalized
                .replace(/\bbefore (and )?after\b/g, 'beforeafter')
                .replace(/\bc sections?\b/g, 'csection')
                .split(' ')
                .filter((t) => t.length > 2 && !STOP_TOKENS.has(t))
                .map(foldPlural)
                .filter((t) => !GENERIC_PROCEDURE_TOKENS.has(t))
        ),
        isComparison: /\b(vs|versus|or|compared|difference between)\b/.test(
            normalized
        ),
    }
}

/**
 * Do the two queries share evidence of being the same topic, rather than only
 * the words any two posts in a cluster share? This can only veto a score.
 *
 * - A comparison and a non-comparison are different intents unless they share
 *   two topic words or a price word: "mini vs full tummy tuck" clears "mini
 *   tummy tuck", while "mini vs full tummy tuck cost" still hits "mini tummy
 *   tuck cost".
 * - A candidate that is only a procedure and a place is a head term, and any
 *   page containing it competes with it.
 * - No shared topic word: not a duplicate. "pregnancy after tummy tuck" shares
 *   only the procedure with "tummy tuck before and after".
 * - One shared topic word: a duplicate only if that word is at least half of
 *   the longer side's topic. "tummy tuck drains" passes against "tummy tuck
 *   drains how long they stay"; "is a tummy tuck safe" does not against
 *   "exercises after tummy tuck miami safe timeline".
 */
function sharesTopicEvidence(target: ScoredQuery, owned: ScoredQuery): boolean {
    const shared = [...target.topic].filter((t) => owned.topic.has(t))
    if (
        target.isComparison !== owned.isComparison &&
        shared.length < 2 &&
        !shared.some((t) => PRICE_TOKENS.has(t))
    ) {
        return false
    }
    if ([...target.topic].every((t) => LOCATION_TOKENS.has(t))) return true
    if (shared.length === 0) return false
    if (shared.length >= 2) return true
    return 1 / Math.max(target.topic.size, owned.topic.size) >= 0.5
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
 * @example resolveQueryOwner('tummy tuck cost miami')?.owner.url === '/tummy-tuck-cost-miami'
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
 * threshold, best first. Token-set Jaccard similarity, kept only where the
 * shared words are evidence of the same topic (sharesTopicEvidence) — cheap,
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
    const target = scoredQuery(query)
    if (target.tokens.size === 0) return []

    const entries = extraEntries
        ? [...getKeywordRegistry(), ...extraEntries]
        : getKeywordRegistry()

    const results: SimilarOwnedQuery[] = []
    for (const entry of entries) {
        if (entry.status === 'retired') continue
        let best: { query: string; score: number } | null = null
        for (const owned of ownedQueries(entry)) {
            const scored = scoredQuery(owned)
            if (scored.tokens.size === 0) continue
            let intersection = 0
            for (const t of target.tokens)
                if (scored.tokens.has(t)) intersection++
            const union = target.tokens.size + scored.tokens.size - intersection
            const jaccard = union === 0 ? 0 : intersection / union
            // Jaccard punishes length mismatch: "bbl smell" scores 0.29
            // against a 7-token title query that fully contains it. When one
            // side is contained in the other, that IS the same cluster, so
            // the overlap coefficient (intersection over the smaller set)
            // also counts — guarded to sets of 2+ tokens so a single shared
            // word can never claim a match on its own.
            const smaller = Math.min(target.tokens.size, scored.tokens.size)
            const overlap = smaller >= 2 ? intersection / smaller : 0
            const score = Math.max(jaccard, overlap)
            if (
                score >= threshold &&
                (!best || score > best.score) &&
                sharesTopicEvidence(target, scored)
            ) {
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
            if (!mnt.pendingPost && !urlSet.has(mnt.ownedBy)) {
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
