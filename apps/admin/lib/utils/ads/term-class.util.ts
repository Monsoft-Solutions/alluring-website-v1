/**
 * Search term classes: brand, competitor, procedure, address, other.
 *
 * A term takes the class of the patterns it contains, by class priority —
 * brand, then competitor, then address, then procedure — so "alluring
 * plastic surgery" is brand and "svelta plastic surgery" is a competitor,
 * though both contain the procedure pattern "plastic surg". Within a class
 * the longest pattern wins. Terms no pattern claims fall back to two shape
 * rules — a street address, and "dr <name>" / "<name> md" (someone else's
 * surgeon, since ours is a brand pattern) — and then to `other`.
 *
 * @module @/lib/utils/ads/term-class.util
 */
import type { AdsTermClass } from '@workspace/db/schema/ads'

export type TermClassName = AdsTermClass['termClass']

export type TermClassPattern = Pick<AdsTermClass, 'pattern' | 'termClass'>

/**
 * Seeded into `ads_term_class` the first time it is read empty. Brand and
 * address come from the web app's `siteConfig` (business name, surgeon,
 * street) — the admin cannot import it, so they are restated here. Competitor
 * names are the ones the Jun–Sep 2026 terms reports surfaced; add more from
 * the Search terms tab. Procedure patterns cover the Spanish searches too.
 */
export const DEFAULT_TERM_CLASSES: TermClassPattern[] = [
    { pattern: 'alluring', termClass: 'brand' },
    { pattern: 'karlinsky', termClass: 'brand' },
    { pattern: '8435 sw 24th', termClass: 'brand' },
    { pattern: 'cg cosmetic', termClass: 'competitor' },
    { pattern: 'altman', termClass: 'competitor' },
    { pattern: 'kaufman', termClass: 'competitor' },
    { pattern: 'svelta', termClass: 'competitor' },
    { pattern: 'miami life', termClass: 'competitor' },
    { pattern: 'harmony cosmetic', termClass: 'competitor' },
    { pattern: 'avana plastic', termClass: 'competitor' },
    { pattern: 'hochstein', termClass: 'competitor' },
    { pattern: 'bbl', termClass: 'procedure' },
    { pattern: 'brazilian butt', termClass: 'procedure' },
    { pattern: 'lipo', termClass: 'procedure' },
    { pattern: 'tummy tuck', termClass: 'procedure' },
    { pattern: 'abdominoplasty', termClass: 'procedure' },
    { pattern: 'breast', termClass: 'procedure' },
    { pattern: 'mommy makeover', termClass: 'procedure' },
    { pattern: 'facelift', termClass: 'procedure' },
    { pattern: 'face lift', termClass: 'procedure' },
    { pattern: 'rhinoplasty', termClass: 'procedure' },
    { pattern: 'nose job', termClass: 'procedure' },
    { pattern: 'blepharoplasty', termClass: 'procedure' },
    { pattern: 'fat removal', termClass: 'procedure' },
    { pattern: 'fat reduction', termClass: 'procedure' },
    { pattern: 'belly fat', termClass: 'procedure' },
    { pattern: 'gynecomastia', termClass: 'procedure' },
    { pattern: 'loose skin', termClass: 'procedure' },
    { pattern: 'abdominoplastia', termClass: 'procedure' },
    { pattern: 'senos', termClass: 'procedure' },
    { pattern: 'cirugia', termClass: 'procedure' },
    { pattern: 'cirugía', termClass: 'procedure' },
    { pattern: 'grasa', termClass: 'procedure' },
    { pattern: 'cosmetic surg', termClass: 'procedure' },
    { pattern: 'plastic surg', termClass: 'procedure' },
]

/** A street address or a Miami-area zip code. */
const ADDRESS_SHAPE =
    /\b\d{2,5}\s+(?:[nsew]{1,2}\s+)?\w+(?:\s+\w+)?\s+(?:st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ct|court|way|hwy|highway|ter|terrace|pl|place|ln|lane)\b|\b33\d{3}\b/i

/** "dr altman", "doctor kaufman", "dr. smith miami", "julio gallo md". */
const DOCTOR_SHAPE = /^(?:dr\.?|doctor)\s+[a-z]|\s(?:md|m\.d\.)(?:\s|$)/i

/** Normalize a pattern the way it is stored: trimmed, lower case, single spaces. */
export function normalizePattern(pattern: string): string {
    return pattern.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Which class wins when a term contains patterns of several. */
const CLASS_PRIORITY: Record<TermClassName, number> = {
    brand: 0,
    competitor: 1,
    address: 2,
    procedure: 3,
    other: 4,
}

/**
 * Build a classifier over a pattern list: class priority first, then the
 * longest pattern, so a specific pattern ("tummy tuck near me") beats a
 * general one ("tummy tuck") of the same class.
 */
export function createTermClassifier(
    patterns: readonly TermClassPattern[]
): (term: string) => TermClassName {
    const sorted = patterns
        .map((entry) => ({
            ...entry,
            pattern: normalizePattern(entry.pattern),
        }))
        .filter((entry) => entry.pattern.length > 0)
        .sort(
            (a, b) =>
                CLASS_PRIORITY[a.termClass] - CLASS_PRIORITY[b.termClass] ||
                b.pattern.length - a.pattern.length
        )

    return (term: string) => {
        const normalized = normalizePattern(term)
        const hit = sorted.find((entry) => normalized.includes(entry.pattern))
        if (hit) return hit.termClass
        if (ADDRESS_SHAPE.test(normalized)) return 'address'
        if (DOCTOR_SHAPE.test(normalized)) return 'competitor'
        return 'other'
    }
}

/**
 * Format terms as exact-match negatives for pasting into Google Ads:
 * one `[term]` per line, de-duplicated, in the order given.
 */
export function toExactMatchNegatives(terms: readonly string[]): string {
    const seen = new Set<string>()
    const lines: string[] = []
    for (const term of terms) {
        const normalized = normalizePattern(term)
        if (!normalized || seen.has(normalized)) continue
        seen.add(normalized)
        lines.push(`[${normalized}]`)
    }
    return lines.join('\n')
}
