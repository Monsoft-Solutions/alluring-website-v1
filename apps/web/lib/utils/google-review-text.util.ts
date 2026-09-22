/**
 * A Google review's text as a page shows it.
 *
 * When a review is written in another language than the business profile's,
 * Google stores both versions in one comment:
 * `(Translated by Google) <English> (Original) <the reviewer's own words>`.
 * Printed as is, an English page shows the marker, then the English, then
 * the original after it. 34 of the 82 synced reviews had this shape on
 * 2026-09-22.
 *
 * @module
 */

const TRANSLATED =
    /^\s*\(Translated by Google\)\s*([\s\S]*?)\s*\(Original\)\s*([\s\S]*?)\s*$/

export type GoogleReviewText = {
    /** What the page shows: the review, or Google's translation of it. */
    text: string
    /** `true` when `text` is Google's translation; the page must say so. */
    translatedByGoogle: boolean
    /** The reviewer's own words, when `text` is a translation. */
    original?: string
}

/**
 * Split a Google review comment into the text to show and, for a translated
 * review, the original. Any other comment passes through untouched.
 */
export function readGoogleReviewText(comment: string): GoogleReviewText {
    const translated = TRANSLATED.exec(comment)
    if (!translated?.[1] || !translated[2]) {
        return { text: comment.trim(), translatedByGoogle: false }
    }
    return {
        text: translated[1],
        translatedByGoogle: true,
        original: translated[2],
    }
}
