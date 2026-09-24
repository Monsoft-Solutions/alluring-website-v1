/**
 * Response formatting
 *
 * Results are read by a language model. Pretty-printed JSON spends a line per
 * field, which turns a 100-row search-term report into 1,500 lines. Here, a
 * list of rows prints one row per line, and everything else stays indented.
 *
 * @module @workspace/mcp-google-ads/format
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function render(value: unknown, indent: string): string {
    const inner = `${indent}  `

    if (Array.isArray(value)) {
        if (value.length === 0) return '[]'
        const compact = value.every(
            (item) => isPlainObject(item) || typeof item !== 'object'
        )
        const items = value.map((item) =>
            compact ? JSON.stringify(item) : render(item, inner)
        )
        return `[\n${items.map((item) => `${inner}${item}`).join(',\n')}\n${indent}]`
    }

    if (isPlainObject(value)) {
        const entries = Object.entries(value).filter(
            ([, nested]) => nested !== undefined
        )
        if (entries.length === 0) return '{}'
        const lines = entries.map(
            ([key, nested]) =>
                `${inner}${JSON.stringify(key)}: ${render(nested, inner)}`
        )
        return `{\n${lines.join(',\n')}\n${indent}}`
    }

    return JSON.stringify(value) ?? 'null'
}

/** Render a tool result as JSON, one row per line for row lists. */
export function formatResult(data: unknown): string {
    return render(data, '')
}
