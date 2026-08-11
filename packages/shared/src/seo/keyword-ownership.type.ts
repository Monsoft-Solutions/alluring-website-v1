/**
 * Keyword Ownership Registry — types
 *
 * One owner per query cluster, site-wide. The registry is the structural
 * defense against keyword cannibalization: before any new page or post is
 * created (or an existing one retargeted), its target queries must resolve
 * to an unowned cluster.
 *
 * Rule of intent split (see docs/seo/keyword-map-cost-pages.md):
 * - procedure pages own procedure intent ("what is it, am I a candidate")
 * - cost pages own price intent ("how much, what's included")
 * - the financing page owns payment-method intent
 * - blog posts own informational long-tail ONLY — never commercial intent
 *
 * @module @workspace/shared/seo/keyword-ownership.type
 */

/** Search intent a page is built to satisfy */
export type PageIntent =
    | 'procedure'
    | 'price'
    | 'financing'
    | 'consultation'
    | 'candidacy'
    | 'comparison'
    | 'informational'
    | 'navigational'

/** What kind of page owns the cluster */
export type OwnedPageKind =
    | 'procedure'
    | 'cost'
    | 'financing'
    | 'landing'
    | 'blog'
    | 'page'
    | 'surgeon'

/**
 * Lifecycle status of the owning page.
 * - live: page exists and is indexable
 * - planned: in the strategy docs but not built yet — it still owns its
 *   cluster (nothing else may claim it), but link helpers must exclude it
 * - retired: page was removed/301'd — kept so ideation never re-proposes
 *   its topic under the old slug
 */
export type OwnedPageStatus = 'live' | 'planned' | 'retired'

/** A query this page must never target, and who owns it instead */
export type MustNotTarget = {
    query: string
    /** URL of the page that owns this query */
    ownedBy: string
}

/** One entry in the keyword ownership registry */
export type OwnedPage = {
    /** Canonical path, e.g. '/procedures/liposuction-miami' or '/blog/bbl-recovery-time-miami' */
    url: string
    /** Blog posts only: the DB slug (URL derives from slug + publish date) */
    slug?: string
    kind: OwnedPageKind
    intent: PageIntent
    status: OwnedPageStatus
    /** Head term of the owned query cluster */
    primaryKeyword: string
    /** The full owned cluster (primaryKeyword is implicitly included) */
    ownsQueries: string[]
    /** Queries adjacent to this page's topic that belong to another owner */
    mustNotTarget?: MustNotTarget[]
    /**
     * Blog consolidation candidates: this post targets a cluster whose
     * proposed owner is another URL (plan doc §6). Queries resolve to this
     * entry but the canonical owner is the referenced page.
     */
    duplicateOf?: string
    /** Retired pages: the 301 destination (mirrors next.config.mjs) */
    redirectsTo?: string
    notes?: string
}

/** Result of resolving a query against the registry */
export type QueryOwnership = {
    /** The entry whose cluster matched the query */
    owner: OwnedPage
    /** The canonical owner after following duplicateOf (usually === owner) */
    canonicalOwner: OwnedPage
    /** The owned query string that matched */
    matchedQuery: string
}

/** A scored near-match from findSimilarOwnedQueries */
export type SimilarOwnedQuery = {
    owner: OwnedPage
    query: string
    /** Token-overlap score in [0, 1] */
    score: number
}
