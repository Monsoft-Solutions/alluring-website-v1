/**
 * Meta Description Normalisation
 *
 * Google renders roughly 160 characters of a meta description and cuts the rest
 * mid-word. Most of this site's descriptions are blog excerpts written for the
 * page, not for the SERP, so 130 of 205 pages overran and were being truncated
 * by Google rather than by us.
 *
 * Clamping here decides where the cut lands. It is a safety net, not the fix —
 * excerpts should be authored short at generation time; this only guarantees
 * that an over-long one still ends somewhere deliberate.
 *
 * @module lib/seo/meta-description
 */

/** Characters Google renders before truncating a description. */
const DESCRIPTION_LIMIT = 160

/**
 * Shortest cut we will accept from a sentence boundary. Below this, dropping to
 * the previous full stop throws away too much of the description, so a
 * word-boundary cut with an ellipsis reads better.
 */
const MIN_SENTENCE_CUT = 110

/**
 * Trims a description to {@link DESCRIPTION_LIMIT}, preferring to end on a
 * complete sentence and falling back to a whole word.
 *
 * @param description - Description as authored
 * @returns Description at most DESCRIPTION_LIMIT characters long
 */
export function clampMetaDescription(description: string): string
export function clampMetaDescription(
    description: string | undefined
): string | undefined
export function clampMetaDescription(
    description: string | undefined
): string | undefined {
    if (!description) return description

    const collapsed = description.replace(/\s+/g, ' ').trim()
    if (collapsed.length <= DESCRIPTION_LIMIT) return collapsed

    const window = collapsed.slice(0, DESCRIPTION_LIMIT)

    // Prefer ending on a sentence — reads as written rather than cut off.
    const lastSentenceEnd = Math.max(
        window.lastIndexOf('. '),
        window.lastIndexOf('! '),
        window.lastIndexOf('? ')
    )
    if (lastSentenceEnd >= MIN_SENTENCE_CUT) {
        return window.slice(0, lastSentenceEnd + 1)
    }

    const lastSpace = window.lastIndexOf(' ')
    const cut = lastSpace > 0 ? window.slice(0, lastSpace) : window

    // Strip trailing punctuation so we don't produce ",…" or ".…"
    return `${cut.replace(/[\s,;:.!?-]+$/, '')}…`
}
