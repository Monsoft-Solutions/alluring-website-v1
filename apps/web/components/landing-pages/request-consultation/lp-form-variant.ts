/**
 * The ads landing page's form test (#292): which form a visitor sees in the
 * hero — the quiet thread (A) or the tap card (B).
 *
 * The arm is chosen per visitor, not per page view, and kept for 90 days in
 * a cookie, so someone who comes back from a second ad click sees the same
 * form. `middleware.ts` makes the choice before the page renders and hands
 * it to the page in a request header, so the first HTML already has the
 * right form and nothing swaps after hydration.
 *
 *   ?fv=thread | ?fv=card     forces an arm (QA), and keeps it
 *   LP_FORM_SPLIT             each arm's share of new visitors:
 *                             'thread:50,card:50' (the default when unset),
 *                             'thread:100' to end the test on the thread.
 *
 * An arm set to 0 is closed: a returning visitor whose cookie names it is
 * drawn again, so rolling back is one environment variable.
 *
 * No React and no Next here: the middleware (Edge) and the tests use it.
 */

export const LP_FORM_VARIANTS = ['thread', 'card'] as const
export type LpFormVariant = (typeof LP_FORM_VARIANTS)[number]

export const LP_FORM_COOKIE = 'lp_fv'
export const LP_FORM_HEADER = 'x-lp-fv'
export const LP_FORM_QUERY = 'fv'
/** 90 days, in seconds. */
export const LP_FORM_COOKIE_MAX_AGE = 60 * 60 * 24 * 90

export type LpFormSplit = Readonly<Record<LpFormVariant, number>>

export const DEFAULT_LP_FORM_SPLIT: LpFormSplit = { thread: 50, card: 50 }

/** Narrows a query value, cookie or header to an arm. */
export function toLpFormVariant(
    value: string | null | undefined
): LpFormVariant | null {
    const key = (value ?? '').toLowerCase().trim()
    return (LP_FORM_VARIANTS as readonly string[]).includes(key)
        ? (key as LpFormVariant)
        : null
}

/**
 * `'thread:70,card:30'` → `{ thread: 70, card: 30 }`. An arm left out gets
 * 0 (`'thread:100'`). Anything unreadable, or all zeros, is 50/50: a typo in
 * the dashboard must not send every visitor to one form by accident.
 */
export function parseLpFormSplit(raw: string | null | undefined): LpFormSplit {
    const text = (raw ?? '').trim()
    if (!text) return DEFAULT_LP_FORM_SPLIT
    const split: Record<LpFormVariant, number> = { thread: 0, card: 0 }
    for (const part of text.split(',')) {
        const [name, weight] = part.split(':').map((piece) => piece.trim())
        const variant = toLpFormVariant(name)
        const share = Number(weight)
        if (!variant || !Number.isFinite(share) || share < 0) {
            return DEFAULT_LP_FORM_SPLIT
        }
        split[variant] = share
    }
    return split.thread + split.card > 0 ? split : DEFAULT_LP_FORM_SPLIT
}

/** An arm by weight, given a number in [0, 1). */
export function drawLpFormVariant(
    split: LpFormSplit,
    random: number
): LpFormVariant {
    const total = split.thread + split.card
    return random * total < split.thread ? 'thread' : 'card'
}

export interface LpFormAssignment {
    readonly variant: LpFormVariant
    /** Where it came from: the QA override, the visitor's cookie, or a draw. */
    readonly source: 'query' | 'cookie' | 'draw'
}

/** The arm for this request. See the module comment for the order. */
export function assignLpFormVariant({
    query,
    cookie,
    split,
    random,
}: {
    readonly query: string | null | undefined
    readonly cookie: string | null | undefined
    readonly split: LpFormSplit
    readonly random: number
}): LpFormAssignment {
    const forced = toLpFormVariant(query)
    if (forced) return { variant: forced, source: 'query' }
    const kept = toLpFormVariant(cookie)
    if (kept && split[kept] > 0) return { variant: kept, source: 'cookie' }
    return { variant: drawLpFormVariant(split, random), source: 'draw' }
}
