/**
 * Refresh Brief Utilities
 *
 * Pure derivations behind the refresh brief (epic #144, #148): given a
 * post's per-query windows and its current content, name the queries that
 * matter — top performers, decayed ones, and rising queries the content
 * doesn't cover yet (the "new FAQs to add" list). No DB, fully
 * unit-testable; the service layer supplies rows and stores the result.
 *
 * @module @/lib/utils/refresh-brief.util
 */
import type { RefreshBrief, RefreshSignal } from '@workspace/db/types'

import type { PostQueryWindow } from '@/lib/queries/gsc-snapshot.query'

// ============================================
// Constants
// ============================================

/** Max entries per brief list — briefs steer a writer, not a spreadsheet. */
export const BRIEF_LIST_CAP = 10

/** A query needs this many current-window impressions to make any list. */
export const BRIEF_MIN_IMPRESSIONS = 50

/** Position worsening (in spots) that marks a query as decayed. */
export const DECAYED_QUERY_MIN_DROP = 2

/**
 * Tokens too generic to count toward query coverage. Keeping this small is
 * deliberate: over-filtering makes every query look covered.
 */
const STOPWORDS = new Set([
    'a',
    'an',
    'and',
    'are',
    'best',
    'can',
    'do',
    'does',
    'for',
    'how',
    'in',
    'is',
    'it',
    'my',
    'near',
    'of',
    'on',
    'the',
    'to',
    'what',
    'when',
    'where',
    'which',
    'who',
    'why',
    'you',
    'your',
])

// ============================================
// Coverage matching
// ============================================

/** Lowercase word tokens, naively de-pluralized (trailing `s` stripped). */
function tokenize(text: string): string[] {
    return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).map((token) =>
        token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : token
    )
}

/**
 * Extract the coverage corpus from a post: title, markdown headings, and
 * FAQ questions — the surfaces a searcher's query would match against.
 */
export function buildCoverageCorpus(input: {
    title: string
    content: string
    faqs?: { question: string }[] | null
}): Set<string> {
    const headings = input.content.match(/^#{1,6}\s+(.+)$/gm) ?? []
    const faqQuestions = (input.faqs ?? []).map((faq) => faq.question)
    const corpus = [input.title, ...headings, ...faqQuestions].join(' ')
    return new Set(tokenize(corpus))
}

/**
 * A query is covered when every meaningful token already appears in the
 * corpus. One missing token means the content has nothing that matches the
 * searcher's words — exactly the gap a refresh section/FAQ should fill.
 */
export function isQueryCovered(query: string, corpus: Set<string>): boolean {
    const tokens = tokenize(query).filter((token) => !STOPWORDS.has(token))
    if (tokens.length === 0) return true
    return tokens.every((token) => corpus.has(token))
}

// ============================================
// Brief lists
// ============================================

/** Top queries by current impressions, with their window-over-window delta. */
export function deriveTopQueries(
    windows: PostQueryWindow[]
): RefreshBrief['topQueries'] {
    return windows
        .filter((row) => row.current.impressions >= BRIEF_MIN_IMPRESSIONS)
        .sort((a, b) => b.current.impressions - a.current.impressions)
        .slice(0, BRIEF_LIST_CAP)
        .map((row) => ({
            query: row.query,
            impressions: row.current.impressions,
            position: round2(row.current.position ?? 0),
            positionDelta:
                row.current.position !== null && row.previous.position !== null
                    ? round2(row.current.position - row.previous.position)
                    : 0,
            ctr:
                row.current.impressions > 0
                    ? round4(row.current.clicks / row.current.impressions)
                    : 0,
        }))
}

/**
 * Queries whose position worsened by ≥ `DECAYED_QUERY_MIN_DROP` spots with
 * real volume in either window — what the refresh should win back.
 */
export function deriveDecayedQueries(windows: PostQueryWindow[]): string[] {
    return windows
        .filter(
            (row) =>
                row.current.position !== null &&
                row.previous.position !== null &&
                row.current.position - row.previous.position >=
                    DECAYED_QUERY_MIN_DROP &&
                Math.max(row.current.impressions, row.previous.impressions) >=
                    BRIEF_MIN_IMPRESSIONS
        )
        .sort(
            (a, b) =>
                b.current.position! -
                b.previous.position! -
                (a.current.position! - a.previous.position!)
        )
        .slice(0, BRIEF_LIST_CAP)
        .map((row) => row.query)
}

/**
 * Queries earning impressions that the content doesn't cover in its title,
 * headings, or FAQs — candidates for new sections and FAQ entries.
 */
export function deriveRisingQueriesNotCovered(
    windows: PostQueryWindow[],
    corpus: Set<string>
): string[] {
    return windows
        .filter(
            (row) =>
                row.current.impressions >= BRIEF_MIN_IMPRESSIONS &&
                row.current.impressions >= row.previous.impressions &&
                !isQueryCovered(row.query, corpus)
        )
        .sort((a, b) => b.current.impressions - a.current.impressions)
        .slice(0, BRIEF_LIST_CAP)
        .map((row) => row.query)
}

// ============================================
// Reasons & instructions
// ============================================

/** One human sentence per detection signal — the brief's "why" section. */
export function describeSignalsAsReasons(signals: RefreshSignal[]): string[] {
    return signals.map((signal) => {
        const metrics = signal.metrics
        switch (signal.source) {
            case 'position-drop':
                return `Ranking dropped ${metrics.driftAdjustedDrop} spots over 28 days (${metrics.impressions} impressions).`
            case 'ctr-gap':
                return `CTR is ${(Number(metrics.ctr) * 100).toFixed(1)}% where ${(Number(metrics.expectedCtr) * 100).toFixed(1)}% is expected at position ${metrics.position}.`
            case 'stale-age':
                return `Content is ${metrics.ageMonths} months old without an update.`
            case 'cannibalization':
                return `Competes with ${metrics.ownerUrl} for "${metrics.query}" — differentiate this post's angle.`
            case 'ideation-gate':
                return `Search demand behind "${metrics.topicTitle}" belongs to this post.`
            case 'manual':
                return 'An admin requested this refresh.'
        }
    })
}

/**
 * The standing writer instructions every refresh carries. Query-specific
 * guidance rides in the lists; these pin the invariants.
 */
export function buildRefreshInstructions(input: {
    risingQueriesNotCovered: string[]
    decayedQueries: string[]
}): string[] {
    const instructions = [
        'Treat the existing article as the base. Improve it in place — do not rewrite from scratch or change its topic, intent, or point of view.',
        'Preserve the heading structure for sections that earn rankings; you may refine wording, but keep the searcher-facing meaning of each heading.',
        'Update dated facts, statistics, and pricing using the research tools; remove claims that are no longer true.',
    ]
    if (input.decayedQueries.length > 0) {
        instructions.push(
            'Strengthen the sections answering the decayed queries listed in this brief — deepen the answer, add specifics, refresh evidence.'
        )
    }
    if (input.risingQueriesNotCovered.length > 0) {
        instructions.push(
            'Add sections or FAQ entries answering the uncovered rising queries listed in this brief.'
        )
    }
    return instructions
}

// ============================================
// Small helpers
// ============================================

function round2(value: number): number {
    return Math.round(value * 100) / 100
}

function round4(value: number): number {
    return Math.round(value * 10000) / 10000
}
