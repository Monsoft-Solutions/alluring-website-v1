/**
 * GAQL building helpers
 *
 * Values interpolated into GAQL are quoted and escaped here, never by hand at
 * the call site — a search term containing an apostrophe ("women's lipo")
 * would otherwise end the string literal early.
 *
 * @module @workspace/google-ads — GAQL
 */
import type { DateRange } from './google-ads.type.js'

/** Quote a string literal for GAQL. */
export function gaqlString(value: string): string {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/** Escape a user-supplied substring for use inside a LIKE pattern. */
export function gaqlLikeContains(value: string): string {
    // `%` and `_` are wildcards in GAQL LIKE; `[x]` escapes one.
    const escaped = value.replace(/[%_[\]]/g, (char) => `[${char}]`)
    return gaqlString(`%${escaped}%`)
}

/** `segments.date BETWEEN 'a' AND 'b'`. */
export function dateClause(range: DateRange): string {
    return `segments.date BETWEEN ${gaqlString(range.startDate)} AND ${gaqlString(range.endDate)}`
}

/** Accept only numeric ids (campaign, ad group), to keep them out of string literals. */
export function assertNumericId(value: string, label: string): string {
    const trimmed = value.trim()
    if (!/^\d+$/.test(trimmed)) {
        throw new Error(`${label} must be a numeric id, got "${value}"`)
    }
    return trimmed
}

/**
 * Guard for caller-written GAQL.
 *
 * The search endpoint cannot mutate anything, so this is not a security
 * boundary. It exists to fail fast with a clear message when a caller passes
 * something that is not a GAQL query at all.
 */
export function assertSelectQuery(query: string): string {
    const trimmed = query.trim().replace(/;+\s*$/, '')
    if (!/^select\s/i.test(trimmed)) {
        throw new Error('GAQL queries must start with SELECT')
    }
    return trimmed
}
