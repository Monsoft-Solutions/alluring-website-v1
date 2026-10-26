/**
 * Titles that carry a price (issue #354).
 *
 * A hand-written `seoTitle` or a post's `meta_title` may name a price with a
 * claim token, and both are resolved as text. While a discount is on, text
 * mode prints "$4,400 (20% off $5,500)", which roughly doubles every figure
 * and pushes a title that fit past what Google renders. The page itself
 * carries the 456.062 statement next to the price; the title only needs the
 * figure.
 *
 * @module lib/seo/fit-title
 */
import { TITLE_LIMIT } from './generate-title.util'

/** The "(20% off $5,500)" a discounted price adds in text mode. */
const DISCOUNT_SUFFIX = /\s\(\d{1,2}% off \$[^)]*\)/g

/**
 * A resolved title that fits {@link TITLE_LIMIT}. A title that fits is
 * returned as written. One that runs over because of a discount loses the
 * "(N% off $X)" suffixes, keeping the price the reader pays; if it still
 * runs over, `fallback` (a title without a price) is used. A title that ran
 * over without any discount is the author's and is left alone.
 *
 * @param title - The title, claim tokens already resolved as text
 * @param fallback - A title with no price, for when even the compact form
 *   does not fit
 */
export function fitResolvedTitle(title: string, fallback?: string): string {
    if (title.length <= TITLE_LIMIT) return title
    const compact = title.replace(DISCOUNT_SUFFIX, '')
    if (compact === title) return title
    if (compact.length <= TITLE_LIMIT || !fallback) return compact
    return fallback
}
