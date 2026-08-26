/**
 * Response formatting
 *
 * Tool results are read by a language model, not a chart. These helpers trim
 * float noise (a CTR of 0.0234567890123 costs tokens and says nothing a reader
 * needs) and stamp every payload with the window it covers, so the model never
 * has to guess which dates a number describes.
 *
 * @module @workspace/mcp-gsc/format
 */

/** Metric fields that arrive as raw floats from the Search Console API. */
type MetricRow = {
    ctr?: number
    position?: number
    currentPosition?: number
    previousPosition?: number
    positionDelta?: number
    avgCtr?: number
    avgPosition?: number
}

/** Round to a fixed number of decimals without trailing-zero noise. */
function round(value: number, decimals: number): number {
    const factor = 10 ** decimals
    return Math.round(value * factor) / factor
}

/**
 * Round the float-valued metrics on one row, leaving every other field alone.
 *
 * CTR keeps four decimals (0.0234 = 2.34%); positions keep one, which is all
 * the precision an average rank carries.
 */
function roundMetrics<T>(row: T): T {
    if (row === null || typeof row !== 'object') return row

    const source = row as MetricRow
    const rounded: Record<string, unknown> = { ...(row as object) }

    for (const key of ['ctr', 'avgCtr'] as const) {
        const value = source[key]
        if (typeof value === 'number') rounded[key] = round(value, 4)
    }
    for (const key of [
        'position',
        'avgPosition',
        'currentPosition',
        'previousPosition',
        'positionDelta',
    ] as const) {
        const value = source[key]
        if (typeof value === 'number') rounded[key] = round(value, 1)
    }

    return rounded as T
}

/** Recursively round metrics across arrays, objects and nested result shapes. */
function normalize(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(normalize)
    if (value !== null && typeof value === 'object') {
        const rounded = roundMetrics(value) as Record<string, unknown>
        for (const [key, nested] of Object.entries(rounded)) {
            if (nested !== null && typeof nested === 'object') {
                rounded[key] = normalize(nested)
            }
        }
        return rounded
    }
    return value
}

/** The date window a result covers, echoed back with every payload. */
export type ResultWindow = {
    startDate: string
    endDate: string
    days: number
}

/**
 * Render a tool result as a JSON payload wrapped in the window it covers.
 *
 * @param data - The service-layer result
 * @param window - The date range the data was pulled for, when applicable
 */
export function formatResult(data: unknown, window?: ResultWindow): string {
    const payload = window ? { window, data: normalize(data) } : normalize(data)
    return JSON.stringify(payload, null, 2)
}
