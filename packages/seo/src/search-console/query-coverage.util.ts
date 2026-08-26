/**
 * Query Coverage
 *
 * Decides whether the site already has a page covering a search query.
 *
 * This used to be a one-line substring test — does the ranking page's URL
 * contain any word of the query longer than three characters — and it produced
 * confident false gaps. The query `bbl smell` was reported as uncovered with
 * ~10,800 impressions while `/why-do-bbl-stink` was ranking for all of them at
 * position 10: `bbl` is three characters so it was filtered out, and the slug
 * says *stink* where searchers say *smell*.
 *
 * That mistake is expensive, because "no page exists" and "a page exists but
 * uses different words" call for opposite actions — write a new page versus
 * retitle the one you have. Recommending the first when the second is true
 * creates cannibalization against your own ranking page.
 *
 * So coverage is no longer a boolean. A page's URL matching the query is strong
 * evidence it was built for it, but a page *ranking well* is evidence too, even
 * when the wording differs. See {@link classifyQueryCoverage}.
 *
 * @module @workspace/seo/search-console — query coverage
 */
import type { QueryCoverage } from './search-console.type.js'

/**
 * Average position at or above which a page counts as genuinely ranking for a
 * query, whatever its slug says.
 *
 * Set at the bottom of page one. A page averaging better than this is being
 * shown to searchers as an answer to the query; below it, the match is more
 * likely incidental.
 */
export const COVERAGE_POSITION_THRESHOLD = 15

/**
 * Words carrying no topical signal, dropped before matching a query against a
 * URL.
 *
 * Replaces the old length filter, which discarded meaningful short terms —
 * `bbl`, `cost`, `age` — and was the direct cause of the `bbl smell` misfire.
 */
const STOPWORDS = new Set([
    'a',
    'about',
    'after',
    'an',
    'and',
    'any',
    'are',
    'as',
    'at',
    'be',
    'before',
    'but',
    'by',
    'can',
    'do',
    'does',
    'for',
    'from',
    'get',
    'go',
    'has',
    'have',
    'how',
    'i',
    'if',
    'in',
    'is',
    'it',
    'long',
    'many',
    'me',
    'much',
    'my',
    'near',
    'of',
    'on',
    'or',
    'should',
    'so',
    'that',
    'the',
    'their',
    'there',
    'they',
    'this',
    'to',
    'was',
    'were',
    'what',
    'when',
    'where',
    'which',
    'who',
    'why',
    'will',
    'with',
    'you',
    'your',
])

/**
 * The topically meaningful words of a query.
 *
 * Splits on anything non-alphanumeric, drops stopwords and single characters.
 * Returns an empty array for a query that is nothing but stopwords, which
 * callers must treat as "cannot judge" rather than "no match".
 */
export function queryTerms(query: string): string[] {
    return query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((term) => term.length > 1 && !STOPWORDS.has(term))
}

/**
 * Whether one query term appears in a URL, tolerating a plural.
 *
 * Slugs are written in the singular (`/why-do-bbl-stink`) while searchers
 * pluralise freely (`do bbls stink`). Without this, that pair reads as a
 * vocabulary mismatch. The stripped form must still be three characters, so
 * `gas` is not quietly matched by `ga`.
 */
function urlHasTerm(url: string, term: string): boolean {
    if (url.includes(term)) return true

    const singular = term.endsWith('s') ? term.slice(0, -1) : null
    return singular !== null && singular.length >= 3 && url.includes(singular)
}

/**
 * Whether a page URL looks purpose-built for a query.
 *
 * Requires *every* meaningful term to appear. Requiring only one would let a
 * page about BBLs in general claim every BBL question on the site — which is
 * how `/why-do-bbl-stink` would silently absorb `bbl smell` and hide the very
 * problem this module exists to catch.
 */
export function urlCoversQuery(pageUrl: string, query: string): boolean {
    const terms = queryTerms(query)
    if (terms.length === 0) return false

    const url = pageUrl.toLowerCase()
    return terms.every((term) => urlHasTerm(url, term))
}

/**
 * Classify how well the site covers a query.
 *
 * - `covered` — a page's URL carries the query's vocabulary. It was built for
 *   this. Not a gap; nothing to report.
 * - `weak` — no URL match, but a page ranks within
 *   {@link COVERAGE_POSITION_THRESHOLD}. The topic is covered in different
 *   words. Fix the existing page's title and meta; do not write a new one.
 * - `none` — no URL match and nothing ranking well. A genuine gap.
 *
 * @param query - The search query
 * @param topPage - URL of the best-ranking page, or null if there is none
 * @param topPagePosition - That page's average position
 */
export function classifyQueryCoverage(
    query: string,
    topPage: string | null,
    topPagePosition: number | null
): QueryCoverage {
    if (!topPage) return 'none'
    if (urlCoversQuery(topPage, query)) return 'covered'

    return topPagePosition !== null &&
        topPagePosition > 0 &&
        topPagePosition <= COVERAGE_POSITION_THRESHOLD
        ? 'weak'
        : 'none'
}
