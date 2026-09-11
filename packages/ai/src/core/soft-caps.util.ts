/**
 * Soft Length Caps
 *
 * The `.max()` caps on generated prose, lists and scores are display
 * preferences, not correctness invariants (issue #223): Google truncates a
 * long meta description itself, a 612-character review summary is still a
 * review, and a score of 104 means 100. `coreGenerateObject` gives the model
 * one repair retry against the strict schema first; when that also misses,
 * this trims the rejected answer into shape instead of failing the call.
 *
 * Only caps are soft. A missing field, a wrong type, or a string or list
 * shorter than its minimum is structurally broken — there is nothing to trim,
 * so those still fail.
 *
 * @module @workspace/ai/core/soft-caps.util
 */
import type { z } from 'zod'

/** A cut is allowed no earlier than this share of the cap, else hard-cut. */
const MIN_CUT_RATIO = 0.6

/** Fixing one cap can expose another (a sliced list's items); bound the loop. */
const MAX_COERCION_PASSES = 3

/** A rejected answer brought inside its schema, and what was cut to get there. */
export type SoftCapCoercion<T> = {
    object: T
    /** One line per trimmed value, e.g. `excerpt: 331→298 chars` */
    coercions: string[]
}

type ZodIssue = z.core.$ZodIssue

// ============================================
// Truncation
// ============================================

/**
 * Cut text to `max` characters without splitting a word: at the last sentence
 * end if one sits past 60% of the cap, else at the last space, else hard.
 * Trailing punctuation left dangling by a mid-clause cut is dropped.
 */
export function truncateAtWordBoundary(text: string, max: number): string {
    const trimmed = text.trim()
    if (trimmed.length <= max) return trimmed

    const window = trimmed.slice(0, max)
    const floor = Math.floor(max * MIN_CUT_RATIO)

    const lastSentenceEnd = Math.max(
        window.lastIndexOf('. '),
        window.lastIndexOf('! '),
        window.lastIndexOf('? '),
        window.endsWith('.') || window.endsWith('!') || window.endsWith('?')
            ? window.length - 1
            : -1
    )
    if (lastSentenceEnd >= floor) return window.slice(0, lastSentenceEnd + 1)

    const lastSpace = window.lastIndexOf(' ')
    const cut = lastSpace >= floor ? window.slice(0, lastSpace) : window
    return cut.replace(/[\s,;:—–-]+$/u, '')
}

// ============================================
// Coercion
// ============================================

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Parse model text as JSON, tolerating a markdown code fence around it. */
function parseJsonLeniently(text: string | undefined): unknown {
    const trimmed = text?.trim()
    if (!trimmed) return undefined

    const unfenced = trimmed
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
    try {
        return JSON.parse(unfenced)
    } catch {
        return undefined
    }
}

/**
 * The answer as given, plus its inner object when it came wrapped under a
 * single junk key (#191) — a wrapped answer can also be over a cap, which the
 * no-extra-call unwrap cannot rescue on its own.
 */
function candidatesOf(parsed: unknown): unknown[] {
    const candidates = [parsed]
    if (isPlainObject(parsed)) {
        const keys = Object.keys(parsed)
        const inner = keys.length === 1 ? parsed[keys[0]!] : undefined
        if (isPlainObject(inner)) candidates.push(inner)
    }
    return candidates
}

function valueAt(root: unknown, path: readonly PropertyKey[]): unknown {
    let node = root
    for (const key of path) {
        if (typeof node !== 'object' || node === null) return undefined
        node = (node as Record<PropertyKey, unknown>)[key]
    }
    return node
}

function withValueAt(
    root: unknown,
    path: readonly PropertyKey[],
    value: unknown
): unknown {
    if (path.length === 0) return value
    const parent = valueAt(root, path.slice(0, -1))
    if (typeof parent === 'object' && parent !== null) {
        ;(parent as Record<PropertyKey, unknown>)[path[path.length - 1]!] =
            value
    }
    return root
}

function formatPath(path: readonly PropertyKey[]): string {
    return path.length > 0 ? path.map(String).join('.') : '(root)'
}

/**
 * The trimmed value for one validation issue, or null when the issue is not a
 * cap (or the value is not what the cap expects) and so cannot be trimmed.
 * Exclusive bounds (`.lt()`, `.gt()`) have no single value to clamp to, so
 * they stay hard.
 */
function trimToCap(
    issue: ZodIssue,
    value: unknown
): { value: unknown; note: string } | null {
    if (issue.code === 'too_big' && typeof issue.maximum === 'number') {
        const max = issue.maximum
        if (issue.origin === 'string' && typeof value === 'string') {
            const cut = truncateAtWordBoundary(value, max)
            return { value: cut, note: `${value.length}→${cut.length} chars` }
        }
        if (issue.origin === 'array' && Array.isArray(value)) {
            return {
                value: value.slice(0, max),
                note: `${value.length}→${max} items`,
            }
        }
        if (
            (issue.origin === 'number' || issue.origin === 'int') &&
            typeof value === 'number' &&
            issue.inclusive !== false
        ) {
            return { value: max, note: `${value}→${max}` }
        }
    }

    if (
        issue.code === 'too_small' &&
        typeof issue.minimum === 'number' &&
        (issue.origin === 'number' || issue.origin === 'int') &&
        typeof value === 'number' &&
        issue.inclusive !== false
    ) {
        return { value: issue.minimum, note: `${value}→${issue.minimum}` }
    }

    return null
}

function coerceValue<TSchema extends z.ZodType>(
    value: unknown,
    schema: TSchema
): SoftCapCoercion<z.infer<TSchema>> | null {
    let current = structuredClone(value)
    const coercions: string[] = []

    for (let pass = 0; pass < MAX_COERCION_PASSES; pass++) {
        const result = schema.safeParse(current)
        if (result.success) {
            return { object: result.data as z.infer<TSchema>, coercions }
        }

        // Deepest first: an over-long list item must be cut before the list
        // is sliced, or the write would land past the new end and regrow it.
        const deepestFirst = [...result.error.issues].sort(
            (a, b) => b.path.length - a.path.length
        )
        for (const issue of deepestFirst) {
            const trimmed = trimToCap(issue, valueAt(current, issue.path))
            if (!trimmed) return null
            current = withValueAt(current, issue.path, trimmed.value)
            coercions.push(`${formatPath(issue.path)}: ${trimmed.note}`)
        }
    }

    return null
}

/**
 * Bring a rejected answer inside its schema by trimming what is over a cap:
 * prose is cut at a sentence or word boundary, lists are sliced, numbers are
 * clamped. The result is re-validated against the strict schema, so it is
 * returned only if trimming alone made it valid.
 *
 * @param text - The raw text the model returned
 * @param schema - The strict schema the answer must satisfy
 * @returns The valid object and the list of cuts, or null when anything
 *   other than a cap is wrong
 *
 * @example
 * ```typescript
 * const coerced = coerceToSchema(error.text, contentMetadataSchema)
 * // { object: { excerpt: '…298 chars…', … }, coercions: ['excerpt: 331→298 chars'] }
 * ```
 */
export function coerceToSchema<TSchema extends z.ZodType>(
    text: string | undefined,
    schema: TSchema
): SoftCapCoercion<z.infer<TSchema>> | null {
    const parsed = parseJsonLeniently(text)
    if (parsed === undefined) return null

    for (const candidate of candidatesOf(parsed)) {
        const coerced = coerceValue(candidate, schema)
        if (coerced) return coerced
    }
    return null
}
