/**
 * GAQL row normalization
 *
 * The REST API answers in a shape that is awkward to read: nested, camelCased,
 * int64 metrics as strings, money in micros, and zero values omitted entirely
 * (proto3 drops defaults). Rows are flattened here to the GAQL field names the
 * caller selected, with every selected field present.
 *
 * @module @workspace/google-ads — rows
 */
import type { FlatRow, RawRow } from './google-ads.type.js'

/**
 * Metrics reported in micros whose names carry no `_micros` suffix. Without
 * this list, an average CPC of $4.21 would read as 4,210,000.
 */
const MICROS_WITHOUT_SUFFIX = new Set([
    'metrics.average_cpc',
    'metrics.average_cpm',
    'metrics.average_cpe',
    'metrics.average_cpv',
    'metrics.average_cost',
    'metrics.cost_per_conversion',
    'metrics.cost_per_all_conversions',
    'metrics.cost_per_current_model_attributed_conversion',
])

/** `keywordInfo` → `keyword_info`. */
export function camelToSnake(segment: string): string {
    return segment.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/** `clickView.keywordInfo.text` → `click_view.keyword_info.text`. */
export function toGaqlFieldName(path: string): string {
    return path.split('.').map(camelToSnake).join('.')
}

function round(value: number, decimals: number): number {
    const factor = 10 ** decimals
    return Math.round(value * factor) / factor
}

/** Read a dotted camelCase path out of a nested row. */
function readPath(row: RawRow, path: string): unknown {
    let current: unknown = row
    for (const segment of path.split('.')) {
        if (current === null || typeof current !== 'object') return undefined
        current = (current as Record<string, unknown>)[segment]
    }
    return current
}

/** Collapse a non-scalar value into something a flat row can hold. */
function toScalar(value: unknown): string | number | boolean | null {
    if (value === undefined || value === null) return null
    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return value
    }
    if (
        Array.isArray(value) &&
        value.every((item) => typeof item !== 'object' || item === null)
    ) {
        return value.join(', ')
    }
    return JSON.stringify(value)
}

/**
 * Normalize one selected field into its flat key and value.
 *
 * @param field - GAQL field name (snake_case)
 * @param raw - The value from the response, or undefined when omitted
 */
export function normalizeField(
    field: string,
    raw: unknown
): [string, string | number | boolean | null] {
    const isMetric = field.startsWith('metrics.')

    if (field.endsWith('_micros') || MICROS_WITHOUT_SUFFIX.has(field)) {
        const key = field.replace(/_micros$/, '')
        if (raw === undefined || raw === null) return [key, isMetric ? 0 : null]
        return [key, round(Number(raw) / 1_000_000, 2)]
    }

    if (isMetric) {
        if (raw === undefined || raw === null) return [field, 0]
        const numeric = typeof raw === 'string' ? Number(raw) : raw
        if (typeof numeric === 'number' && Number.isFinite(numeric)) {
            return [
                field,
                Number.isInteger(numeric) ? numeric : round(numeric, 4),
            ]
        }
        return [field, toScalar(raw)]
    }

    return [field, toScalar(raw)]
}

/** Flatten every leaf of a nested row — the fallback when no field mask came back. */
function flattenLeaves(value: unknown, prefix: string, out: string[]): void {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        for (const [key, nested] of Object.entries(value)) {
            if (key === 'resourceName') continue
            flattenLeaves(nested, prefix ? `${prefix}.${key}` : key, out)
        }
        return
    }
    out.push(prefix)
}

/**
 * Flatten one REST row to the fields the query selected.
 *
 * @param row - The raw result row
 * @param fieldMask - The response's `fieldMask` (comma-separated camelCase paths)
 */
export function flattenRow(row: RawRow, fieldMask?: string): FlatRow {
    const paths = fieldMask
        ? fieldMask
              .split(',')
              .map((path) => path.trim())
              .filter(Boolean)
        : (() => {
              const leaves: string[] = []
              flattenLeaves(row, '', leaves)
              return leaves
          })()

    const flat: FlatRow = {}
    for (const path of paths) {
        const [key, value] = normalizeField(
            toGaqlFieldName(path),
            readPath(row, path)
        )
        flat[key] = value
    }
    return flat
}
