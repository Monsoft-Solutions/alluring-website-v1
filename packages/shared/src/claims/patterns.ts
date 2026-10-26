/**
 * The forbidden-claim regex list (claims canon §11), typed.
 *
 * The rules are data in `patterns.data.json`, generated from the canon by
 * `scripts/generate-claim-patterns.mjs`, so the Python blog tools read the
 * same file without a JS build. The patterns are Python `re` syntax that is
 * also valid JavaScript, run case-insensitively.
 *
 * A hit means a person or the Opus pass reviews it, unless the rule's
 * severity is `fail`. `paired` rules fail unless the paired check in their
 * note passes (the Florida statement in the same block, a study named in the
 * sentence…); this module reports the hit and leaves the check to the caller.
 *
 * Kept off the client: import it from server code, scripts and tests only.
 *
 * @module @workspace/shared/claims/patterns
 */
import data from './patterns.data.json'

export type ClaimPatternSeverity = 'fail' | 'paired' | 'review'

export type ClaimPatternGroup =
    | 'credentials'
    | 'facility'
    | 'experience'
    | 'prices'
    | 'superlatives'
    | 'travel'
    | 'medical'
    | 'contact'

/** Where a rule runs: visible text, title fields only, or source strings. */
export type ClaimPatternScope = 'text' | 'title' | 'source'

export interface ClaimPattern {
    /** The canon's id: `CR1`, `PR17`… */
    id: string
    group: ClaimPatternGroup
    /** Python `re` / JavaScript source, without flags. */
    pattern: string
    severity: ClaimPatternSeverity
    /** The canon's verdict label, verbatim: "fail unless sourced". */
    label: string
    /** The canon's note: false positives, the paired check. */
    note: string
    scope: ClaimPatternScope
    /** A hit that also matches this takes the lower severity (CR9, D1). */
    downgrade?: {
        pattern: string
        severity: ClaimPatternSeverity
        reason: string
    }
}

/** Regex flags every rule runs with. */
export const CLAIM_PATTERN_FLAGS = data.flags

/** Source names replaced with a space before the sweep (`NEUTRAL` in bloglib). */
export const CLAIM_NEUTRALIZERS: readonly string[] = data.neutralizers

export const CLAIM_PATTERNS = data.rules as readonly ClaimPattern[]

/** A rule compiled for scanning (global, case-insensitive). */
export function compileClaimPattern(
    rule: Pick<ClaimPattern, 'pattern'>
): RegExp {
    return new RegExp(rule.pattern, `g${CLAIM_PATTERN_FLAGS}`)
}

/**
 * Strips Markdown link and image targets, keeping labels and alt text, so a
 * URL never trips a rule: `[label](url)` → `label`.
 */
export function stripLinkTargets(text: string): string {
    return text.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
}

/** Replaces the neutralized source names with a space. */
export function neutralizeClaimText(text: string): string {
    return CLAIM_NEUTRALIZERS.reduce(
        (current, source) =>
            current.replace(new RegExp(source, `g${CLAIM_PATTERN_FLAGS}`), ' '),
        text
    )
}

export interface ClaimPatternHit {
    id: string
    severity: ClaimPatternSeverity
    match: string
    /** Offset in the swept (stripped and neutralized) text. */
    index: number
}

export interface FindClaimHitsOptions {
    /** Which scope to run; rules of other scopes are skipped. Default `text`. */
    scope?: ClaimPatternScope
    /** Only these rule ids. */
    ids?: readonly string[]
    /** Strip link targets first. Default `true`. */
    stripLinks?: boolean
}

/**
 * Runs the rules over a text, after stripping link targets and neutralizing
 * source names. Returns every hit with its severity; paired checks are left
 * to the caller.
 */
export function findClaimHits(
    text: string,
    { scope = 'text', ids, stripLinks = true }: FindClaimHitsOptions = {}
): ClaimPatternHit[] {
    const swept = neutralizeClaimText(
        stripLinks ? stripLinkTargets(text) : text
    )
    const hits: ClaimPatternHit[] = []

    for (const rule of CLAIM_PATTERNS) {
        if (rule.scope !== scope) continue
        if (ids && !ids.includes(rule.id)) continue
        const downgrade = rule.downgrade
            ? new RegExp(rule.downgrade.pattern, CLAIM_PATTERN_FLAGS)
            : null

        for (const match of swept.matchAll(compileClaimPattern(rule))) {
            hits.push({
                id: rule.id,
                severity:
                    downgrade && downgrade.test(match[0])
                        ? rule.downgrade!.severity
                        : rule.severity,
                match: match[0],
                index: match.index,
            })
        }
    }

    return hits.sort((a, b) => a.index - b.index)
}
