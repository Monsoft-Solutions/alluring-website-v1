/**
 * The ads landing page's two tests, crossed (a 2×2):
 *
 *   form (#292)   which form a visitor sees in the hero — the quiet thread
 *                 (A) or the tap card (B)
 *   copy (#302)   whether the form's last step says what happens next above
 *                 the fields (`reassure`) or only asks for the number (`plain`)
 *
 * Each test has its own cookie, header, override and split, and draws its
 * arm with its own random number, so the two are independent.
 *
 * An arm is chosen per visitor, not per page view, and kept for 90 days in
 * a cookie, so someone who comes back from a second ad click sees the same
 * page. `middleware.ts` makes the choice before the page renders and hands
 * it to the page in a request header, so the first HTML already has the
 * right form and nothing swaps after hydration.
 *
 *   ?fv=thread | ?fv=card     forces a form arm (QA), and keeps it
 *   LP_FORM_SPLIT             each form arm's share of new visitors:
 *                             'thread:50,card:50' (the default when unset),
 *                             'thread:100' to end the test on the thread.
 *   ?cv=plain | ?cv=reassure  forces a copy arm, and keeps it
 *   LP_COPY_SPLIT             the same for the copy test: 'plain:50,reassure:50'
 *                             when unset, 'plain:100' to roll it back.
 *
 * An arm set to 0 is closed: a returning visitor whose cookie names it is
 * drawn again, so rolling back is one environment variable.
 *
 * No React and no Next here: the middleware (Edge) and the tests use it.
 */

type Split<V extends string> = Readonly<Record<V, number>>

interface Assignment<V extends string> {
    readonly variant: V
    /** Where it came from: the QA override, the visitor's cookie, or a draw. */
    readonly source: 'query' | 'cookie' | 'draw'
}

interface AssignInput<V extends string> {
    readonly query: string | null | undefined
    readonly cookie: string | null | undefined
    readonly split: Split<V>
    readonly random: number
}

/** Narrows a query value, cookie or header to one of `variants`. */
function toVariant<V extends string>(
    variants: readonly [V, V],
    value: string | null | undefined
): V | null {
    const key = (value ?? '').toLowerCase().trim()
    return (variants as readonly string[]).includes(key) ? (key as V) : null
}

/**
 * `'a:70,b:30'` → `{ a: 70, b: 30 }`. An arm left out gets 0 (`'a:100'`).
 * Anything unreadable, or all zeros, is the fallback (50/50): a typo in the
 * dashboard must not send every visitor to one arm by accident.
 */
function parseSplit<V extends string>(
    variants: readonly [V, V],
    fallback: Split<V>,
    raw: string | null | undefined
): Split<V> {
    const text = (raw ?? '').trim()
    if (!text) return fallback
    const split = { [variants[0]]: 0, [variants[1]]: 0 } as Record<V, number>
    for (const part of text.split(',')) {
        const [name, weight] = part.split(':').map((piece) => piece.trim())
        const variant = toVariant(variants, name)
        const share = Number(weight)
        if (!variant || !Number.isFinite(share) || share < 0) return fallback
        split[variant] = share
    }
    return split[variants[0]] + split[variants[1]] > 0 ? split : fallback
}

/** An arm by weight, given a number in [0, 1). */
function drawVariant<V extends string>(
    [first, second]: readonly [V, V],
    split: Split<V>,
    random: number
): V {
    const total = split[first] + split[second]
    return random * total < split[first] ? first : second
}

/** The override, then a cookie naming an open arm, then a draw. */
function assignVariant<V extends string>(
    variants: readonly [V, V],
    { query, cookie, split, random }: AssignInput<V>
): Assignment<V> {
    const forced = toVariant(variants, query)
    if (forced) return { variant: forced, source: 'query' }
    const kept = toVariant(variants, cookie)
    if (kept && split[kept] > 0) return { variant: kept, source: 'cookie' }
    return { variant: drawVariant(variants, split, random), source: 'draw' }
}

/** 90 days, in seconds, for both tests' cookies. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90

// ---- The form test (#292) --------------------------------------------------

export const LP_FORM_VARIANTS = ['thread', 'card'] as const
export type LpFormVariant = (typeof LP_FORM_VARIANTS)[number]

export const LP_FORM_COOKIE = 'lp_fv'
export const LP_FORM_HEADER = 'x-lp-fv'
export const LP_FORM_QUERY = 'fv'
export const LP_FORM_COOKIE_MAX_AGE = COOKIE_MAX_AGE

export type LpFormSplit = Split<LpFormVariant>

export const DEFAULT_LP_FORM_SPLIT: LpFormSplit = { thread: 50, card: 50 }

export const toLpFormVariant = (value: string | null | undefined) =>
    toVariant(LP_FORM_VARIANTS, value)

export const parseLpFormSplit = (raw: string | null | undefined) =>
    parseSplit(LP_FORM_VARIANTS, DEFAULT_LP_FORM_SPLIT, raw)

export const drawLpFormVariant = (split: LpFormSplit, random: number) =>
    drawVariant(LP_FORM_VARIANTS, split, random)

export type LpFormAssignment = Assignment<LpFormVariant>

export const assignLpFormVariant = (
    input: AssignInput<LpFormVariant>
): LpFormAssignment => assignVariant(LP_FORM_VARIANTS, input)

// ---- The last step's wording (#302) ----------------------------------------

export const LP_COPY_VARIANTS = ['plain', 'reassure'] as const
export type LpCopyVariant = (typeof LP_COPY_VARIANTS)[number]

export const LP_COPY_COOKIE = 'lp_cv'
export const LP_COPY_HEADER = 'x-lp-cv'
export const LP_COPY_QUERY = 'cv'
export const LP_COPY_COOKIE_MAX_AGE = COOKIE_MAX_AGE

export type LpCopySplit = Split<LpCopyVariant>

export const DEFAULT_LP_COPY_SPLIT: LpCopySplit = { plain: 50, reassure: 50 }

export const toLpCopyVariant = (value: string | null | undefined) =>
    toVariant(LP_COPY_VARIANTS, value)

export const parseLpCopySplit = (raw: string | null | undefined) =>
    parseSplit(LP_COPY_VARIANTS, DEFAULT_LP_COPY_SPLIT, raw)

export const drawLpCopyVariant = (split: LpCopySplit, random: number) =>
    drawVariant(LP_COPY_VARIANTS, split, random)

export type LpCopyAssignment = Assignment<LpCopyVariant>

export const assignLpCopyVariant = (
    input: AssignInput<LpCopyVariant>
): LpCopyAssignment => assignVariant(LP_COPY_VARIANTS, input)
