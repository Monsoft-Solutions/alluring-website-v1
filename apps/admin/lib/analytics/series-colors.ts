export const SERIES_PALETTE = [
    '#C38B6B', // terracotta
    '#B58A3A', // gold
    '#2F6F88', // ocean
    '#6B8A6B', // sage
    '#8A5A7D', // plum
    '#A85C3A', // rust
    '#3F8A88', // teal
    '#9A7D88', // mauve
    '#7D7A58', // olive
    '#4F5D6D', // slate
] as const

export const SPECIAL_COLORS = {
    direct: '#78716c', // stone-500
} as const

function hashString(value: string): number {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}

export type SeriesColor = { color: string; opacity: number }

/**
 * Deterministic seriesKey → color mapping. Stable across renders.
 *   - 'direct'           → muted stone.
 *   - 'referral/<host>'  → palette color at 0.7 opacity.
 *   - anything else      → palette color at 1.0 opacity.
 */
export function resolveSeriesColor(key: string): SeriesColor {
    if (key === 'direct') return { color: SPECIAL_COLORS.direct, opacity: 1 }
    const paletteIndex = hashString(key) % SERIES_PALETTE.length
    const color = SERIES_PALETTE[paletteIndex]!
    const opacity = key.startsWith('referral/') ? 0.7 : 1
    return { color, opacity }
}
